import E2eBaseUtil, { BooleanPrompt, ChoicePrompt, StringPrompt } from './e2e-base-util'
import { KEYS } from './interactive-execute'
import { isStatic } from '../../../src/executable'
import Software from '../../../src/software'

export enum ExecutableChoiceOption {
  Static = 'Static',
  Dynamic = 'Dynamic',
}

export default class E2eAddUtil extends E2eBaseUtil {
  static readonly CHOICES = {
    Executable: {
      question: 'Is the executable file a static name or dynamic (eg includes version in name)',
      options: ExecutableChoiceOption,
    },
  }

  static getDefaultAddInputs({ software, defaults }: { software: Software; defaults?: Software }): string[] {
    const inputs: string[] = []

    // name
    if (!defaults || software.name !== defaults.name) {
      inputs.push(software.name)
    }
    inputs.push(KEYS.Enter)

    // executable type (static)
    inputs.push(KEYS.Enter)

    // command
    if (
      !defaults ||
      !isStatic(software.executable) ||
      !isStatic(defaults.executable) ||
      software.executable.command !== defaults.executable.command
    ) {
      inputs.push(isStatic(software.executable) ? software.executable.command : '')
    }
    inputs.push(KEYS.Enter)

    // args
    if (!defaults || software.args !== defaults.args) {
      inputs.push(software.args || '')
    }
    inputs.push(KEYS.Enter)

    // installed regex
    if (!defaults || software.installedRegex !== defaults.installedRegex) {
      inputs.push(software.installedRegex)
    }
    inputs.push(KEYS.Enter)

    // shell override
    if (!defaults || software.shellOverride !== defaults.shellOverride) {
      inputs.push(software.shellOverride || KEYS.BACK_SPACE)
    }
    inputs.push(KEYS.Enter)

    // installed version correct
    inputs.push(KEYS.Enter)

    // url
    if (!defaults || software.url !== defaults.url) {
      inputs.push(software.url)
    }
    inputs.push(KEYS.Enter)

    // latest regex
    if (!defaults || software.latestRegex !== defaults.latestRegex) {
      inputs.push(software.latestRegex)
    }
    inputs.push(KEYS.Enter)

    // latest version correct
    inputs.push(KEYS.Enter)

    return inputs
  }

  static getDefaultAddChunks({
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
        answer: software.args || '',
        default: defaults && defaults.args,
      },
      {
        question: 'Regex pattern applied to command output to single out installed version (eg version (.*))',
        answer: software.installedRegex,
        default: defaults && defaults.installedRegex,
      },
      {
        question: 'Shell override to use instead of system default shell (eg powershell)',
        answer: software.shellOverride || '',
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
}
