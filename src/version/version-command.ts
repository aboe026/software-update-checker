import { Argv, CommandModule } from 'yargs'

import { addNewlineForExample } from '../base/base-options'
import BaseCommand from '../base/base-command'
import { version } from '../../package.json'
import { VersionCommands } from './version-options'

export default class VersionCommand extends BaseCommand {
  static getCommand(): CommandModule {
    return {
      command: VersionCommands.Version.key,
      describe: addNewlineForExample(VersionCommands.Version.value.description),
      builder: (yargs: Argv) => yargs.help(false),
      handler: () => {
        console.log(version) // for some reason, yargs.showVersion() was not available (which would be preferable)
      },
    }
  }
}
