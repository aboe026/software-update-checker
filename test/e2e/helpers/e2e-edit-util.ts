import { CommandType } from '../../../src/executable'
import E2eAddUtil, { InstalledReconfiguration, LatestReconfiguration } from './e2e-add-util'
import E2eBaseUtil, { BooleanPrompt, ChoicePrompt, StringPrompt, Option } from './e2e-base-util'
import Software from '../../../src/software'

export default class E2eEditUtil extends E2eBaseUtil {
  static readonly CHOICES = {
    Edit: {
      question: 'Name of existing software configuration to edit',
    },
  }
  static readonly MESSAGES = {
    NoSoftwares: 'No softwares to edit. Please add a software to have something to edit.',
    NoOptions: 'Must provide something to change as an option/flag',
    NoCommandForStatic: 'The "static" executable type requires a "--command" option to be specified',
    NoDirectoryForDynamic: 'The "dynamic" executable type requires a "--directory" option to be specified',
    NoDirectoryForRegex: 'The "dynamic" executable type requires a "--regex" option to be specified',
    IncompatibleDirectoryWithStaticType: 'The "--directory" option is not compatible with "--type=static"',
    IncompatibleRegexWithStaticType: 'The "--regex" option is not compatible with "--type=static"',
    IncompatibleCommandWithDynamicType: 'The "--command" option is not compatible with "--type=dynamic"',
    IncompatibleCommandWithDirectory: 'Arguments command and directory are mutually exclusive',
    IncompatibleCommandWithRegex: 'Arguments command and regex are mutually exclusive',
    IncompatibleDirectoryWithStaticExecutable: 'The "--directory" option is not compatible with a static executable',
    IncompatibleRegexWithStaticExecutable: 'The "--regex" option is not compatible with a static executable',
    IncompatibleCommandWithDynamicExecutable: 'The "--command" option is not compatible with a dynamic executable',
  }

  static getNonExistingSoftwareMessage(name: string): string {
    return `Invalid existing software "${name}", does not exist.`
  }

  static getSilentCommand({
    existingName,
    newSoftware,
  }: {
    existingName: string | undefined
    newSoftware: EditOptions
  }): string[] {
    const args: string[] = ['edit']
    if (existingName !== undefined) {
      args.push(existingName)
    }
    if (newSoftware.name !== undefined) {
      args.push(`--name="${newSoftware.name}"`)
    }
    if (newSoftware.type !== undefined) {
      args.push(`--type="${newSoftware.type}"`)
    }
    if (newSoftware.command !== undefined) {
      args.push(`--command="${newSoftware.command}"`)
    }
    if (newSoftware.directory !== undefined) {
      args.push(`--directory="${newSoftware.directory}"`)
    }
    if (newSoftware.regex !== undefined) {
      args.push(`--regex="${newSoftware.regex}"`)
    }
    if (newSoftware.args !== undefined) {
      args.push(`--args="${newSoftware.args}"`)
    }
    if (newSoftware.shellOverride !== undefined) {
      args.push(`--shellOverride="${newSoftware.shellOverride}"`)
    }
    if (newSoftware.installedRegex !== undefined) {
      args.push(`--installedRegex="${newSoftware.installedRegex}"`)
    }
    if (newSoftware.url !== undefined) {
      args.push(`--url="${newSoftware.url}"`)
    }
    if (newSoftware.latestRegex !== undefined) {
      args.push(`--latestRegex="${newSoftware.latestRegex}"`)
    }
    return args
  }

  static getInputs({
    position,
    oldSoftware,
    newSoftware,
  }: {
    position: number
    oldSoftware: Software
    newSoftware: Software
  }): string[] {
    return [
      ...E2eBaseUtil.getInputsNavigate(position),
      ...E2eAddUtil.getInputs({
        software: newSoftware,
        defaults: oldSoftware,
      }),
    ]
  }

  static getInputsReconfigure({
    position,
    oldSoftware,
    name,
    installed,
    latest = [],
  }: {
    position: number
    oldSoftware: Software
    name: string
    installed: InstalledReconfiguration[]
    latest: LatestReconfiguration[]
  }): string[] {
    return [
      ...E2eBaseUtil.getInputsNavigate(position),
      ...E2eAddUtil.getInputsReconfigure({
        name,
        installed,
        latest,
        defaults: oldSoftware,
      }),
    ]
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

  static getChunksNavigate({
    existingSoftwares,
    nameToEdit,
  }: {
    existingSoftwares: Software[]
    nameToEdit: string
  }): (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] {
    const existingOptions: Option = {}
    for (let i = 0; i < existingSoftwares.length; i++) {
      existingOptions[i.toString()] = existingSoftwares[i].name
    }
    return [
      {
        choice: {
          question: this.CHOICES.Edit.question,
          options: existingOptions,
        },
        answer: nameToEdit,
      },
    ]
  }

  static getChunks({
    existingSoftwares,
    oldSoftware,
    newSoftware,
    installedVersion,
    latestVersion,
  }: {
    existingSoftwares: Software[]
    oldSoftware: Software
    newSoftware: Software
    installedVersion: string
    latestVersion: string
  }): (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] {
    return [
      ...this.getChunksNavigate({
        existingSoftwares,
        nameToEdit: oldSoftware.name,
      }),
      ...E2eAddUtil.getChunks({
        software: newSoftware,
        installedVersion,
        latestVersion,
        defaults: oldSoftware,
      }),
    ]
  }

  static getChunksReconfigure({
    existingSoftwares,
    oldSoftware,
    name,
    installed,
    latest,
  }: {
    existingSoftwares: Software[]
    oldSoftware: Software
    name: string
    installed: InstalledReconfiguration[]
    latest: LatestReconfiguration[]
  }): (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] {
    return [
      ...this.getChunksNavigate({
        existingSoftwares,
        nameToEdit: oldSoftware.name,
      }),
      ...E2eAddUtil.getChunksReconfigure({
        defaults: oldSoftware,
        name,
        installed,
        latest,
      }),
    ]
  }
}

export interface EditOptions {
  name?: string
  type?: CommandType
  command?: string
  directory?: string
  regex?: string
  args?: string
  shellOverride?: string
  installedRegex?: string
  url?: string
  latestRegex?: string
}
