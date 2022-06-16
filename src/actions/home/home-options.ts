import { Option } from '../base/base-options'
import { VersionCommands } from '../version/version-options'

export const HomeOptions = {
  Version: new Option({
    key: VersionCommands.Version.key,
    value: {
      alias: ['v'],
      description: VersionCommands.Version.value.description,
      type: 'boolean',
      default: false,
      demandOption: false,
      requiresArg: false,
    },
  }),
}
