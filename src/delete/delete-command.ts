import { Arguments, Argv, CommandModule } from 'yargs'

import { addNewlineForExample, BaseOptions } from '../base/base-options'
import BaseCommand from '../base/base-command'
import { DeleteCommands } from './delete-options'
import Edit from './delete'

export default class DeleteCommand extends BaseCommand {
  static getCommand(): CommandModule {
    return {
      command: `${DeleteCommands.Delete.key} <${DeleteCommands.Existing.key}>`,
      aliases: DeleteCommands.Delete.value.alias,
      describe: addNewlineForExample(DeleteCommands.Delete.value.description),
      builder: (yargs: Argv) =>
        yargs.showHelpOnFail(true).positional(DeleteCommands.Existing.key, DeleteCommands.Existing.value),
      handler: async (argv: Arguments) => {
        const existing = DeleteCommand.getStringArgument(argv, DeleteCommands.Existing)
        const interactive = DeleteCommand.getBooleanArgument(argv, BaseOptions.Interactive)

        return Edit.removeConfiguration({
          inputs: {
            existing,
            interactive,
          },
        })
      },
    }
  }
}
