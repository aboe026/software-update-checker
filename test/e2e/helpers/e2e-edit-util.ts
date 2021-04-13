import E2eBaseUtil, { BooleanPrompt, ChoicePrompt, StringPrompt, Option } from './e2e-base-util'
import { KEYS } from './interactive-execute'
import E2eAddUtil from './e2e-add-util'
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

  static getNavigateToSoftwareToEditInputs(position: number): string[] {
    const inputs: string[] = []
    for (let i = 0; i < position; i++) {
      inputs.push(KEYS.Down)
    }
    inputs.push(KEYS.Enter)
    return inputs
  }

  static getDefaultEditInputs({
    position,
    newSoftware,
    oldSoftware,
  }: {
    position: number
    newSoftware: Software
    oldSoftware: Software
  }): string[] {
    let inputs = E2eBaseUtil.getNavigateToPositionInputs(position)
    inputs = inputs.concat(
      E2eAddUtil.getDefaultAddInputs({
        software: newSoftware,
        defaults: oldSoftware,
      })
    )
    return inputs
  }

  static getNavigateToSoftwareToEditChunks({
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

  static getDefaultEditChunks({
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
      ...this.getNavigateToSoftwareToEditChunks({
        existingSoftwares,
        nameToEdit: oldSoftware.name,
      }),
      ...E2eAddUtil.getDefaultAddChunks({
        software: newSoftware,
        installedVersion,
        latestVersion,
        defaults: oldSoftware,
      }),
    ]
  }
}
