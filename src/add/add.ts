import { AddCommands } from './add-options'
import AddPrompts from './add-prompts'
import colors from '../colors'
import { CommandType, Dynamic, getDynamicExecutable, isStatic, Static } from '../executable'
import Software from '../software'
import SoftwareList from '../software-list'

export default class Add {
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
      existingExecutable: existingSoftware?.executable,
      existingArgs: existingSoftware?.args,
      existingShellOverride: existingSoftware?.shellOverride,
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
          executable: installedVersion.executable,
          args: installedVersion.args,
          shellOverride: installedVersion.shellOverride || '',
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

  static async getName({ inputs, existingName }: { inputs?: Inputs; existingName?: string }): Promise<string> {
    let name = ''
    const softwares = await SoftwareList.load()
    let validName = false
    while (!validName) {
      if (inputs && (inputs.name || !inputs.interactive)) {
        name = inputs.name || existingName || ''
      } else {
        name = await AddPrompts.getName(existingName)
      }
      validName = true
      for (const software of softwares) {
        let duplicateName = software.name === name
        if (existingName === software.name && name === existingName) {
          duplicateName = false // editing software, but keeping original name
        }
        if (duplicateName) {
          const message = `Invalid name "${name}", already in use.`
          if (inputs && !inputs.interactive) {
            throw Error(message)
          }
          validName = false
          console.error(colors.red(message))
        }
      }
    }
    return name
  }

  static async configureInstalledVersion({
    inputs,
    existingExecutable,
    existingArgs,
    existingShellOverride,
    existingInstalledRegex,
  }: {
    inputs?: Inputs
    existingExecutable?: Static | Dynamic
    existingArgs?: string
    existingShellOverride?: string
    existingInstalledRegex?: string
  }): Promise<ConfigureInstalledVersionResponse | undefined> {
    const executable = await Add.configureExecutable({
      inputs,
      existingExecutable,
    })

    if (executable) {
      let args
      if (inputs && (inputs.args || !inputs.interactive)) {
        args = inputs.args !== undefined ? inputs.args : existingArgs
      } else {
        args = await AddPrompts.getArgs(existingArgs)
      }

      let shellOverride
      if (inputs && (inputs.shellOverride || !inputs.interactive)) {
        shellOverride = inputs.shellOverride !== undefined ? inputs.shellOverride : existingInstalledRegex
      } else {
        shellOverride = await AddPrompts.getShellOverride(existingShellOverride)
      }

      let installedRegex = ''
      if (inputs && (inputs.installedRegex || !inputs.interactive)) {
        installedRegex = inputs.installedRegex || existingInstalledRegex || ''
      } else {
        installedRegex = await AddPrompts.getInstalledRegex(existingInstalledRegex)
      }

      try {
        const software = new Software({
          name: 'Installed Test',
          executable,
          args,
          shellOverride,
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
            executable,
            args,
            shellOverride,
            installedRegex,
          }
        }
        return Add.configureInstalledVersion({
          existingExecutable: executable,
          existingArgs: args,
          existingShellOverride: shellOverride,
          existingInstalledRegex: installedRegex,
        })
      } catch (err) {
        const message = err.message || err
        if (inputs && !inputs.interactive) {
          throw new Error(`Could not determine installed version: ${message}`)
        }
        console.error(colors.red(message))

        let reattempt = false
        if (!inputs || inputs.interactive) {
          reattempt = await AddPrompts.getReattemptVersion()
        }

        if (reattempt) {
          return Add.configureInstalledVersion({
            existingExecutable: executable,
            existingArgs: args,
            existingShellOverride: shellOverride,
            existingInstalledRegex: installedRegex,
          })
        }
      }
    }
  }

