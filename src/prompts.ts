import cliProgress from 'cli-progress'
import colors from 'colors'
import fetch from 'node-fetch'
import fs from 'fs-extra'
import { exec } from 'child_process'
import inquirer from 'inquirer'
import path from 'path'
import { promisify } from 'util'
import Table from 'cli-table3'

import Software from './software'
import SoftwareList from './software-list'
import Validators from './validators'

const execa = promisify(exec)

export default class Prompts {
  static async home(): Promise<void> {
    while (true) {
      const { action } = await inquirer.prompt({
        name: 'action',
        message: 'Select action to perform:',
        type: 'list',
        choices: [
          {
            name: 'Add New Software',
            value: 'add',
          },
          {
            name: 'View Installed Softwares',
            value: 'view',
          },
          {
            name: 'Edit Software Configuration',
            value: 'edit',
          },
          {
            name: 'Delete Software Configuration',
            value: 'delete',
          },
          {
            name: 'Exit',
            value: 'exit',
          },
        ],
      })
      switch (action) {
        case 'add':
          await Prompts.configure()
          break
        case 'view':
          await Prompts.view()
          break
        case 'edit':
          await Prompts.edit()
          break
        case 'delete':
          await Prompts.delete()
          break
        case 'exit':
          process.exit(0)
      }
    }
  }

  static async configure(existingSoftware?: Software): Promise<void> {
    let name = ''
    const softwares = await SoftwareList.load()
    let validName = false
    while (!validName) {
      ;({ name } = await inquirer.prompt({
        name: 'name',
        message: 'Name to identify new software:',
        type: 'input',
        default: (existingSoftware && existingSoftware.name) || undefined,
        validate: Validators.required,
      }))
      validName = true
      for (const software of softwares) {
        if (software.name === name && existingSoftware && existingSoftware.name !== name) {
          validName = false
          console.log(`Invalid name '${name}', already in use.`.red)
        }
      }
    }
    const installedVersion: ConfigureInstalledVersionResponse | undefined = await Prompts.configureInstalledVersion({
      existingType: existingSoftware?.command ? CommandType.Static : CommandType.Dynamic,
      existingCommandDir: existingSoftware?.commandDir,
      existingDirRegex: existingSoftware?.dirRegex,
      existingCommand: existingSoftware?.command,
      existingArgs: existingSoftware?.args,
      existingRegex: existingSoftware?.installedRegex,
    })
    if (installedVersion) {
      const latestVersion = await Prompts.configureLatestVersion({
        existingUrl: existingSoftware?.url,
        existingRegex: existingSoftware?.latestRegex,
      })
      if (latestVersion) {
        const software: Software = new Software({
          name,
          commandDir: installedVersion.commandDir,
          dirRegex: installedVersion.dirRegex,
          args: installedVersion.args,
          command: installedVersion.command,
          installedRegex: installedVersion.regex,
          url: latestVersion.url,
          latestRegex: latestVersion.regex,
        })
        if (existingSoftware) {
          await SoftwareList.edit(existingSoftware, software)
        } else {
          await SoftwareList.add(software)
        }
      }
    }
  }

