import { Arguments, Argv, CommandModule } from 'yargs'

import BaseCommand from '../base/base-command'
import { convertToGenericOptions } from '../base/base-options'
import Home from './home'
import { HomeOptions } from './home-options'
import Version from '../version/version'

export default class HomeCommand extends BaseCommand {
  static getCommand(): CommandModule {
    return {
      command: '$0 [add|view|edit|remove]',
      describe: 'Check if installed software has updates available', // TODO: have the "root" level description be separate from the in-line default description (https://github.com/yargs/yargs/issues/1995)
      builder: (yargs: Argv) =>
        yargs.options(HomeCommand.sortOptions(convertToGenericOptions(HomeOptions))).version(false), // disable version here to pass custom version below
      handler: async (argv: Arguments) => {
        const version = HomeCommand.getBooleanArgument(argv, HomeOptions.Version)
        if (version) {
          console.log(Version.getVersion())
        } else {
          await Home.mainMenu()
        }
      },
    }
  }
}
