import cliProgress from 'cli-progress'
import colors from 'colors'
import inquirer from 'inquirer'
import Table from 'cli-table3'

import { Dynamic, Static, isStatic, getDynamicExecutable } from './executable'
import Software from './software'
import SoftwareList from './software-list'
import Validators from './validators'

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
      existingExecutable: existingSoftware?.executable,
      existingArgs: existingSoftware?.args,
      existingInstalledRegex: existingSoftware?.installedRegex,
    })
    if (installedVersion) {
      const latestVersion = await Prompts.configureLatestVersion({
        existingUrl: existingSoftware?.url,
        existingRegex: existingSoftware?.latestRegex,
      })
      if (latestVersion) {
        const software: Software = new Software({
          name,
          executable: installedVersion.executable,
          args: installedVersion.args,
          installedRegex: installedVersion.installedRegex,
          url: latestVersion.url,
          latestRegex: latestVersion.latestRegex,
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
    existingExecutable,
    existingArgs,
    existingInstalledRegex,
  }: {
    existingExecutable?: Static | Dynamic
    existingArgs?: string
    existingInstalledRegex?: string
  }): Promise<ConfigureInstalledVersionResponse | undefined> {
    let executable: Static | Dynamic
    const { type }: { type: CommandType } = await inquirer.prompt({
      name: 'type',
      message: 'Is the executable file a static name or dynamic (eg includes version in name):',
      type: 'list',
      default: existingExecutable && !isStatic(existingExecutable) ? CommandType.Dynamic : CommandType.Static,
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
      const { directory, regex } = await inquirer.prompt([
        {
          name: 'directory',
          message: 'Directory path containing dynamic executable',
          type: 'input',
          default: existingExecutable && !isStatic(existingExecutable) ? existingExecutable.directory : undefined,
          validate: Validators.required,
        },
        {
          name: 'regex',
          message:
            'Regex pattern applied to files in directory above to single out executable file to use (eg gimp-\\d+\\.\\d+\\.exe):',
          type: 'input',
          default: existingExecutable && !isStatic(existingExecutable) ? existingExecutable.regex : undefined,
        },
      ])
      try {
        const command = await getDynamicExecutable({
          directory,
          regex,
        })
        console.log(`Resolved executable: '${command}'`)
        const { executableCorrect }: { executableCorrect: boolean } = await inquirer.prompt({
          name: 'executableCorrect',
          message: 'Is the above executable correct?',
          type: 'confirm',
          default: true,
        })
        if (executableCorrect) {
          executable = {
            directory,
            regex,
          }
        } else {
          return Prompts.configureInstalledVersion({
            existingExecutable: {
              directory,
              regex,
            },
            existingArgs,
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
            existingExecutable: {
              directory,
              regex,
            },
            existingArgs,
          })
        }
        return undefined
      }
    } else {
      executable = {
        command: (
          await inquirer.prompt({
            name: 'command',
            message: 'Command or path to executable (eg git or C:\\Program Files\\Git\\bin\\git.exe):',
            type: 'input',
            default: existingExecutable && isStatic(existingExecutable) ? existingExecutable.command : undefined,
            validate: Validators.required,
          })
        ).command,
      }
    }
    const { args, installedRegex } = await inquirer.prompt([
      {
        name: 'args',
        message: 'Arguments to apply to dynamic executable to produce version (eg --version):',
        type: 'input',
        default: existingArgs || undefined,
      },
      {
        name: 'installedRegex',
        message: 'Regex pattern applied to command output to single out installed version (eg version (.*)):',
        type: 'input',
        default: existingInstalledRegex || undefined,
        validate: Validators.required,
      },
    ])
    try {
      const software = new Software({
        name: 'Installed Test',
        executable,
        args,
        installedRegex,
        url: '',
        latestRegex: '',
      })
      console.log(`Installed version: '${await software.getInstalledVersion()}'`)
      const { versionCorrect }: { versionCorrect: boolean } = await inquirer.prompt({
        name: 'versionCorrect',
        message: 'Is the above version correct?',
        type: 'confirm',
        default: true,
      })
      if (versionCorrect) {
        return {
          executable,
          args,
          installedRegex,
        }
      }
      return Prompts.configureInstalledVersion({
        existingExecutable: executable,
        existingArgs: args,
        existingInstalledRegex: installedRegex,
      })
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
          existingExecutable: executable,
          existingArgs: args,
          existingInstalledRegex: installedRegex,
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
    const { url, latestRegex }: { url: string; latestRegex: string } = await inquirer.prompt([
      {
        name: 'url',
        message: 'URL containing latest version:',
        type: 'input',
        default: existingUrl || undefined,
        validate: Validators.required,
      },
      {
        name: 'latestRegex',
        message: 'Regex pattern applied to URL contents to single out latest version (eg version (.*)):',
        type: 'input',
        default: existingRegex || undefined,
        validate: Validators.required,
      },
    ])
    try {
      const software = new Software({
        name: 'Latest Test',
        executable: {
          command: 'false',
        },
        args: '',
        installedRegex: '',
        url,
        latestRegex,
      })
      const latestVersion = await software.getLatestVersion()
      console.log(`Latest version: '${latestVersion}'`)
      const { versionCorrect }: { versionCorrect: boolean } = await inquirer.prompt({
        name: 'versionCorrect',
        message: 'Is the above version correct?',
        type: 'confirm',
        default: true,
      })
      if (versionCorrect) {
        return {
          url,
          latestRegex,
        }
      }
      return Prompts.configureLatestVersion({
        existingUrl: url,
        existingRegex: latestRegex,
      })
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
          existingRegex: latestRegex,
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
  executable: Static | Dynamic
  args: string
  installedRegex: string
}

interface ConfigureLatestVersionResponse {
  url: string
  latestRegex: string
}
