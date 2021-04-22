import E2eBaseUtil, { BooleanPrompt, ChoicePrompt, StringPrompt } from './e2e-base-util'
import { KEYS } from './interactive-execute'
import { isStatic } from '../../../src/executable'
import Software from '../../../src/software'

export enum ExecutableChoiceOption {
  Static = 'Static',
  Dynamic = 'Dynamic',
}

export interface InstalledReconfiguration {
  command?: string
  args?: string
  regex?: string
  shellOverride?: string
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
  static readonly CHOICES = {
    Executable: {
      question: 'Is the executable file a static name or dynamic (eg includes version in name)',
      options: ExecutableChoiceOption,
    },
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
        currentValue: software.installedRegex,
        defaultValue: defaults && defaults.installedRegex,
      }),
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: software.shellOverride,
        defaultValue: defaults && defaults.shellOverride,
        fallbackValue: KEYS.BACK_SPACE,
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
          currentValue: currentConfig.regex,
          defaultValue: isSoftware(previousConfig)
            ? previousConfig.installedRegex
            : previousConfig && previousConfig.regex,
        }),
        ...E2eBaseUtil.getInputsPrompt({
          currentValue: currentConfig.shellOverride,
          defaultValue: previousConfig && previousConfig.shellOverride,
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
        question: 'Name to identify new software',
        answer: software.name,
        default: defaults && defaults.name,
      },
      {
        choice: this.CHOICES.Executable,
        answer: ExecutableChoiceOption.Static,
        default:
          defaults && defaults.executable && !isStatic(defaults.executable)
            ? ExecutableChoiceOption.Dynamic
            : ExecutableChoiceOption.Static,
      },
      {
        question: 'Command or path to executable (eg git or C:\\Program Files\\Git\\bin\\git.exe)',
        answer: isStatic(software.executable) ? software.executable.command : '',
        default: defaults && defaults.executable && isStatic(defaults.executable) ? defaults.executable.command : '',
      },
      {
        question: 'Arguments to apply to executable to produce version (eg --version)',
        answer: software.args,
        default: defaults && defaults.args,
      },
      {
        question: 'Regex pattern applied to command output to single out installed version (eg version (.*))',
        answer: software.installedRegex,
        default: defaults && defaults.installedRegex,
      },
      {
        question: 'Shell override to use instead of system default shell (eg powershell)',
        answer: software.shellOverride,
        default: defaults && defaults.shellOverride,
      },
      `Installed version: '${installedVersion}'`,
      {
        question: 'Is the above version correct',
        answer: true,
      },
      {
        question: 'URL containing latest version',
        answer: software.url,
        default: defaults && defaults.url,
      },
      {
        question: 'Regex pattern applied to URL contents to single out latest version (eg version (.*))',
        answer: software.latestRegex,
        default: defaults && defaults.latestRegex,
      },
      `Latest version: '${latestVersion}'`,
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
        question: 'Name to identify new software',
        answer: name,
        default: defaults && defaults.name,
      },
    ]
    for (let i = 0; i < installed.length; i++) {
      const currentConfig = installed[i]
      const previousConfig = i > 0 ? installed[i - 1] : defaults
      chunks.push(
        ...[
          {
            choice: this.CHOICES.Executable,
            answer: ExecutableChoiceOption.Static,
            default:
              isSoftware(previousConfig) && !isStatic(previousConfig.executable)
                ? ExecutableChoiceOption.Dynamic
                : ExecutableChoiceOption.Static,
          },
          {
            question: 'Command or path to executable (eg git or C:\\Program Files\\Git\\bin\\git.exe)',
            answer: currentConfig.command,
            default: isSoftware(previousConfig)
              ? isStatic(previousConfig.executable)
                ? previousConfig.executable.command
                : ''
              : previousConfig && previousConfig.command,
          },
          {
            question: 'Arguments to apply to executable to produce version (eg --version)',
            answer: currentConfig.args,
            default: previousConfig && previousConfig.args,
          },
          {
            question: 'Regex pattern applied to command output to single out installed version (eg version (.*))',
            answer: currentConfig.regex,
            default: isSoftware(previousConfig)
              ? previousConfig.installedRegex
              : previousConfig && previousConfig.regex,
          },
          {
            question: 'Shell override to use instead of system default shell (eg powershell)',
            answer: currentConfig.shellOverride === KEYS.BACK_SPACE ? '' : currentConfig.shellOverride,
            default: previousConfig
              ? previousConfig.shellOverride === KEYS.BACK_SPACE
                ? ''
                : previousConfig.shellOverride
              : '',
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
            `Installed version: '${currentConfig.version}'`,
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
              question: 'URL containing latest version',
              answer: currentConfig.url,
              default: previousConfig && previousConfig.url,
            },
            {
              question: 'Regex pattern applied to URL contents to single out latest version (eg version (.*))',
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
              `Latest version: '${currentConfig.version}'`,
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
