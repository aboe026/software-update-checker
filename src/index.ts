import { hideBin } from 'yargs/helpers'
import yargs from 'yargs'

import AddCommand from './actions/add/add-command'
import BaseCommand from './actions/base/base-command'
import { BaseOptions, convertToGenericOptions, GROUP } from './actions/base/base-options'
import colors from './util/colors'
import DeleteCommand from './actions/delete/delete-command'
import EditCommand from './actions/edit/edit-command'
import HelpCommand from './actions/help/help-command'
import HomeCommand from './actions/home/home-command'
import Version from './actions/version/version'
import VersionCommand from './actions/version/version-command'
import ViewCommand from './actions/view/view-command'
;(async () => {
  try {
    await yargs(hideBin(process.argv))
      .scriptName(BaseCommand.getExecutableName())
      .showHelpOnFail(false) // gets overwritten by commands, but do not want to show in interactive
      .version(Version.getVersion()) // override default "--version" option/flag behavior
      .command(HomeCommand.getCommand())
      .command(AddCommand.getCommand())
      .command(ViewCommand.getCommand())
      .command(EditCommand.getCommand())
      .command(DeleteCommand.getCommand())
      .command(VersionCommand.getCommand())
      .command(HelpCommand.getCommand())
      .options(convertToGenericOptions(BaseOptions))
      .group(['help'], GROUP.Globals)
      .wrap(Math.min(120, yargs.terminalWidth())).argv
  } catch (err: any) {
    console.error(colors.red(err))
    process.exit(1)
  }
})()