  static async configureExecutable({
    inputs,
    existingExecutable,
  }: {
    inputs?: Inputs
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

    if (type === CommandType.Static) {
      let command = ''
      if (inputs && (inputs.executable || !inputs.interactive)) {
        if (inputs.executable && isStatic(inputs.executable)) {
          command = inputs.executable.command
        } else if (existingExecutable && isStatic(existingExecutable)) {
          command = existingExecutable.command
        }
        if (!command) {
          throw Error(
            `The executable type "${CommandType.Static}" requires a value passed into the "--command" option.`
          )
        }
      } else {
        command = await AddPrompts.getCommand(
          existingExecutable && isStatic(existingExecutable) ? existingExecutable.command : undefined
        )
      }

      return {
        command,
      }
    } else {
      let directory = ''
      if (inputs && (inputs.executable || !inputs.interactive)) {
        if (inputs.executable && !isStatic(inputs.executable)) {
          directory = inputs.executable.directory
        } else if (existingExecutable && !isStatic(existingExecutable)) {
          directory = existingExecutable.directory
        }
        if (!directory) {
          throw Error(
            `The executable type "${CommandType.Dynamic}" requires a value passed into the "--directory" option.`
          )
        }
      } else {
        directory = await AddPrompts.getDirectory()
      }

      let regex = ''
      if (inputs && (inputs.executable || !inputs.interactive)) {
        if (inputs.executable && !isStatic(inputs.executable)) {
          regex = inputs.executable.regex
        } else if (existingExecutable && !isStatic(existingExecutable)) {
          regex = existingExecutable.regex
        }
        if (!regex) {
          throw Error(`The executable type "${CommandType.Dynamic}" requires a value passed into the "--regex" option.`)
        }
      } else {
        regex = await AddPrompts.getRegex()
      }

      try {
        const command = await getDynamicExecutable({
          directory,
          regex,
        })
        console.log(`Resolved executable: "${command}"`)

        let executableCorrect = true
        if (!inputs || inputs.interactive) {
          executableCorrect = await AddPrompts.getExecutableCorrect()
        }

        if (executableCorrect) {
          return {
            directory,
            regex,
          }
        } else {
          return Add.configureExecutable({
            inputs,
            existingExecutable: {
              directory,
              regex,
            },
          })
        }
      } catch (err) {
        const message = err.message || err
        if (inputs && !inputs.interactive) {
          throw new Error(`Could not determine dynamic executable: ${message}`)
        }
        console.error(colors.red(message))

        let reattempt = false
        if (!inputs || inputs.interactive) {
          reattempt = await AddPrompts.getReattemptDynamic()
        }

        if (reattempt) {
          return Add.configureExecutable({
            inputs,
            existingExecutable: {
              directory,
              regex,
            },
          })
        }
        return undefined
      }
    }
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
    let url = ''
    if (inputs && (inputs.url || !inputs.interactive)) {
      url = inputs.url || existingUrl || ''
    } else {
      url = await AddPrompts.getUrl(existingUrl)
    }

    let latestRegex = ''
    if (inputs && (inputs.latestRegex || !inputs.interactive)) {
      latestRegex = inputs.latestRegex || existingLatestRegex || ''
    } else {
      latestRegex = await AddPrompts.getLatestRegex(existingLatestRegex)
    }

    try {
      const software = new Software({
        name: 'Latest Test',
        executable: {
          command: 'false',
        },
        args: '',
        shellOverride: '',
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
        inputs,
        existingUrl: url,
        existingLatestRegex: latestRegex,
      })
    } catch (err) {
      const message = err.message || err
      if (inputs && !inputs.interactive) {
        throw new Error(`Could not determine latest version: ${message}`)
      }
      console.error(colors.red(message))

      let reattempt = false
      if (!inputs || inputs.interactive) {
        reattempt = await AddPrompts.getReattemptVersion()
      }

      if (reattempt) {
        return Add.configureLatestVersion({
          inputs,
          existingUrl: url,
          existingLatestRegex: latestRegex,
        })
      }
    }
  }
}

export interface Inputs {
  name?: string
  executable?: Static | Dynamic
  args?: string | undefined
  shellOverride?: string | undefined
  installedRegex?: string
  url?: string
  latestRegex?: string
  interactive?: boolean
}

interface ConfigureInstalledVersionResponse {
  executable: Static | Dynamic
  args?: string
  shellOverride?: string
  installedRegex: string
}

interface ConfigureLatestVersionResponse {
  url: string
  latestRegex: string
}
