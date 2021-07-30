import inquirer from 'inquirer'

import { AddOptions, DynamicOptions, StaticOptions } from './add-options'
import { CommandType } from '../executable'
import Validators from '../validators'

export default class AddPrompts {
  static async getName(existingName?: string): Promise<string> {
    const { name }: { name: string } = await inquirer.prompt({
      name: 'name',
      message: `${AddOptions.Name.value.description}:`,
      type: 'input',
      default: existingName,
      validate: Validators.required,
    })
    return name
  }

  static async getCommandType(existingCommandType?: CommandType): Promise<CommandType> {
    const { type }: { type: CommandType } = await inquirer.prompt({
      name: 'type',
      message: 'Command type of executable (see definitions above):',
      type: 'list',
      default: existingCommandType || CommandType.Static,
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
    return type
  }

  static async getCommand(existingCommand?: string): Promise<string> {
    const { command }: { command: string } = await inquirer.prompt({
      name: 'command',
      message: `${StaticOptions.Command.value.description}:`,
      type: 'input',
      default: existingCommand,
      validate: Validators.required,
    })
    return command
  }

  static async getDirectory(existingDirectory?: string): Promise<string> {
    const { directory }: { directory: string } = await inquirer.prompt({
      name: 'directory',
      message: `${DynamicOptions.Directory.value.description}:`,
      type: 'input',
      default: existingDirectory,
      validate: Validators.required,
    })
    return directory
  }

  static async getRegex(existingRegex?: string): Promise<string> {
    const { regex }: { regex: string } = await inquirer.prompt({
      name: 'regex',
      message: `${DynamicOptions.Regex.value.description}:`,
      type: 'input',
      default: existingRegex,
    })
    return regex
  }

  static async getExecutableCorrect(): Promise<boolean> {
    const { executableCorrect }: { executableCorrect: boolean } = await inquirer.prompt({
      name: 'executableCorrect',
      message: 'Is the above executable correct?',
      type: 'confirm',
      default: true,
    })
    return executableCorrect
  }

  static async getReattemptDynamic(): Promise<boolean> {
    const { reattempt }: { reattempt: boolean } = await inquirer.prompt({
      name: 'reattempt',
      message: 'Could not resolve dynamic executable due to error above. Reconfigure?',
      type: 'confirm',
      default: true,
    })
    return reattempt
  }

  static async getArgs(existingArgs?: string): Promise<string> {
    const { args }: { args: string } = await inquirer.prompt({
      name: 'args',
      message: `${AddOptions.Arguments.value.description}:`,
      type: 'input',
      default: existingArgs,
    })
    return args
  }

  static async getShellOverride(existingShellOverride?: string): Promise<string> {
    const { shellOverride }: { shellOverride: string } = await inquirer.prompt({
      name: 'shellOverride',
      message: `${AddOptions.ShellOverride.value.description}:`,
      type: 'input',
      default: existingShellOverride,
    })
    return shellOverride
  }

  static async getInstalledRegex(existingInstalledRegex?: string): Promise<string> {
    const { installedRegex }: { installedRegex: string } = await inquirer.prompt({
      name: 'installedRegex',
      message: `${AddOptions.InstalledRegex.value.description}:`,
      type: 'input',
      default: existingInstalledRegex,
      validate: Validators.required,
    })
    return installedRegex
  }

  static async getVersionCorrect(): Promise<boolean> {
    const { versionCorrect }: { versionCorrect: boolean } = await inquirer.prompt({
      name: 'versionCorrect',
      message: 'Is the above version correct?',
      type: 'confirm',
      default: true,
    })
    return versionCorrect
  }

  static async getReattemptVersion(): Promise<boolean> {
    const { reattempt }: { reattempt: boolean } = await inquirer.prompt({
      name: 'reattempt',
      message: 'Could not determine version due to error above. Reconfigure?',
      type: 'confirm',
      default: true,
    })
    return reattempt
  }

  static async getUrl(existingUrl?: string): Promise<string> {
    const { url }: { url: string } = await inquirer.prompt({
      name: 'url',
      message: `${AddOptions.Url.value.description}:`,
      type: 'input',
      default: existingUrl,
      validate: Validators.required,
    })
    return url
  }

  static async getLatestRegex(existingLatestRegex?: string): Promise<string> {
    const { latestRegex }: { latestRegex: string } = await inquirer.prompt({
      name: 'latestRegex',
      message: `${AddOptions.LatestRegex.value.description}:`,
      type: 'input',
      default: existingLatestRegex,
      validate: Validators.required,
    })
    return latestRegex
  }
}
