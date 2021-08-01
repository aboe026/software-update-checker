import { Command } from '../base/base-options'

export const VersionCommands = {
  Version: new Command({
    key: 'version',
    value: {
      description: 'Show version number',
    },
  }),
}
