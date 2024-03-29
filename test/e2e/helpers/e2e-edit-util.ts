import { CommandType } from '../../../src/software/executable'
import E2eAddUtil, { InstalledReconfiguration, LatestReconfiguration } from './e2e-add-util'
import E2eBaseUtil, { BooleanPrompt, ChoicePrompt, StringPrompt, Option } from './e2e-base-util'
import Software from '../../../src/software/software'

export default class E2eEditUtil extends E2eBaseUtil {
  static readonly CHOICES = {
    Edit: {
      question: 'Name of existing software configuration to edit',
    },
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
      args.push(`--name=${newSoftware.name}`)
    }
    if (newSoftware.shell !== undefined) {
      args.push(`--shell=${newSoftware.shell}`)
    }
    if (newSoftware.directory !== undefined) {
      args.push(`--directory=${newSoftware.directory}`)
    }
    if (newSoftware.type !== undefined) {
      args.push(`--type=${newSoftware.type}`)
    }
    if (newSoftware.command !== undefined) {
      args.push(`--command=${newSoftware.command}`)
    }
    if (newSoftware.regex !== undefined) {
      args.push(`--regex=${newSoftware.regex}`)
    }
    if (newSoftware.args !== undefined) {
      args.push(`--args=${newSoftware.args}`)
    }
    if (newSoftware.installedRegex !== undefined) {
      args.push(`--installedRegex=${newSoftware.installedRegex}`)
    }
    if (newSoftware.url !== undefined) {
      args.push(`--url=${newSoftware.url}`)
    }
    if (newSoftware.latestRegex !== undefined) {
      args.push(`--latestRegex=${newSoftware.latestRegex}`)
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
    installed,
    latest = [],
  }: {
    position: number
    oldSoftware: Software
    installed: InstalledReconfiguration[]
    latest: LatestReconfiguration[]
  }): string[] {
    return [
      ...E2eBaseUtil.getInputsNavigate(position),
      ...E2eAddUtil.getInputsReconfigure({
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
          question: E2eEditUtil.CHOICES.Edit.question,
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
      ...E2eEditUtil.getChunksNavigate({
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
    installed,
    latest,
  }: {
    existingSoftwares: Software[]
    oldSoftware: Software
    installed: InstalledReconfiguration[]
    latest: LatestReconfiguration[]
  }): (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] {
    return [
      ...E2eEditUtil.getChunksNavigate({
        existingSoftwares,
        nameToEdit: oldSoftware.name,
      }),
      ...E2eAddUtil.getChunksReconfigure({
        defaults: oldSoftware,
        installed,
        latest,
      }),
    ]
  }
}

export interface EditOptions {
  name?: string
  shell?: string
  directory?: string
  type?: CommandType
  command?: string
  regex?: string
  args?: string
  installedRegex?: string
  url?: string
  latestRegex?: string
}
