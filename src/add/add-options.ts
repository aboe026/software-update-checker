import { Command, Option } from '../base/base-options'

export const AddCommands = {
  Add: new Command({
    key: 'add',
    value: {
      alias: ['create', 'configure'],
      description: 'Add software configuration',
    },
  }),
  Static: new Command({
    key: 'static',
    value: {
      description:
        'Software executable defined by a fixed, non-changing path (eg executable on $PATH or absolute path to executable file)',
    },
  }),
  Dynamic: new Command({
    key: 'dynamic',
    value: {
      description:
        'Software executable has changing, evolving name requiring regex patterns to determine (eg executable name includes version, which changes between releases)',
    },
  }),
}

export const AddOptions = {
  Name: new Option({
    key: 'name',
    value: {
      alias: 'n',
      description: 'Name to identify software configuration',
      type: 'string',
      demandOption: true,
      requiresArg: true,
      nargs: 1,
    },
  }),
  Arguments: new Option({
    key: 'arguments',
    value: {
      alias: ['a', 'args'],
      description: 'Arguments to apply to executable to produce version (eg "--version")',
      type: 'string',
      demandOption: false,
      requiresArg: true,
      nargs: 1,
    },
  }),
  Shell: new Option({
    key: 'shell',
    value: {
      alias: ['s'],
      description: 'Shell to use instead of system default shell (eg "powershell")',
      type: 'string',
      demandOption: false,
      requiresArg: true,
      nargs: 1,
    },
  }),
  InstalledRegex: new Option({
    key: 'installedRegex',
    value: {
      alias: ['i'],
      description:
        'Regex pattern applied to executable command output for singling out installed version (eg "version (.*)")',
      type: 'string',
      demandOption: true,
      requiresArg: true,
      nargs: 1,
    },
  }),
  Url: new Option({
    key: 'url',
    value: {
      alias: ['u'],
      description: 'URL to call for latest version',
      type: 'string',
      demandOption: true,
      requiresArg: true,
      nargs: 1,
    },
  }),
  LatestRegex: new Option({
    key: 'latestRegex',
    value: {
      alias: ['l'],
      description:
        'Regex pattern applied to URL contents for singling out latest version (eg "Version (\\d+\\.\\d+(\\.\\d+)?)")',
      type: 'string',
      demandOption: true,
      requiresArg: true,
      nargs: 1,
    },
  }),
}

export const StaticOptions = {
  ...AddOptions,
  Command: new Option({
    key: 'command',
    value: {
      alias: 'c',
      description: 'Command or path to executable (eg "git" or "C:\\Program Files\\Git\\bin\\git.exe")',
      type: 'string',
      demandOption: true,
      requiresArg: true,
      nargs: 1,
    },
  }),
}

export const DynamicOptions = {
  ...AddOptions,
  Directory: new Option({
    key: 'directory',
    value: {
      alias: 'd',
      description: 'Path to directory containing executable file (eg "C:\\Program Files\\GIMP 2\\bin")',
      type: 'string',
      demandOption: true,
      requiresArg: true,
      nargs: 1,
    },
  }),
  Regex: new Option({
    key: 'regex',
    value: {
      alias: 'r',
      description:
        'Regex pattern applied to files in directory for singling out executable file to use (eg "gimp-\\d+\\.\\d+\\.exe")',
      type: 'string',
      demandOption: true,
      requiresArg: true,
      nargs: 1,
    },
  }),
}
