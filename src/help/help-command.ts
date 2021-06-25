import yargs, { CommandModule, Argv } from 'yargs'

import { addNewlineForExample } from '../base/base-options'
import BaseCommand from '../base/base-command'
import { HelpCommands } from './help-options'

export default class HelpCommand extends BaseCommand {
  static getCommand(): CommandModule {
    return {
      command: HelpCommands.Help.key,
      describe: addNewlineForExample(HelpCommands.Help.value.description),
      builder: (yargs: Argv) => yargs,
      handler: async () => {
        yargs.showHelp()
      },
    }
  }
}
