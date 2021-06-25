import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import AddCommand from './add/add-command'
import BaseCommand from './base/base-command'
import { GROUP } from './base/base-options'
import ViewCommand from './view/view-command'
import EditCommand from './edit/edit-command'
import { BaseOptions, convertToGenericOptions } from './base/base-options'
import HomeCommand from './home/home-command'
import DeleteCommand from './delete/delete-command'
import VersionCommand from './version/version-command'
import HelpCommand from './help/help-command'

yargs(hideBin(process.argv))
  .scriptName(BaseCommand.getExecutableName())
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

// Prompts.home().catch((err) => {
//   console.error(colors.red(err))
//   process.exit(1)
// })
