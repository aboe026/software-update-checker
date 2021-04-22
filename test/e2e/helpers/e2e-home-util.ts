import E2eBaseUtil, { ChoicePrompt } from './e2e-base-util'
import { KEYS } from './interactive-execute'

export enum HomeChoiceOption {
  Add = 'Add New Software',
  View = 'View Installed Softwares',
  Edit = 'Edit Software Configuration',
  Delete = 'Delete Software Configuration',
  Exit = 'Exit',
}

export default class E2eHomeUtil extends E2eBaseUtil {
  static readonly CHOICES = {
    Home: {
      question: 'Select action to perform',
      options: HomeChoiceOption,
    },
  }

  static getInputs(option: HomeChoiceOption): string[] {
    const inputs: string[] = []
    for (let i = 0; i < Object.keys(HomeChoiceOption).length && !inputs.includes(KEYS.Enter); i++) {
      const choiceKey = Object.keys(HomeChoiceOption)[i] as keyof typeof HomeChoiceOption
      const choiceValue = HomeChoiceOption[choiceKey]
      if (option === choiceValue) {
        inputs.push(KEYS.Enter)
      } else {
        inputs.push(KEYS.Down)
      }
    }
    return inputs
  }

  static getChunks(answer: HomeChoiceOption): ChoicePrompt[] {
    return [
      {
        choice: this.CHOICES.Home,
        answer,
      },
    ]
  }
}
