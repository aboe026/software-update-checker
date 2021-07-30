import inquirer from 'inquirer'

import { EditCommands } from './edit-options'
import Software from '../software'

export default class EditPrompts {
  static async getExisting(softwares: Software[]): Promise<string> {
    const { existing } = await inquirer.prompt({
      name: 'existing',
      message: `${EditCommands.Existing.value.description}:`,
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
}
