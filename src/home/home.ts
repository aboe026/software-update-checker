import Add from '../add/add'
import { AddCommands } from '../add/add-options'
import Delete from '../delete/delete'
import { DeleteCommands } from '../delete/delete-options'
import Edit from '../edit/edit'
import { EditCommands } from '../edit/edit-options'
import HomePrompts from './home-prompts'
import View from '../view/view'
import { ViewCommands } from '../view/view-options'

export default class Home {
  static async mainMenu(): Promise<void> {
    let exit = false
    while (!exit) {
      const action = await HomePrompts.getAction()
      switch (action) {
        case AddCommands.Add.key:
          await Add.configure({})
          break
        case ViewCommands.View.key:
          await View.showVersions()
          break
        case EditCommands.Edit.key:
          await Edit.editConfiguration({})
          break
        case DeleteCommands.Delete.key:
          await Delete.removeConfiguration({})
          break
        case 'exit':
          exit = true
      }
    }
  }
}
