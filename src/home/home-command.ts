import { Argv, CommandModule } from 'yargs'

import BaseCommand from '../base/base-command'
import Home from './home'

export default class HomeCommand extends BaseCommand {
  static getCommand(): CommandModule {
    return {
      command: '$0 [add|view|edit|remove]',
      describe: 'toast edit', // TODO: have generic description about tool here, then say how it defaults to interactive shell in commands list
      builder: (yargs: Argv) => yargs,
      handler: async () => {
        await Home.mainMenu()
      },
    }
  }
}
