import { Argv, CommandModule } from 'yargs'

import BaseCommand from '../base/base-command'
import Home from './home'

export default class HomeCommand extends BaseCommand {
  static getCommand(): CommandModule {
    return {
      command: '$0 [add|view|edit|remove]',
      describe: 'Check if installed software has updates available', // TODO: have the "root" level description be separate from the in-line default description (https://github.com/yargs/yargs/issues/1995)
      builder: (yargs: Argv) => yargs,
      handler: async () => {
        await Home.mainMenu()
      },
    }
  }
}