  static async configureInstalledVersion({
    existingType,
    existingCommandDir,
    existingDirRegex,
    existingArgs,
    existingCommand,
    existingRegex,
  }: {
    existingType?: CommandType
    existingCommandDir?: string
    existingDirRegex?: string
    existingArgs?: string
    existingCommand?: string
    existingRegex?: string
  }): Promise<ConfigureInstalledVersionResponse | undefined> {
    let commandDir,
      dirRegex,
      args, // eslint-disable-line prefer-const
      command,
      resolvedCommand,
      regex = ''
    const { type }: { type: CommandType } = await inquirer.prompt({
      name: 'type',
      message: 'Is the executable file a static name or dynamic (eg includes version in name):',
      type: 'list',
      default: existingType || undefined,
      choices: [
        {
          name: 'Static',
          value: CommandType.Static,
        },
        {
          name: 'Dynamic',
          value: CommandType.Dynamic,
        },
      ],
    })
    if (type === CommandType.Dynamic) {
      ;({ commandDir, dirRegex } = await inquirer.prompt([
        {
          name: 'commandDir',
          message: 'Directory path containing dynamic executable',
          type: 'input',
          default: existingCommandDir || undefined,
          validate: Validators.required,
        },
        {
          name: 'dirRegex',
          message:
            'Regex pattern applied to files in directory above to single out executable file to use (eg gimp-\\d+\\.\\d+\\.exe):',
          type: 'input',
          default: existingDirRegex || undefined,
        },
      ]))
      try {
        if (!(await fs.pathExists(commandDir))) {
          throw Error(`Directory path specified '${commandDir}' does not exist. Please specify a valid directory path.`)
        }
        const files = await fs.readdir(commandDir)
        for (const file of files) {
          if (!resolvedCommand && new RegExp(dirRegex).test(file)) {
            resolvedCommand = path.join(commandDir, file)
          }
        }
        if (!resolvedCommand) {
          throw Error(`Could not find any file in directory '${commandDir}' matching regex pattern '${dirRegex}'`)
        }
        console.log(`Resolved executable: '${resolvedCommand}'`)
        const { executableCorrect }: { executableCorrect: boolean } = await inquirer.prompt({
          name: 'executableCorrect',
          message: 'Is the above executable correct?',
          type: 'confirm',
          default: true,
        })
        if (!executableCorrect) {
          return Prompts.configureInstalledVersion({
            existingType: type,
            existingCommandDir: commandDir,
            existingDirRegex: dirRegex,
            existingArgs: args,
          })
        }
      } catch (err) {
        console.log(colors['red'](err.message || err))
        const { reattempt }: { reattempt: boolean } = await inquirer.prompt({
          name: 'reattempt',
          message: 'Could not resolve dynamic executable due to error above. Reconfigure?',
          type: 'confirm',
          default: true,
        })
        if (reattempt) {
          return Prompts.configureInstalledVersion({
            existingType: CommandType.Dynamic,
            existingCommandDir: commandDir,
            existingDirRegex: dirRegex,
            existingArgs: args,
          })
        }
        return undefined
      }
    } else {
      ;({ command } = await inquirer.prompt({
        name: 'command',
        message: 'Command or path to executable (eg git or C:\\Program Files\\Git\\bin\\git.exe):',
        type: 'input',
        default: existingCommand || undefined,
        validate: Validators.required,
      }))
    }
    ;({ args, regex } = await inquirer.prompt([
      {
        name: 'args',
        message: 'Arguments to apply to dynamic executable to produce version (eg --version):',
        type: 'input',
        default: existingArgs || undefined,
      },
      {
        name: 'regex',
        message: 'Regex pattern applied to command output to single out installed version (eg version (.*)):',
        type: 'input',
        default: existingRegex || undefined,
        validate: Validators.required,
      },
    ]))
    try {
      const executable = type === CommandType.Static ? command : resolvedCommand
      const { stdout, stderr }: { stdout: string; stderr: string } = await execa(
        `${path.basename(executable)} ${args}`,
        {
          cwd: path.dirname(executable),
        }
      )
      if (stderr && !stdout) {
        throw Error(stderr)
      } else {
        const matches = stdout.match(new RegExp(regex))
        if (!matches || !Array.isArray(matches) || matches.length < 2) {
          throw Error(`No matches found for regex '${regex}' in command output: '${stdout}'`)
        } else {
          console.log(`Installed version: '${matches[1]}'`)
          const { versionCorrect }: { versionCorrect: boolean } = await inquirer.prompt({
            name: 'versionCorrect',
            message: 'Is the above version correct?',
            type: 'confirm',
            default: true,
          })
          if (versionCorrect) {
            return {
              type: CommandType.Static,
              commandDir,
              args,
              dirRegex,
              command,
              regex,
            }
          }
          return Prompts.configureInstalledVersion({
            existingType: CommandType.Static,
            existingCommandDir: commandDir,
            existingDirRegex: dirRegex,
            existingCommand: command,
            existingArgs: args,
            existingRegex: regex,
          })
        }
      }
    } catch (err) {
      console.log(colors['red'](err.message || err))
      const { reattempt }: { reattempt: boolean } = await inquirer.prompt({
        name: 'reattempt',
        message: 'Could not determine version due to error above. Reconfigure?',
        type: 'confirm',
        default: true,
      })
      if (reattempt) {
        return Prompts.configureInstalledVersion({
          existingType: type,
          existingCommandDir: commandDir,
          existingDirRegex: dirRegex,
          existingCommand: command,
          existingArgs: args,
          existingRegex: regex,
        })
      }
    }
  }

