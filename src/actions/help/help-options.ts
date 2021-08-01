import { Command } from '../base/base-options'

export const HelpCommands = {
  Help: new Command({
    key: 'help',
    value: {
      description: 'Show help',
    },
  }),
}
