import yargs, { Arguments, Argv } from 'yargs'

import Delete from '../../src/delete/delete'
import DeleteCommand from '../../src/delete/delete-command'

describe('Delete Command Unit Tests', () => {
  describe('getCommand', () => {
    it('builder enables showHelpOnFail and sets positional command', () => {
      const showHelpOnFailSpy = jest.spyOn(yargs, 'showHelpOnFail').mockReturnValue(yargs)
      const positionalSpy = jest.spyOn(yargs, 'positional').mockReturnValue(yargs)
      const builder = DeleteCommand.getCommand().builder as (yargs: Argv) => Argv
      builder(yargs)
      expect(showHelpOnFailSpy.mock.calls).toEqual([[true]])
      expect(positionalSpy.mock.calls).toEqual([
        [
          'existing',
          {
            description: 'Name of existing software configuration to delete',
            type: 'string',
            demandOption: true,
          },
        ],
      ])
    })
    it('handler calls removeConfiguration', async () => {
      const removeConfigurationSpy = jest.spyOn(Delete, 'removeConfiguration').mockResolvedValue()
      const handler = DeleteCommand.getCommand().handler as (args: Arguments) => void
      await handler(await yargs.argv)
      expect(removeConfigurationSpy.mock.calls).toHaveLength(1)
    })
  })
})
