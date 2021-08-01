import { Command } from '../base/base-options'

export const DeleteCommands = {
  Delete: new Command({
    key: 'remove',
    value: {
      alias: ['delete'],
      description: 'Remove software configuration',
    },
  }),
  Existing: new Command({
    key: 'existing',
    value: {
      description: 'Name of existing software configuration to delete',
      type: 'string',
      demandOption: true,
    },
  }),
}
