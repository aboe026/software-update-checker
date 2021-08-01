import E2eBaseUtil, { BooleanPrompt, ChoicePrompt, StringPrompt } from './e2e-base-util'
import { KEYS } from './interactive-execute'
import { isStatic } from '../../../src/software/executable'
import Software from '../../../src/software/software'

export enum ExecutableChoiceOption {
  Static = 'Static',
  Dynamic = 'Dynamic',
}

export interface InstalledReconfiguration {
  command?: string
  args?: string
  shell?: string
  regex?: string
  error?: string
  version?: string
  confirmOrReconfigure?: boolean
}

export interface LatestReconfiguration {
  url?: string
  regex?: string
  error?: string
  version?: string
  confirmOrReconfigure?: boolean
}

export default class E2eAddUtil extends E2eBaseUtil {
  static readonly MESSAGES = {
    CommandTypes: [
      'Command types:',
      'Static - Software executable defined by a fixed, non-changing path (eg executable on $PATH or absolute path to executable file).',
      'Dynamic - Software executable has changing, evolving name requiring regex patterns to determine (eg executable name includes version, which changes between releases).',
    ],
  }
  static readonly CHOICES = {
    Executable: {
      question: 'Command type of executable (see definitions above)',
      options: ExecutableChoiceOption,
    },
  }

  static getInstalledErrorMessage(error: string): string {
    return `Could not determine installed version: ${error}`
  }

  static getLatestErrorMessage(error: string): string {
    return `Could not determine latest version: ${error}`
  }

  static getSilentCommand({ software }: { software: Software }): string[] {
    const args: string[] = [
      'add',
      isStatic(software.executable) ? 'static' : 'dynamic',
      `--name="${software.name}"`,
      `--installedRegex="${software.installedRegex}"`,
      `--url="${software.url}"`,
      `--latestRegex="${software.latestRegex}"`,
    ]
    if (isStatic(software.executable)) {
      args.push(`--command="${software.executable.command}"`)
    } else {
      args.push(`--directory="${software.executable.directory}"`)
      args.push(`--regex="${software.executable.regex}"`)
    }
    if (software.args) {
      args.push(`--args="${software.args}"`)
    }
    if (software.shell) {
      args.push(`--shell="${software.shell}"`)
    }
    return args
  }

