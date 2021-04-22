import E2eAddUtil, { InstalledReconfiguration, LatestReconfiguration } from './e2e-add-util'
import E2eBaseUtil, { BooleanPrompt, ChoicePrompt, StringPrompt, Option } from './e2e-base-util'
import Software from '../../../src/software'

export default class E2eEditUtil extends E2eBaseUtil {
  static readonly CHOICES = {
    Edit: {
      question: 'Select configured software to edit',
    },
  }
  static readonly MESSAGES = {
    NoSoftwares: 'No softwares to edit. Please add a software to have something to edit.',
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
