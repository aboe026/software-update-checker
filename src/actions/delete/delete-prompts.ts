import inquirer from 'inquirer'

import { DeleteCommands } from './delete-options'
import Software from '../../software/software'

export default class EditPrompts {
  static async getExisting(softwares: Software[]): Promise<string> {
    const { existing } = await inquirer.prompt({
      name: 'existing',
      message: `${DeleteCommands.Existing.value.description}:`,
      type: 'list',
      choices: softwares.map((software) => {
        return {
          name: software.name,
          value: software.name,
        }
      }),
    })
    return existing
  }

  static async getDeleteConfirmed(nameToDelete: string): Promise<boolean> {
    const { deleteConfirmed } = await inquirer.prompt({
      name: 'deleteConfirmed',
      message: `Are you sure you want to delete "${nameToDelete}"?`,
      type: 'confirm',
      default: true,
    })
    return deleteConfirmed
  }
}
