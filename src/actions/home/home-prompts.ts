import inquirer from 'inquirer'

import { AddCommands } from '../add/add-options'
import BasePrompts from '../base/base-prompts'
import { DeleteCommands } from '../delete/delete-options'
import { EditCommands } from '../edit/edit-options'
import { ViewCommands } from '../view/view-options'

export default class HomePrompts extends BasePrompts {
  static async getAction(): Promise<string> {
    const { action } = await inquirer.prompt({
      name: 'action',
      message: 'Select action to perform:',
      type: 'list',
      choices: [
        {
          name: HomePrompts.capitalizeFirstLetters(AddCommands.Add.value.description),
          value: AddCommands.Add.key,
        },
        {
          name: HomePrompts.capitalizeFirstLetters(ViewCommands.View.value.description),
          value: ViewCommands.View.key,
        },
        {
          name: HomePrompts.capitalizeFirstLetters(EditCommands.Edit.value.description),
          value: EditCommands.Edit.key,
        },
        {
          name: HomePrompts.capitalizeFirstLetters(DeleteCommands.Delete.value.description),
          value: DeleteCommands.Delete.key,
        },
        {
          name: 'Exit',
          value: 'exit',
        },
      ],
    })
    return action
  }
}
