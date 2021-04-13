import E2eBaseUtil, { BooleanPrompt, ChoicePrompt, StringPrompt, Option } from './e2e-base-util'
import { KEYS } from './interactive-execute'
import Software from '../../../src/software'

export default class E2eDeleteUtil extends E2eBaseUtil {
  static readonly CHOICES = {
    Delete: {
      question: 'Select configured software to delete',
    },
  }
  static readonly MESSAGES = {
    NoSoftwares: 'No softwares to delete. Please add a software to have something to delete.',
  }

  static getDefaultDeleteInputs({ position, confirm = true }: { position: number; confirm?: boolean }): string[] {
    const inputs = E2eBaseUtil.getNavigateToPositionInputs(position)
    if (!confirm) {
      inputs.push('No')
    }
    inputs.push(KEYS.Enter)
    return inputs
  }

  static getNavigateToSoftwareToDeleteChunks({
    existingSoftwares,
    nameToDelete,
  }: {
    existingSoftwares: Software[]
    nameToDelete: string
  }): (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] {
    const existingOptions: Option = {}
    for (let i = 0; i < existingSoftwares.length; i++) {
      existingOptions[i.toString()] = existingSoftwares[i].name
    }
    return [
      {
        choice: {
          question: this.CHOICES.Delete.question,
          options: existingOptions,
        },
        answer: nameToDelete,
      },
    ]
  }

  static getDefaultDeleteChunks({
    existingSoftwares,
    softwareToDelete,
    confirm = true,
  }: {
    existingSoftwares: Software[]
    softwareToDelete: Software
    confirm?: boolean
  }): (string | StringPrompt | BooleanPrompt | ChoicePrompt)[] {
    return [
      ...this.getNavigateToSoftwareToDeleteChunks({
        existingSoftwares,
        nameToDelete: softwareToDelete.name,
      }),
      {
        question: `Are you sure you want to delete '${softwareToDelete.name}'`,
        answer: confirm,
      },
    ]
  }
}
