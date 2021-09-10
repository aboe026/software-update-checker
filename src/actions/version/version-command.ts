import { Argv, CommandModule } from 'yargs'

import { addNewlineForExample } from '../base/base-options'
import BaseCommand from '../base/base-command'
import Version from './version'
import { VersionCommands } from './version-options'

export default class VersionCommand extends BaseCommand {
  static getCommand(): CommandModule {
    return {
      command: VersionCommands.Version.key,
      describe: addNewlineForExample(VersionCommands.Version.value.description),
      builder: (yargs: Argv) => yargs.help(false),
      handler: () => {
        console.log(Version.getVersion())
      },
    }
  }
}
