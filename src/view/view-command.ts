import { Argv, CommandModule } from 'yargs'

import { addNewlineForExample } from '../base/base-options'
import BaseCommand from '../base/base-command'
import View from './view'
import { ViewCommands } from './view-options'

export default class ViewCommand extends BaseCommand {
  static getCommand(): CommandModule {
    return {
      command: ViewCommands.View.key,
      aliases: ViewCommands.View.value.alias,
      describe: addNewlineForExample(ViewCommands.View.value.description),
      builder: (yargs: Argv) => yargs.showHelpOnFail(true),
      handler: async () => {
        await View.showVersions()
      },
    }
  }
}
