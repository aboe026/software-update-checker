import { Arguments, Argv, CommandModule } from 'yargs'

import Add from './add'
import { AddCommands, AddOptions, DynamicOptions, StaticOptions } from './add-options'
import { addNewlineForExample, BaseOptions, convertToGenericOptions } from '../base/base-options'
import BaseCommand from '../base/base-command'
import { Dynamic, Static } from '../../software/executable'

export default class AddCommand extends BaseCommand {
  static getStaticCommand(): CommandModule {
    return {
      command: AddCommands.Static.key,
      describe: addNewlineForExample(AddCommands.Static.value.description),
      builder: AddCommand.sortOptions(convertToGenericOptions(StaticOptions)),
      handler: async (argv: Arguments) => {
        const command = AddCommand.getStringArgument(argv, StaticOptions.Command) || ''
        const interactive = AddCommand.getBooleanArgument(argv, BaseOptions.Interactive)

        if (!command && !interactive) {
          throw Error(Add.getMissingRequiredOptionErrorMessage(StaticOptions.Command.key))
        }

        return AddCommand.configure(argv, {
          command,
        })
      },
    }
  }

  static getDynamicCommand(): CommandModule {
    return {
      command: AddCommands.Dynamic.key,
      describe: addNewlineForExample(AddCommands.Dynamic.value.description),
      builder: AddCommand.sortOptions(convertToGenericOptions(DynamicOptions)),
      handler: async (argv: Arguments) => {
        const regex = AddCommand.getStringArgument(argv, DynamicOptions.Regex) || ''
        const interactive = AddCommand.getBooleanArgument(argv, BaseOptions.Interactive)

        if (!regex && !interactive) {
          throw Error(Add.getMissingRequiredOptionErrorMessage(DynamicOptions.Regex.key))
        }

        return AddCommand.configure(argv, {
          regex,
        })
      },
    }
  }

  static async configure(argv: Arguments, executable: Static | Dynamic): Promise<void> {
    const name = AddCommand.getStringArgument(argv, AddOptions.Name)
    const installedRegex = AddCommand.getStringArgument(argv, AddOptions.InstalledRegex)
    const url = AddCommand.getStringArgument(argv, AddOptions.Url)
    const latestRegex = AddCommand.getStringArgument(argv, AddOptions.LatestRegex)
    const interactive = AddCommand.getBooleanArgument(argv, BaseOptions.Interactive)

    if (!name && !interactive) {
      throw Error(Add.getMissingRequiredOptionErrorMessage(AddOptions.Name.key))
    }
    if (!installedRegex && !interactive) {
      throw Error(Add.getMissingRequiredOptionErrorMessage(AddOptions.InstalledRegex.key))
    }
    if (!url && !interactive) {
      throw Error(Add.getMissingRequiredOptionErrorMessage(AddOptions.Url.key))
    }
    if (!latestRegex && !interactive) {
      throw Error(Add.getMissingRequiredOptionErrorMessage(AddOptions.LatestRegex.key))
    }

    return Add.configure({
      inputs: {
        name,
        directory: AddCommand.getStringArgument(argv, AddOptions.Directory),
        executable,
        args: AddCommand.getStringArgument(argv, AddOptions.Arguments),
        shell: AddCommand.getStringArgument(argv, AddOptions.Shell),
        installedRegex,
        url,
        latestRegex,
        interactive,
      },
    })
  }

  static getCommand(): CommandModule {
    return {
      command: `${AddCommands.Add.key} <${AddCommands.Static.key}|${AddCommands.Dynamic.key}>`,
      aliases: AddCommands.Add.value.alias,
      describe: addNewlineForExample(AddCommands.Add.value.description),
      builder: (yargs: Argv) =>
        yargs.command(AddCommand.getStaticCommand()).command(AddCommand.getDynamicCommand()).showHelpOnFail(true),
      handler: () => {
        throw Error(`Must specify sub-command of either "${AddCommands.Static.key}" or "${AddCommands.Dynamic.key}"`)
      },
    }
  }
}
