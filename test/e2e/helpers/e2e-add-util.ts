import E2eBaseUtil, { BooleanPrompt, ChoicePrompt, StringPrompt } from './e2e-base-util'
import { getExecutableName, KEYS } from './interactive-execute'
import { isStatic } from '../../../src/software/executable'
import Software from '../../../src/software/software'
import TestUtil from '../../helpers/test-util'

export enum ExecutableChoiceOption {
  Static = 'Static',
  Dynamic = 'Dynamic',
}

export interface InstalledReconfiguration {
  name?: string
  shell?: string
  directory?: string
  command?: string
  args?: string
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
      `--name=${software.name}`,
      `--installedRegex=${software.installedRegex}`,
      `--url=${software.url}`,
      `--latestRegex=${software.latestRegex}`,
    ]
    if (software.shell) {
      args.push(`--shell=${software.shell}`)
    }
    if (software.directory) {
      args.push(`--directory=${software.directory}`)
    }
    if (isStatic(software.executable)) {
      args.push(`--command=${software.executable.command}`)
    } else {
      args.push(`--regex=${software.executable.regex}`)
    }
    if (software.args) {
      args.push(`--args=${software.args}`)
    }
    return args
  }

  static getInputs({ software, defaults }: { software: Software; defaults?: Software }): string[] {
    return [
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: software.name,
        defaultValue: defaults && defaults.name,
      }),
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: software.shell,
        defaultValue: defaults && defaults.shell,
        fallbackValue: KEYS.BACK_SPACE,
      }),
      ...E2eBaseUtil.getInputsPrompt({
        currentValue: software.directory,
        defaultValue: defaults && defaults.directory,
        fallbackValue: KEYS.BACK_SPACE,
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
    installed,
    latest = [],
    defaults,
  }: {
    installed: InstalledReconfiguration[]
    latest?: LatestReconfiguration[]
    defaults?: Software
  }): string[] {
    const inputs: string[] = []
    for (let i = 0; i < installed.length; i++) {
      const currentConfig = installed[i]
      const previousConfig = i === 0 ? defaults : installed[i - 1]
      if (currentConfig.name !== undefined) {
        inputs.push(
          ...E2eBaseUtil.getInputsPrompt({
            currentValue: currentConfig.name,
          })
        )
      }
      if (currentConfig.shell !== undefined) {
        inputs.push(
          ...E2eBaseUtil.getInputsPrompt({
            currentValue: currentConfig.shell,
            defaultValue: previousConfig && previousConfig.shell,
          })
        )
      }
      if (currentConfig.directory !== undefined) {
        inputs.push(
          ...E2eBaseUtil.getInputsPrompt({
            currentValue: currentConfig.directory,
            defaultValue: previousConfig && previousConfig.directory,
          })
        )
      }
      if (currentConfig.command !== undefined) {
        inputs.push(
          KEYS.Enter, // static
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
          ...(currentConfig.confirmOrReconfigure ? [KEYS.Enter] : ['No', KEYS.Enter])
        )
      }
    }

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
    executableDirectory,
    executableFile,
  }: {
    software: Software
    installedVersion: string
    latestVersion: string
    defaults?: Software
    executableDirectory?: string
    executableFile?: string
  }): (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] {
    return [
      {
        question: `${E2eAddUtil.MESSAGES.Name} ${E2eAddUtil.MESSAGES.NameExample}`,
        answer: software.name,
        default: defaults && defaults.name,
      },
      {
        question: `${E2eAddUtil.MESSAGES.Shell} ${E2eAddUtil.MESSAGES.ShellExample}`,
        answer: software.shell,
        default: defaults && defaults.shell,
      },
      {
        question: `${E2eAddUtil.MESSAGES.Directory} ${E2eAddUtil.getDirectoryExampleMessage({
          directory: executableDirectory,
        })}`,
        answer: software.directory,
        default: defaults && defaults.directory,
      },
      ...E2eAddUtil.MESSAGES.CommandTypes,
      {
        choice: E2eAddUtil.CHOICES.Executable,
        answer: ExecutableChoiceOption.Static,
      },
      {
        question: `${E2eAddUtil.MESSAGES.Command} ${E2eAddUtil.getCommandExampleMessage({
          executableName: executableFile || getExecutableName(),
        })}`,
        answer: isStatic(software.executable) ? software.executable.command : '',
        default:
          defaults && defaults.executable && isStatic(defaults.executable) ? defaults.executable.command : undefined,
      },
      {
        question: `${E2eAddUtil.MESSAGES.Arguments} ${E2eAddUtil.MESSAGES.ArgumentsExample}`,
        answer: software.args,
        default: defaults && defaults.args,
      },
      {
        question: `${E2eAddUtil.MESSAGES.InstalledRegex} ${E2eAddUtil.MESSAGES.InstalledRegexExample}`,
        answer: software.installedRegex,
        default: defaults && defaults.installedRegex,
      },
      `Installed version: "${installedVersion}"`,
      {
        question: 'Is the above version correct',
        answer: true,
      },
      {
        question: `${E2eAddUtil.MESSAGES.Url} ${E2eAddUtil.MESSAGES.UrlExample}`,
        answer: software.url,
        default: defaults && defaults.url,
      },
      {
        question: `${E2eAddUtil.MESSAGES.LatestRegex} ${E2eAddUtil.MESSAGES.LatestRegexExample}`,
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

  static getPreviousValue({
    property,
    softwareProperty,
    dependantProperty,
    currentIndex,
    reconfiguration,
    convertToEmptyString,
    defaults,
  }: {
    property: string
    softwareProperty?: string
    dependantProperty?: string
    currentIndex: number
    reconfiguration: InstalledReconfiguration[] | LatestReconfiguration[]
    convertToEmptyString?: string
    defaults?: Software
  }): string | undefined {
    let previousValue
    if (currentIndex === 0 && defaults) {
      previousValue = TestUtil.getNestedProperty({
        obj: defaults,
        property: softwareProperty || property,
      })
    } else {
      for (let i = currentIndex - 1; i >= 0; i--) {
        const possiblePreviousValue = TestUtil.getNestedProperty({
          obj: reconfiguration[i],
          property: isSoftware(reconfiguration[i]) ? softwareProperty : property,
        })
        const previousDepandantProperty = TestUtil.getNestedProperty({
          obj: reconfiguration[i],
          property: dependantProperty,
        })
        if (possiblePreviousValue !== undefined) {
          if (!dependantProperty || previousDepandantProperty !== undefined) {
            previousValue = possiblePreviousValue
          }
        }
      }
    }
    if (convertToEmptyString && previousValue === convertToEmptyString) {
      previousValue = ''
    }
    return previousValue
  }

  static getChunksReconfigure({
    defaults,
    installed,
    latest,
    executableDirectory,
    executableFile,
  }: {
    defaults?: Software
    installed: InstalledReconfiguration[]
    latest: LatestReconfiguration[]
    executableDirectory?: string
    executableFile?: string
  }): (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] {
    const chunks: (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] = []
    for (let i = 0; i < installed.length; i++) {
      const currentConfig = installed[i]
      if (currentConfig.name !== undefined) {
        chunks.push(
          ...[
            {
              question: `${E2eAddUtil.MESSAGES.Name} ${E2eAddUtil.MESSAGES.NameExample}`,
              answer: currentConfig.name,
              default: defaults && defaults.name,
            },
          ]
        )
      }
      if (currentConfig.shell !== undefined) {
        chunks.push({
          question: `${E2eAddUtil.MESSAGES.Shell} ${E2eAddUtil.MESSAGES.ShellExample}`,
          answer: currentConfig.shell === KEYS.BACK_SPACE ? '' : currentConfig.shell,
          default: E2eAddUtil.getPreviousValue({
            property: 'shell',
            currentIndex: i,
            reconfiguration: installed,
            defaults,
            convertToEmptyString: KEYS.BACK_SPACE,
          }),
        })
      }
      if (currentConfig.directory !== undefined) {
        chunks.push(
          ...[
            {
              question: `${E2eAddUtil.MESSAGES.Directory} ${E2eAddUtil.getDirectoryExampleMessage({
                directory: executableDirectory,
              })}`,
              answer: currentConfig.directory === KEYS.BACK_SPACE ? '' : currentConfig.directory,
              default: E2eAddUtil.getPreviousValue({
                property: 'directory',
                dependantProperty: 'command',
                currentIndex: i,
                reconfiguration: installed,
                defaults,
                convertToEmptyString: KEYS.BACK_SPACE,
              }),
            },
          ]
        )
      }
      if (currentConfig.command !== undefined) {
        chunks.push(
          ...[
            ...E2eAddUtil.MESSAGES.CommandTypes,
            {
              choice: E2eAddUtil.CHOICES.Executable,
              answer: ExecutableChoiceOption.Static,
            },
            {
              question: `${E2eAddUtil.MESSAGES.Command} ${E2eAddUtil.getCommandExampleMessage({
                executableName: executableFile || getExecutableName(),
              })}`,
              answer: currentConfig.command,
              default: E2eAddUtil.getPreviousValue({
                property: 'command',
                softwareProperty: 'executable.command',
                currentIndex: i,
                reconfiguration: installed,
                defaults,
              }),
            },
            {
              question: `${E2eAddUtil.MESSAGES.Arguments} ${E2eAddUtil.MESSAGES.ArgumentsExample}`,
              answer: currentConfig.args,
              default: E2eAddUtil.getPreviousValue({
                property: 'args',
                currentIndex: i,
                reconfiguration: installed,
                defaults,
              }),
            },
            {
              question: `${E2eAddUtil.MESSAGES.InstalledRegex} ${E2eAddUtil.MESSAGES.InstalledRegexExample}`,
              answer: currentConfig.regex,
              default: E2eAddUtil.getPreviousValue({
                property: 'regex',
                softwareProperty: 'installedRegex',
                currentIndex: i,
                reconfiguration: installed,
                defaults,
              }),
            },
          ]
        )
      }
      if (currentConfig.name !== undefined && currentConfig.directory === undefined) {
        chunks.push(...[E2eAddUtil.getNameInUseMessage(currentConfig.name || '')])
      } else if (currentConfig.directory !== undefined && currentConfig.command === undefined) {
        chunks.push(...[E2eAddUtil.getPathDoesNotExistMesage(currentConfig.directory || '')])
      } else if (currentConfig.error) {
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
    for (let i = 0; i < latest.length; i++) {
      const currentConfig = latest[i]
      chunks.push(
        ...[
          {
            question: `${E2eAddUtil.MESSAGES.Url} ${E2eAddUtil.MESSAGES.UrlExample}`,
            answer: currentConfig.url,
            default: E2eAddUtil.getPreviousValue({
              property: 'url',
              currentIndex: i,
              reconfiguration: latest,
              defaults,
            }),
          },
          {
            question: `${E2eAddUtil.MESSAGES.LatestRegex} ${E2eAddUtil.MESSAGES.LatestRegexExample}`,
            answer: currentConfig.regex,
            default: E2eAddUtil.getPreviousValue({
              property: 'regex',
              softwareProperty: 'latestRegex',
              currentIndex: i,
              reconfiguration: latest,
              defaults,
            }),
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