  static getInputs({ software, defaults }: { software: Software; defaults?: Software }): string[] {
    return [
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: software.name,
        defaultValue: defaults && defaults.name,
      }),
      KEYS.Enter, // static
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: isStatic(software.executable) ? software.executable.command : '',
        defaultValue: defaults && isStatic(defaults.executable) ? defaults.executable.command : '',
      }),
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: software.args,
        defaultValue: defaults && defaults.args,
      }),
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: software.shell,
        defaultValue: defaults && defaults.shell,
        fallbackValue: KEYS.BACK_SPACE,
      }),
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: software.installedRegex,
        defaultValue: defaults && defaults.installedRegex,
      }),
      KEYS.Enter, // installed version correct
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: software.url,
        defaultValue: defaults && defaults.url,
      }),
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: software.latestRegex,
        defaultValue: defaults && defaults.latestRegex,
      }),
      KEYS.Enter, // latest version correct
    ]
  }

  static getInputsReconfigure({
    name,
    installed,
    latest = [],
    defaults,
  }: {
    name: string
    installed: InstalledReconfiguration[]
    latest?: LatestReconfiguration[]
    defaults?: Software
  }): string[] {
    const inputs: string[] = [
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: name,
      }),
    ]

    for (let i = 0; i < installed.length; i++) {
      const currentConfig = installed[i]
      const previousConfig = i === 0 ? defaults : installed[i - 1]
      inputs.push(
        KEYS.Enter,
        ...E2eBaseUtil.getInputsPrompt({
          currentValue: currentConfig.command,
          defaultValue: isSoftware(previousConfig)
            ? isStatic(previousConfig.executable)
              ? previousConfig.executable.command
              : ''
            : previousConfig && previousConfig.command,
        }),
        ...E2eBaseUtil.getInputsPrompt({
          currentValue: currentConfig.args,
          defaultValue: previousConfig && previousConfig.args,
        }),
        ...E2eBaseUtil.getInputsPrompt({
          currentValue: currentConfig.shell,
          defaultValue: previousConfig && previousConfig.shell,
        }),
        ...E2eBaseUtil.getInputsPrompt({
          currentValue: currentConfig.regex,
          defaultValue: isSoftware(previousConfig)
            ? previousConfig.installedRegex
            : previousConfig && previousConfig.regex,
        }),
        ...(currentConfig.confirmOrReconfigure ? [KEYS.Enter] : ['No', KEYS.Enter])
      )
    }

    if (installed[installed.length - 1].confirmOrReconfigure) {
      for (let i = 0; i < latest.length; i++) {
        const currentConfig = latest[i]
        const previousConfig = i === 0 ? defaults : latest[i - 1]
        inputs.push(
          ...E2eBaseUtil.getInputsPrompt({
            currentValue: currentConfig.url,
            defaultValue: previousConfig && previousConfig.url,
          }),
          ...E2eBaseUtil.getInputsPrompt({
            currentValue: currentConfig.regex,
            defaultValue: isSoftware(previousConfig)
              ? previousConfig.latestRegex
              : previousConfig && previousConfig.regex,
          }),
          ...(currentConfig.confirmOrReconfigure ? [KEYS.Enter] : ['No', KEYS.Enter])
        )
      }
    }

    return inputs
  }

  static getChunksSilent({
    installedVersion,
    latestVersion,
  }: {
    installedVersion: string
    latestVersion: string
  }): (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] {
    return [`Installed version: "${installedVersion}"`, `Latest version: "${latestVersion}"`]
  }

  static getChunks({
    software,
    installedVersion,
    latestVersion,
    defaults,
  }: {
    software: Software
    installedVersion: string
    latestVersion: string
    defaults?: Software
  }): (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] {
    return [
      {
        question: 'Name to identify software configuration',
        answer: software.name,
        default: defaults && defaults.name,
      },
      ...this.MESSAGES.CommandTypes,
      {
        choice: this.CHOICES.Executable,
        answer: ExecutableChoiceOption.Static,
      },
      {
        question: 'Command or path to executable (eg "git" or "C:\\Program Files\\Git\\bin\\git.exe")',
        answer: isStatic(software.executable) ? software.executable.command : '',
        default:
          defaults && defaults.executable && isStatic(defaults.executable) ? defaults.executable.command : undefined,
      },
      {
        question: 'Arguments to apply to executable to produce version (eg "--version")',
        answer: software.args,
        default: defaults && defaults.args,
      },
      {
        question: 'Shell to use instead of system default shell (eg "powershell")',
        answer: software.shell,
        default: defaults && defaults.shell,
      },
      {
        question:
          'Regex pattern applied to executable command output for singling out installed version (eg "version (.*)")',
        answer: software.installedRegex,
        default: defaults && defaults.installedRegex,
      },
      `Installed version: "${installedVersion}"`,
      {
        question: 'Is the above version correct',
        answer: true,
      },
      {
        question: 'URL to call for latest version',
        answer: software.url,
        default: defaults && defaults.url,
      },
      {
        question:
          'Regex pattern applied to URL contents for singling out latest version (eg "Version (\\d+\\.\\d+(\\.\\d+)?)")',
        answer: software.latestRegex,
        default: defaults && defaults.latestRegex,
      },
      `Latest version: "${latestVersion}"`,
      {
        question: 'Is the above version correct',
        answer: true,
      },
    ]
  }

  static getChunksReconfigure({
    name,
    defaults,
    installed,
    latest,
  }: {
    name: string
    defaults?: Software
    installed: InstalledReconfiguration[]
    latest: LatestReconfiguration[]
  }): (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] {
    const chunks: (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] = [
      {
        question: 'Name to identify software configuration',
        answer: name,
        default: defaults && defaults.name,
      },
    ]
    for (let i = 0; i < installed.length; i++) {
      const currentConfig = installed[i]
      const previousConfig = i > 0 ? installed[i - 1] : defaults
      chunks.push(
        ...[
          ...this.MESSAGES.CommandTypes,
          {
            choice: this.CHOICES.Executable,
            answer: ExecutableChoiceOption.Static,
          },
          {
            question: 'Command or path to executable (eg "git" or "C:\\Program Files\\Git\\bin\\git.exe")',
            answer: currentConfig.command,
            default: isSoftware(previousConfig)
              ? isStatic(previousConfig.executable)
                ? previousConfig.executable.command
                : undefined
              : previousConfig && previousConfig.command,
          },
          {
            question: 'Arguments to apply to executable to produce version (eg "--version")',
            answer: currentConfig.args,
            default: previousConfig && previousConfig.args,
          },
          {
            question: 'Shell to use instead of system default shell (eg "powershell")',
            answer: currentConfig.shell === KEYS.BACK_SPACE ? '' : currentConfig.shell,
            default: previousConfig
              ? previousConfig.shell === KEYS.BACK_SPACE
                ? ''
                : previousConfig.shell
              : undefined,
          },
          {
            question:
              'Regex pattern applied to executable command output for singling out installed version (eg "version (.*)")',
            answer: currentConfig.regex,
            default: isSoftware(previousConfig)
              ? previousConfig.installedRegex
              : previousConfig && previousConfig.regex,
          },
        ]
      )
      if (currentConfig.error) {
        chunks.push(
          ...[
            currentConfig.error,
            {
              question: 'Could not determine version due to error above. Reconfigure',
              answer: currentConfig.confirmOrReconfigure === true,
            },
          ]
        )
      } else {
        chunks.push(
          ...[
            `Installed version: "${currentConfig.version}"`,
            {
              question: 'Is the above version correct',
              answer: currentConfig.confirmOrReconfigure === true,
            },
          ]
        )
      }
    }
    if (installed[installed.length - 1].confirmOrReconfigure) {
      for (let i = 0; i < latest.length; i++) {
        const currentConfig = latest[i]
        const previousConfig = i > 0 ? latest[i - 1] : defaults
        chunks.push(
          ...[
            {
              question: 'URL to call for latest version',
              answer: currentConfig.url,
              default: previousConfig && previousConfig.url,
            },
            {
              question:
                'Regex pattern applied to URL contents for singling out latest version (eg "Version (\\d+\\.\\d+(\\.\\d+)?)")',
              answer: currentConfig.regex,
              default: isSoftware(previousConfig) ? previousConfig.latestRegex : previousConfig && previousConfig.regex,
            },
          ]
        )
        if (currentConfig.error) {
          chunks.push(
            ...[
              currentConfig.error,
              {
                question: 'Could not determine version due to error above. Reconfigure',
                answer: currentConfig.confirmOrReconfigure === true,
              },
            ]
          )
        } else {
          chunks.push(
            ...[
              `Latest version: "${currentConfig.version}"`,
              {
                question: 'Is the above version correct',
                answer: currentConfig.confirmOrReconfigure === true,
              },
            ]
          )
        }
      }
    }
    return chunks
  }
}

function isSoftware(
  reconfiguration: Software | InstalledReconfiguration | LatestReconfiguration | undefined
): reconfiguration is Software {
  if (reconfiguration === undefined) {
    return false
  }
  return (reconfiguration as Software).executable !== undefined
}
