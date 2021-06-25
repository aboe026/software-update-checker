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

  static splitChunksOnNewline(chunks: string[]): string[] {
    const splitChunks: string[] = []
    for (const chunk of chunks) {
      chunk.split(/\\+n/).forEach((splitChunk) => splitChunks.push(splitChunk.replace(/\\+/g, '\\')))
    }
    return splitChunks
  }

  static async getExecutableName(): Promise<string> {
    let executableName = await getExecutableName()
    const nonWindowsStart = './'
    if (executableName.startsWith(nonWindowsStart)) {
      executableName = executableName.substring(nonWindowsStart.length)
    }
    return executableName
  }

  static getGlobalsChunks(): string[] {
    return [
      'Globals:',
      '  -v, --version                Show version number  [boolean] [default: false]',
      '  -h, --help                   Show help  [boolean] [default: false]',
      '  -p, --prompt, --interactive  Whether or not terminal should wait for user input if needed, or exit/error as necessary  [boolean] [default: false]',
    ]
  }

  static async getRootChunks(): Promise<string[]> {
    return [
      `${await getExecutableName()} [add|view|edit|remove]`,
      '',
      'toast edit',
      '',
      'Commands:',
      '  software-update-checker-win.exe [add|view|edit|remove]     toast edit  [default]',
      '  software-update-checker-win.exe add <static|dynamic>       Add software configuration  [aliases: create, configure]',
      '  software-update-checker-win.exe view                       View configured software versions  [aliases: list, read]',
      '  software-update-checker-win.exe edit <existing>            Edit software configuration  [aliases: update, reconfigure]',
      '  software-update-checker-win.exe remove <existing>          Remove software configuration  [aliases: delete]',
      '  software-update-checker-win.exe version                    Show version number',
      '  software-update-checker-win.exe help                       Show help',
      '',
      ...this.getGlobalsChunks(),
    ]
  }

  static async getAddChunks(): Promise<string[]> {
    return [
      `${await getExecutableName()} add <static|dynamic>`,
      '',
      'Add software configuration',
      '',
      'Commands:',
      '  software-update-checker-win.exe add static   Software executable defined by a fixed, non-changing path',
      '                                               (eg executable on $PATH or absolute path to executable file)',
      '  software-update-checker-win.exe add dynamic  Software executable has changing, evolving name requiring regex patterns to determine',
      '                                               (eg executable name includes version, which changes between releases)',
      '',
      ...this.getGlobalsChunks(),
    ]
  }

  static async getStaticChunks(): Promise<string[]> {
    return [
      `${await getExecutableName()} add static`,
      '',
      'Software executable defined by a fixed, non-changing path',
      '(eg executable on $PATH or absolute path to executable file)',
      '',
      ...this.getGlobalsChunks(),
      '',
      'Options:',
      '  -a, --arguments, --args       Arguments to apply to executable to produce version',
      '                                (eg "--version")  [string]',
      '  -c, --command                 Command or path to executable',
      '                                (eg "git" or "C:\\Program Files\\Git\\bin\\git.exe")  [string] [required]',
      '  -i, --installedRegex          Regex pattern applied to executable command output for singling out installed version',
      '                                (eg "version (.*)")  [string] [required]',
      '  -l, --latestRegex             Regex pattern applied to URL contents for singling out latest version',
      '                                (eg "Version (\\d+\\.\\d+(\\.\\d+)?)")  [string] [required]',
      '  -n, --name                    Name to identify software configuration  [string] [required]',
      '  -s, --shellOverride, --shell  Shell to use instead of system default shell',
      '                                (eg "powershell")  [string]',
      '  -u, --url                     URL to call for latest version  [string] [required]',
    ]
  }

  static async getDynamicChunks(): Promise<string[]> {
    return [
      `${await getExecutableName()} add dynamic`,
      '',
      'Software executable has changing, evolving name requiring regex patterns to determine',
      '(eg executable name includes version, which changes between releases)',
      '',
      ...this.getGlobalsChunks(),
      '',
      'Options:',
      '  -a, --arguments, --args       Arguments to apply to executable to produce version',
      '                                (eg "--version")  [string]',
      '  -d, --directory               Path to directory containing executable file',
      '                                (eg "C:\\Program Files\\GIMP 2\\bin")  [string] [required]',
      '  -i, --installedRegex          Regex pattern applied to executable command output for singling out installed version',
      '                                (eg "version (.*)")  [string] [required]',
      '  -l, --latestRegex             Regex pattern applied to URL contents for singling out latest version',
      '                                (eg "Version (\\d+\\.\\d+(\\.\\d+)?)")  [string] [required]',
      '  -n, --name                    Name to identify software configuration  [string] [required]',
      '  -r, --regex                   Regex pattern applied to files in directory for singling out executable file to use',
      '                                (eg "gimp-\\d+\\.\\d+\\.exe")  [string] [required]',
      '  -s, --shellOverride, --shell  Shell to use instead of system default shell',
      '                                (eg "powershell")  [string]',
      '  -u, --url                     URL to call for latest version  [string] [required]',
    ]
  }

  static async getViewChunks(): Promise<string[]> {
    return [
      `${await getExecutableName()} view`,
      '',
      'View configured software versions',
      '',
      ...this.getGlobalsChunks(),
    ]
  }

  static async getEditChunks(): Promise<string[]> {
    return [
      `${await getExecutableName()} edit <existing>`,
      '',
      'Edit software configuration',
      '',
      'Positionals:',
      '  existing  Name of existing software configuration to edit  [string] [required]',
      '',
      ...this.getGlobalsChunks(),
      '',
      'Options:',
      '  -a, --arguments, --args       Arguments to apply to executable to produce version',
      '                                (eg "--version")  [string]',
      '  -c, --command                 Command or path to executable',
      '                                (eg "git" or "C:\\Program Files\\Git\\bin\\git.exe")  [string]',
      '  -d, --directory               Path to directory containing executable file',
      '                                (eg "C:\\Program Files\\GIMP 2\\bin")  [string]',
      '  -i, --installedRegex          Regex pattern applied to executable command output for singling out installed version',
      '                                (eg "version (.*)")  [string]',
      '  -l, --latestRegex             Regex pattern applied to URL contents for singling out latest version',
      '                                (eg "Version (\\d+\\.\\d+(\\.\\d+)?)")  [string]',
      '  -n, --name                    Name to identify software configuration  [string]',
      '  -r, --regex                   Regex pattern applied to files in directory for singling out executable file to use',
      '                                (eg "gimp-\\d+\\.\\d+\\.exe")  [string]',
      '  -s, --shellOverride, --shell  Shell to use instead of system default shell',
      '                                (eg "powershell")  [string]',
      '  -t, --type                    Whether executable to get installed version is fixed or dynamic  [string] [choices: "static", "dynamic"]',
      '  -u, --url                     URL to call for latest version  [string]',
    ]
  }

  static async getRemoveChunks(): Promise<string[]> {
    return [
      `${await getExecutableName()} remove <existing>`,
      '',
      'Remove software configuration',
      '',
      'Positionals:',
      '  existing  Name of existing software configuration to delete  [string] [required]',
      '',
      ...this.getGlobalsChunks(),
    ]
  }
}
