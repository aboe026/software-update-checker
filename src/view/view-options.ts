import { Command } from '../base/base-options'

export const ViewCommands = {
  View: new Command({
    key: 'view',
    value: {
      alias: ['list', 'read'],
      description: 'View configured software versions',
    },
  }),
}
