import { Arguments, Argv, CommandModule } from 'yargs'

import { addNewlineForExample, BaseOptions, convertToGenericOptions } from '../base/base-options'
import BaseCommand from '../base/base-command'
import { CommandType, Dynamic, Static } from '../executable'
import Edit from './edit'
import { EditCommands, EditOptions } from './edit-options'

export default class EditCommand extends BaseCommand {
  static getCommand(): CommandModule {
    return {
      command: `${EditCommands.Edit.key} <${EditCommands.Existing.key}>`,
      aliases: EditCommands.Edit.value.alias,
      describe: addNewlineForExample(EditCommands.Edit.value.description),
      builder: (yargs: Argv) =>
        yargs
          .showHelpOnFail(true)
          .options(EditCommand.sortOptions(convertToGenericOptions(EditOptions)))
          .positional(EditCommands.Existing.key, EditCommands.Existing.value),
      handler: async (argv: Arguments) => {
        const typeKey = EditOptions.Type.key
        let executable: Static | Dynamic | undefined = undefined

        const existing = EditCommand.getStringArgument(argv, EditCommands.Existing)
        const name = EditCommand.getStringArgument(argv, EditOptions.Name)
        const type = EditCommand.getCommandTypeArgument(argv, EditOptions.Type)
        const command = EditCommand.getStringArgument(argv, EditOptions.Command)
        const directory = EditCommand.getStringArgument(argv, EditOptions.Directory)
        const regex = EditCommand.getStringArgument(argv, EditOptions.Regex)
        const args = EditCommand.getStringArgument(argv, EditOptions.Arguments)
        const shellOverride = EditCommand.getStringArgument(argv, EditOptions.ShellOverride)
        const installedRegex = EditCommand.getStringArgument(argv, EditOptions.InstalledRegex)
        const url = EditCommand.getStringArgument(argv, EditOptions.Url)
        const latestRegex = EditCommand.getStringArgument(argv, EditOptions.LatestRegex)
        const interactive = EditCommand.getBooleanArgument(argv, BaseOptions.Interactive)

        if (
          name === undefined &&
          type === undefined &&
          command === undefined &&
          directory === undefined &&
          regex === undefined &&
          args === undefined &&
          shellOverride === undefined &&
          installedRegex === undefined &&
          url === undefined &&
          latestRegex === undefined
        ) {
          throw Error('Must provide something to change as an option/flag')
        }
        if (type === CommandType.Static && directory) {
          throw Error(
            `The "--${EditOptions.Directory.key}" option is not compatible with "--${typeKey}=${CommandType.Static}"`
          )
        }
        if (type === CommandType.Static && regex) {
          throw Error(
            `The "--${EditOptions.Regex.key}" option is not compatible with "--${typeKey}=${CommandType.Static}"`
          )
        }
        if (type === CommandType.Dynamic && command) {
          throw Error(
            `The "--${EditOptions.Command.key}" option is not compatible with "--${typeKey}=${CommandType.Dynamic}"`
          )
        }

        if (command) {
          executable = {
            command,
          }
        } else if (directory || regex) {
          executable = {
            directory: directory || '',
            regex: regex || '',
          }
        }

        return Edit.editConfiguration({
          inputs: {
            existing,
            name,
            type,
            executable,
            args,
            shellOverride,
            installedRegex,
            url,
            latestRegex,
            interactive,
          },
        })
      },
    }
  }
}
