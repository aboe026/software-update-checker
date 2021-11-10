import E2eBaseUtil from './e2e-base-util'
import { getExecutableName } from './interactive-execute'

export default class E2eHelpUtil extends E2eBaseUtil {
  static getSilentCommand(subCommands: string[] = []): string[] {
    return subCommands.concat(['help'])
  }

  static getLongOption(subCommands: string[] = []): string[] {
    return subCommands.concat(['--help'])
  }

  static getShortOption(subCommands: string[] = []): string[] {
    return subCommands.concat(['-h'])
  }

  static getSpacesForExecutableName(executableName: string): string {
    let spaces = ''
    for (let i = 0; i < executableName.length; i++) {
      spaces += ' '
    }
    return spaces
  }

  static getGlobalsChunks(): string[] {
    return [
      'Globals:',
      `  -v, --version                ${E2eHelpUtil.MESSAGES.ShowVersion}  [boolean] [default: false]`,
      `  -h, --help                   ${E2eHelpUtil.MESSAGES.ShowHelp}  [boolean] [default: false]`,
      '  -p, --prompt, --interactive  Whether or not terminal should wait for user input if needed, or exit/error as necessary  [boolean] [default: false]',
    ]
  }

  static getRootChunks(): string[] {
    const executableName = getExecutableName()
    return [
      `${executableName} [add|view|edit|remove]`,
      '',
      E2eHelpUtil.MESSAGES.CheckUpdates,
      '',
      'Commands:',
      `  ${executableName} [add|view|edit|remove]     ${E2eHelpUtil.MESSAGES.CheckUpdates}  [default]`,
      `  ${executableName} add <static|dynamic>       ${E2eHelpUtil.MESSAGES.Add}  [aliases: create, configure]`,
      `  ${executableName} view                       ${E2eHelpUtil.MESSAGES.View}  [aliases: list, read]`,
      `  ${executableName} edit <existing>            ${E2eHelpUtil.MESSAGES.Edit}  [aliases: update, reconfigure]`,
      `  ${executableName} remove <existing>          ${E2eHelpUtil.MESSAGES.Delete}  [aliases: delete]`,
      `  ${executableName} version                    ${E2eHelpUtil.MESSAGES.ShowVersion}`,
      `  ${executableName} help                       ${E2eHelpUtil.MESSAGES.ShowHelp}`,
      '',
      ...this.getGlobalsChunks(),
    ]
  }

  static getAddChunks(): string[] {
    const executableName = getExecutableName()
    const spaces = E2eHelpUtil.getSpacesForExecutableName(executableName)
    return [
      `${executableName} add <static|dynamic>`,
      '',
      E2eHelpUtil.MESSAGES.Add,
      '',
      'Commands:',
      `  ${executableName} add static   ${E2eHelpUtil.MESSAGES.Static}`,
      `  ${spaces}              ${E2eHelpUtil.MESSAGES.StaticExample}`,
      `  ${executableName} add dynamic  ${E2eHelpUtil.MESSAGES.Dynamic}`,
      `  ${spaces}              ${E2eHelpUtil.MESSAGES.DynamicExample}`,
      '',
      ...this.getGlobalsChunks(),
    ]
  }

  static getStaticChunks(): string[] {
    return [
      `${getExecutableName()} add static`,
      '',
      E2eHelpUtil.MESSAGES.Static,
      E2eHelpUtil.MESSAGES.StaticExample,
      '',
      ...this.getGlobalsChunks(),
      '',
      'Options:',
      `  -a, --arguments, --args  ${E2eHelpUtil.MESSAGES.Arguments}`,
      `                           ${E2eHelpUtil.MESSAGES.ArgumentsExample}  [string]`,
      `  -c, --command            ${E2eHelpUtil.MESSAGES.Command}`,
      `                           ${E2eHelpUtil.getCommandExampleMessage({})}  [string] [required]`,
      `  -d, --directory, --dir   ${E2eHelpUtil.MESSAGES.Directory}`,
      `                           ${E2eHelpUtil.getDirectoryExampleMessage({})}  [string]`,
      `  -i, --installedRegex     ${E2eHelpUtil.MESSAGES.InstalledRegex}`,
      `                           ${E2eHelpUtil.MESSAGES.InstalledRegexExample}  [string] [required]`,
      `  -l, --latestRegex        ${E2eHelpUtil.MESSAGES.LatestRegex}`,
      `                           ${E2eHelpUtil.MESSAGES.LatestRegexExample}  [string] [required]`,
      `  -n, --name               ${E2eHelpUtil.MESSAGES.Name}`,
      `                           ${E2eHelpUtil.MESSAGES.NameExample}  [string] [required]`,
      `  -s, --shell              ${E2eHelpUtil.MESSAGES.Shell}`,
      `                           ${E2eHelpUtil.MESSAGES.ShellExample}  [string]`,
      `  -u, --url                ${E2eHelpUtil.MESSAGES.Url}`,
      `                           ${E2eHelpUtil.MESSAGES.UrlExample}  [string] [required]`,
    ]
  }