  static async configureLatestVersion({
    existingUrl,
    existingRegex,
  }: {
    existingUrl?: string
    existingRegex?: string
  }): Promise<ConfigureLatestVersionResponse | undefined> {
    const { url, regex }: { url: string; regex: string } = await inquirer.prompt([
      {
        name: 'url',
        message: 'URL containing latest version:',
        type: 'input',
        default: existingUrl || undefined,
        validate: Validators.required,
      },
      {
        name: 'regex',
        message: 'Regex pattern applied to URL contents to single out latest version (eg version (.*)):',
        type: 'input',
        default: existingRegex || undefined,
        validate: Validators.required,
      },
    ])
    try {
      const response = await fetch(url)
      const text = await response.text()
      if (!text) {
        throw Error(`No response received for URL '${url}'`)
      }
      const matches = text.match(new RegExp(regex))
      if (!matches || !Array.isArray(matches) || matches.length < 2) {
        throw Error(`No matches found for regex '${regex}' in URL contents: '${text}'`)
      } else {
        console.log(`Latest version: '${matches[1]}'`)
        const { versionCorrect }: { versionCorrect: boolean } = await inquirer.prompt({
          name: 'versionCorrect',
          message: 'Is the above version correct?',
          type: 'confirm',
          default: true,
        })
        if (versionCorrect) {
          return {
            url,
            regex,
          }
        }
        return Prompts.configureLatestVersion({
          existingUrl: url,
          existingRegex: regex,
        })
      }
    } catch (err) {
      console.log(colors['red'](err.message || err))
      const { reattempt }: { reattempt: boolean } = await inquirer.prompt({
        name: 'reattempt',
        message: 'Could not determine version due to error above. Reconfigure?',
        type: 'confirm',
        default: true,
      })
      if (reattempt) {
        return Prompts.configureLatestVersion({
          existingUrl: url,
          existingRegex: regex,
        })
      }
    }
  }

  static async view(): Promise<void> {
    const softwares = await SoftwareList.load()
    const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    progress.start(softwares.length, 0)
    const table = new Table({
      head: ['Name'.white, 'Installed'.white, 'Latest'.white],
    })
    for (const software of softwares) {
      let installed,
        latest,
        installedError,
        latestError = ''
      let color = colors.white
      try {
        installed = await software.getInstalledVersion()
      } catch (err) {
        installedError = err.message || err
      }
      try {
        latest = await software.getLatestVersion()
      } catch (err) {
        latestError = err.message || err
      }
      if (installedError || latestError || !installed || !latest) {
        color = colors.red
      } else if (installed !== latest) {
        color = colors.green
      }
      table.push([color(software.name), color(installedError || installed || ''), color(latestError || latest || '')])
      progress.increment()
    }

    progress.stop()
    console.table(table.toString())
  }

  static async edit(): Promise<void> {
    const softwares = await SoftwareList.load()
    const { nameToEdit } = await inquirer.prompt({
      name: 'nameToEdit',
      message: 'Select configured software to edit:',
      type: 'list',
      choices: softwares.map((software) => {
        return {
          name: software.name,
          value: software.name,
        }
      }),
    })
    await Prompts.configure(softwares.find((software) => software.name === nameToEdit))
  }

  static async delete(): Promise<void> {
    const softwares = await SoftwareList.load()
    const { nameToDelete } = await inquirer.prompt({
      name: 'nameToDelete',
      message: 'Select configured software to delete:',
      type: 'list',
      choices: softwares.map((software) => {
        return {
          name: software.name,
          value: software.name,
        }
      }),
    })
    const { deleteConfirmed } = await inquirer.prompt({
      name: 'deleteConfirmed',
      message: `Are you sure you want to delete '${nameToDelete}'?`,
      type: 'confirm',
      default: true,
    })
    if (deleteConfirmed) {
      await SoftwareList.delete(nameToDelete)
    }
  }
}

enum CommandType {
  Static = 'static',
  Dynamic = 'dynamic',
}

interface ConfigureInstalledVersionResponse {
  type: CommandType
  commandDir: string
  dirRegex: string
  args: string
  command: string
  regex: string
}

interface ConfigureLatestVersionResponse {
  url: string
  regex: string
}
