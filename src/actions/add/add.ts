import fs from 'fs-extra'

import { AddCommands, AddOptions } from './add-options'
import AddPrompts from './add-prompts'
import Base from '../base/base'
import colors from '../../util/colors'
import { CommandType, Dynamic, getDynamicExecutable, isStatic, Static } from '../../software/executable'
import Software from '../../software/software'
import SoftwareList from '../../software/software-list'

export default class Add extends Base {
  static async configure({
    inputs,
    existingSoftware,
  }: {
    inputs?: Inputs
    existingSoftware?: Software
  }): Promise<void> {
    const name = await Add.getName({
      inputs,
      existingName: existingSoftware?.name,
    })
    const installedVersion: ConfigureInstalledVersionResponse | undefined = await Add.configureInstalledVersion({
      inputs,
      existingShell: existingSoftware?.shell,
      existingDirectory: existingSoftware?.directory,
      existingExecutable: existingSoftware?.executable,
      existingArgs: existingSoftware?.args,
      existingInstalledRegex: existingSoftware?.installedRegex,
    })
    if (installedVersion) {
      const latestVersion: ConfigureLatestVersionResponse | undefined = await Add.configureLatestVersion({
        inputs,
        existingUrl: existingSoftware?.url,
        existingLatestRegex: existingSoftware?.latestRegex,
      })
      if (latestVersion) {
        const software: Software = new Software({
          name,
          shell: installedVersion.shell,
          directory: installedVersion.directory,
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

  static isNameDuplicate({
    newName,
    potentialConflictName,
    existingName,
  }: {
    newName: string
    potentialConflictName: string
    existingName?: string
  }): boolean {
    let duplicate = newName === potentialConflictName
    if (existingName && newName === existingName && existingName === potentialConflictName) {
      duplicate = false // editing software, but keeping original name
    }
    return duplicate
  }

  static async getName({ inputs, existingName }: { inputs?: Inputs; existingName?: string }): Promise<string> {
    const softwares = await SoftwareList.load()

    let name = ''
    if (inputs && (inputs.name || !inputs.interactive)) {
      name = inputs.name || existingName || ''
    } else {
      name = await AddPrompts.getName(existingName)
    }
    if (!name) {
      throw Error(Add.getMissingRequiredOptionErrorMessage(AddOptions.Name.key))
    }

    for (const software of softwares) {
      if (
        Add.isNameDuplicate({
          newName: name,
          potentialConflictName: software.name,
          existingName,
        })
      ) {
        const message = `Invalid name "${name}", already in use.`
        if (inputs && !inputs.interactive) {
          throw Error(message)
        }
        console.error(colors.red(message))
        return Add.getName({
          existingName,
        })
      }
    }

    return name
  }

  static async configureInstalledVersion({
    inputs,
    existingShell,
    existingDirectory,
    existingExecutable,
    existingArgs,
    existingInstalledRegex,
  }: {
    inputs?: Inputs
    existingShell?: string | undefined
    existingDirectory: string | undefined
    existingExecutable?: Static | Dynamic
    existingArgs?: string | undefined
    existingInstalledRegex?: string
  }): Promise<ConfigureInstalledVersionResponse | undefined> {
    const shell = await Add.getShell({
      inputs,
      existingShell,
    })

    const directory = await Add.getDirectory({
      inputs,
      existingDirectory,
    })

    const executable = await Add.configureExecutable({
      inputs,
      directory,
      existingExecutable,
    })

    if (executable) {
      const args = await Add.getArgs({
        inputs,
        existingArgs,
      })
      const installedRegex = await Add.getInstalledRegex({
        inputs,
        existingInstalledRegex,
      })

      try {
        const software = new Software({
          name: 'Installed Test',
          shell,
          directory,
          executable,
          args,
          installedRegex,
          url: '',
          latestRegex: '',
        })
        console.log(`Installed version: "${await software.getInstalledVersion()}"`)

        let versionCorrect = true
        if (!inputs || inputs.interactive) {
          versionCorrect = await AddPrompts.getVersionCorrect()
        }

        if (versionCorrect) {
          return {
            shell,
            directory,
            executable,
            args,
            installedRegex,
          }
        }
        return Add.configureInstalledVersion({
          existingShell: shell,
          existingDirectory: directory,
          existingExecutable: executable,
          existingArgs: args,
          existingInstalledRegex: installedRegex,
        })
      } catch (err: any) {
        const message = err.message || err
        if (inputs && !inputs.interactive) {
          throw new Error(`Could not determine installed version: ${message}`)
        }
        console.error(colors.red(message))

        const reattempt = await AddPrompts.getReattemptVersion()
        if (reattempt) {
          return Add.configureInstalledVersion({
            existingShell: shell,
            existingDirectory: directory,
            existingExecutable: executable,
            existingArgs: args,
            existingInstalledRegex: installedRegex,
          })
        }
      }
    }
  }

  static async getDirectory({
    inputs,
    existingDirectory,
  }: {
    inputs?: Inputs
    existingDirectory?: string
  }): Promise<string> {
    let directory
    if (inputs && (inputs.directory || !inputs.interactive)) {
      directory = inputs.directory !== undefined ? inputs.directory : existingDirectory
    } else {
      directory = await AddPrompts.getDirectory(existingDirectory)
    }
    if (!(await Add.doesOptionalPathExist({ directory }))) {
      const message = `Invalid directory "${directory}", does not exist.`
      if (inputs && !inputs.interactive) {
        throw Error(message)
      }
      console.error(colors.red(message))
      return Add.getDirectory({
        existingDirectory,
      })
    }
    return directory || ''
  }

  static async doesOptionalPathExist({ directory }: { directory: string | undefined }): Promise<boolean> {
    if (directory) {
      return fs.pathExists(directory)
    }
    return true
  }

  static async getShell({ inputs, existingShell }: { inputs?: Inputs; existingShell?: string }): Promise<string> {
    let shell
    if (inputs && (inputs.shell || !inputs.interactive)) {
      shell = inputs.shell !== undefined ? inputs.shell : existingShell
    } else {
      shell = await AddPrompts.getShell(existingShell)
    }
    return shell || ''
  }

  static async configureExecutable({
    inputs,
    directory,
    existingExecutable,
  }: {
    inputs?: Inputs
    directory: string
    existingExecutable?: Static | Dynamic
  }): Promise<Static | Dynamic | undefined> {
    let type: CommandType

    if (inputs && (inputs.executable || !inputs.interactive)) {
      let isStaticType = true
      if (inputs.executable) {
        isStaticType = isStatic(inputs.executable)
      } else if (existingExecutable) {
        isStaticType = isStatic(existingExecutable)
      }
      type = isStaticType ? CommandType.Static : CommandType.Dynamic
    } else {
      console.log('Command types:')
      console.log(`Static - ${AddCommands.Static.value.description}.`)
      console.log(`Dynamic - ${AddCommands.Dynamic.value.description}.`)
      type = await AddPrompts.getCommandType(
        existingExecutable && !isStatic(existingExecutable) ? CommandType.Dynamic : CommandType.Static
      )
    }

    return type === CommandType.Static
      ? Add.configureStatic({
          inputs,
          existingCommand: existingExecutable && isStatic(existingExecutable) ? existingExecutable.command : undefined,
        })
      : Add.configureDynamic({
          inputs,
          directory,
          existingRegex: existingExecutable && !isStatic(existingExecutable) ? existingExecutable.regex : undefined,
        })
  }

  static async configureStatic({
    inputs,
    existingCommand,
  }: {
    inputs?: Inputs
    existingCommand?: string
  }): Promise<Static> {
    let command = ''

    if (inputs && (inputs.executable || !inputs.interactive)) {
      if (inputs.executable && isStatic(inputs.executable)) {
        command = inputs.executable.command
      } else if (existingCommand) {
        command = existingCommand
      }
      if (!command) {
        throw Error(`The executable type "${CommandType.Static}" requires a value passed into the "--command" option.`)
      }
    } else {
      command = await AddPrompts.getCommand(existingCommand)
    }

    return {
      command,
    }
  }

  static async configureDynamic({
    inputs,
    directory,
    existingRegex,
  }: {
    inputs?: Inputs
    directory: string
    existingRegex?: string
  }): Promise<Dynamic | undefined> {
    const regex = await Add.getRegex({
      inputs,
      directory,
      existingRegex,
    })

    try {
      const command = await getDynamicExecutable({
        directory,
        regex,
      })
      console.log(`Resolved executable file: "${command}"`)

      let executableCorrect = true
      if (!inputs || inputs.interactive) {
        executableCorrect = await AddPrompts.getExecutableCorrect()
      }

      if (executableCorrect) {
        return {
          regex,
        }
      } else {
        return Add.configureDynamic({
          directory,
          existingRegex: regex,
        })
      }
    } catch (err: any) {
      const message = err.message || err
      if (inputs && !inputs.interactive) {
        throw new Error(`Could not determine dynamic executable: ${message}`)
      }
      console.error(colors.red(message))

      const reattempt = await AddPrompts.getReattemptDynamic()
      if (reattempt) {
        return Add.configureDynamic({
          directory,
          existingRegex: regex,
        })
      }
      return undefined
    }
  }

  static async getRegex({
    inputs,
    directory,
    existingRegex,
  }: {
    inputs?: Inputs
    directory?: string
    existingRegex?: string
  }): Promise<string> {
    let regex = ''

    if (inputs && (inputs.executable || !inputs.interactive)) {
      if (inputs.executable && !isStatic(inputs.executable)) {
        regex = inputs.executable.regex
      }
      if (!regex && existingRegex) {
        regex = existingRegex
      }
    } else {
      regex = await AddPrompts.getRegex({
        directory,
        existingRegex,
      })
    }
    if (!regex) {
      throw Error(`The executable type "${CommandType.Dynamic}" requires a value passed into the "--regex" option.`)
    }
    return regex
  }

  static async getArgs({ inputs, existingArgs }: { inputs?: Inputs; existingArgs?: string }): Promise<string> {
    let args
    if (inputs && (inputs.args || !inputs.interactive)) {
      args = inputs.args !== undefined ? inputs.args : existingArgs
    } else {
      args = await AddPrompts.getArgs(existingArgs)
    }
    return args || ''
  }

  static async getInstalledRegex({
    inputs,
    existingInstalledRegex,
  }: {
    inputs?: Inputs
    existingInstalledRegex?: string
  }): Promise<string> {
    let installedRegex = ''
    if (inputs && (inputs.installedRegex || !inputs.interactive)) {
      installedRegex = inputs.installedRegex || existingInstalledRegex || ''
    } else {
      installedRegex = await AddPrompts.getInstalledRegex(existingInstalledRegex)
    }
    if (!installedRegex) {
      throw Error(Add.getMissingRequiredOptionErrorMessage(AddOptions.InstalledRegex.key))
    }
    return installedRegex
  }

  static async configureLatestVersion({
    inputs,
    existingUrl,
    existingLatestRegex,
  }: {
    inputs?: Inputs
    existingUrl?: string
    existingLatestRegex?: string
  }): Promise<ConfigureLatestVersionResponse | undefined> {
    const url = await Add.getUrl({
      inputs,
      existingUrl,
    })
    const latestRegex = await Add.getLatestRegex({
      inputs,
      existingLatestRegex,
    })

    try {
      const software = new Software({
        name: 'Latest Test',
        shell: '',
        directory: '',
        executable: {
          command: 'false',
        },
        args: '',
        installedRegex: '',
        url,
        latestRegex,
      })
      const latestVersion = await software.getLatestVersion()
      console.log(`Latest version: "${latestVersion}"`)

      let versionCorrect = true
      if (!inputs || inputs.interactive) {
        versionCorrect = await AddPrompts.getVersionCorrect()
      }

      if (versionCorrect) {
        return {
          url,
          latestRegex,
        }
      }
      return Add.configureLatestVersion({
        existingUrl: url,
        existingLatestRegex: latestRegex,
      })
    } catch (err: any) {
      const message = err.message || err
      if (inputs && !inputs.interactive) {
        throw new Error(`Could not determine latest version: ${message}`)
      }
      console.error(colors.red(message))

      const reattempt = await AddPrompts.getReattemptVersion()
      if (reattempt) {
        return Add.configureLatestVersion({
          existingUrl: url,
          existingLatestRegex: latestRegex,
        })
      }
    }
  }

  static async getUrl({ inputs, existingUrl }: { inputs?: Inputs; existingUrl?: string }): Promise<string> {
    let url = ''
    if (inputs && (inputs.url || !inputs.interactive)) {
      url = inputs.url || existingUrl || ''
    } else {
      url = await AddPrompts.getUrl(existingUrl)
    }
    if (!url) {
      throw Error(Add.getMissingRequiredOptionErrorMessage(AddOptions.Url.key))
    }
    return url
  }

  static async getLatestRegex({
    inputs,
    existingLatestRegex,
  }: {
    inputs?: Inputs
    existingLatestRegex?: string
  }): Promise<string> {
    let latestRegex = ''
    if (inputs && (inputs.latestRegex || !inputs.interactive)) {
      latestRegex = inputs.latestRegex || existingLatestRegex || ''
    } else {
      latestRegex = await AddPrompts.getLatestRegex(existingLatestRegex)
    }
    if (!latestRegex) {
      throw Error(Add.getMissingRequiredOptionErrorMessage(AddOptions.LatestRegex.key))
    }
    return latestRegex
  }
}

export interface Inputs {
  name?: string
  shell?: string | undefined
  directory?: string | undefined
  executable?: Static | Dynamic
  args?: string | undefined
  installedRegex?: string
  url?: string
  latestRegex?: string
  interactive?: boolean
}

export interface ConfigureInstalledVersionResponse {
  shell: string
  directory: string
  executable: Static | Dynamic
  args: string
  installedRegex: string
}

interface ConfigureLatestVersionResponse {
  url: string
  latestRegex: string
}
