import colors from './colors'
import { hideBin } from 'yargs/helpers'
import yargs from 'yargs'

import AddCommand from './add/add-command'
import BaseCommand from './base/base-command'
import { BaseOptions, convertToGenericOptions } from './base/base-options'
import DeleteCommand from './delete/delete-command'
import EditCommand from './edit/edit-command'
import { GROUP } from './base/base-options'
import HelpCommand from './help/help-command'
import HomeCommand from './home/home-command'
import VersionCommand from './version/version-command'
import ViewCommand from './view/view-command'
;(async () => {
  try {
    await yargs(hideBin(process.argv))
      .scriptName(BaseCommand.getExecutableName())
      .showHelpOnFail(false) // gets overwritten by commands, but do not want to show in interactive
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
  } catch (err) {
    console.error(colors.red(err))
    process.exit(1)
  }
})()