  static getDynamicChunks(): string[] {
    return [
      `${getExecutableName()} add dynamic`,
      '',
      E2eHelpUtil.MESSAGES.Dynamic,
      E2eHelpUtil.MESSAGES.DynamicExample,
      '',
      ...this.getGlobalsChunks(),
      '',
      'Options:',
      `  -a, --arguments, --args  ${E2eHelpUtil.MESSAGES.Arguments}`,
      `                           ${E2eHelpUtil.MESSAGES.ArgumentsExample}  [string]`,
      `  -d, --directory, --dir   ${E2eHelpUtil.MESSAGES.Directory}`,
      `                           ${E2eHelpUtil.getDirectoryExampleMessage({})}  [string]`,
      `  -i, --installedRegex     ${E2eHelpUtil.MESSAGES.InstalledRegex}`,
      `                           ${E2eHelpUtil.MESSAGES.InstalledRegexExample}  [string] [required]`,
      `  -l, --latestRegex        ${E2eHelpUtil.MESSAGES.LatestRegex}`,
      `                           ${E2eHelpUtil.MESSAGES.LatestRegexExample}  [string] [required]`,
      `  -n, --name               ${E2eHelpUtil.MESSAGES.Name}`,
      `                           ${E2eHelpUtil.MESSAGES.NameExample}  [string] [required]`,
      `  -r, --regex              ${E2eHelpUtil.MESSAGES.Regex}`,
      `                           ${E2eHelpUtil.getRegexExampleMessage({})}  [string] [required]`,
      `  -s, --shell              ${E2eHelpUtil.MESSAGES.Shell}`,
      `                           ${E2eHelpUtil.MESSAGES.ShellExample}  [string]`,
      `  -u, --url                ${E2eHelpUtil.MESSAGES.Url}`,
      `                           ${E2eHelpUtil.MESSAGES.UrlExample}  [string] [required]`,
    ]
  }

  static getViewChunks(): string[] {
    return [`${getExecutableName()} view`, '', E2eHelpUtil.MESSAGES.View, '', ...this.getGlobalsChunks()]
  }

  static getEditChunks(): string[] {
    return [
      `${getExecutableName()} edit <existing>`,
      '',
      E2eHelpUtil.MESSAGES.Edit,
      '',
      'Positionals:',
      '  existing  Name of existing software configuration to edit  [string] [required]',
      '',
      ...this.getGlobalsChunks(),
      '',
      'Options:',
      `  -a, --arguments, --args  ${E2eHelpUtil.MESSAGES.Arguments}`,
      `                           ${E2eHelpUtil.MESSAGES.ArgumentsExample}  [string]`,
      `  -c, --command            ${E2eHelpUtil.MESSAGES.Command}`,
      `                           ${E2eHelpUtil.getCommandExampleMessage({})}  [string]`,
      `  -d, --directory, --dir   ${E2eHelpUtil.MESSAGES.Directory}`,
      `                           ${E2eHelpUtil.getDirectoryExampleMessage({})}  [string]`,
      `  -i, --installedRegex     ${E2eHelpUtil.MESSAGES.InstalledRegex}`,
      `                           ${E2eHelpUtil.MESSAGES.InstalledRegexExample}  [string]`,
      `  -l, --latestRegex        ${E2eHelpUtil.MESSAGES.LatestRegex}`,
      `                           ${E2eHelpUtil.MESSAGES.LatestRegexExample}  [string]`,
      `  -n, --name               ${E2eHelpUtil.MESSAGES.Name}`,
      `                           ${E2eHelpUtil.MESSAGES.NameExample}  [string]`,
      `  -r, --regex              ${E2eHelpUtil.MESSAGES.Regex}`,
      `                           ${E2eHelpUtil.getRegexExampleMessage({})}  [string]`,
      `  -s, --shell              ${E2eHelpUtil.MESSAGES.Shell}`,
      `                           ${E2eHelpUtil.MESSAGES.ShellExample}  [string]`,
      '  -t, --type               Whether executable to get installed version is fixed or dynamic  [string] [choices: "static", "dynamic"]',
      `  -u, --url                ${E2eHelpUtil.MESSAGES.Url}`,
      `                           ${E2eHelpUtil.MESSAGES.UrlExample}  [string]`,
    ]
  }

  static getRemoveChunks(): string[] {
    return [
      `${getExecutableName()} remove <existing>`,
      '',
      E2eHelpUtil.MESSAGES.Delete,
      '',
      'Positionals:',
      '  existing  Name of existing software configuration to delete  [string] [required]',
      '',
      ...this.getGlobalsChunks(),
    ]
  }
}
