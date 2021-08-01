import yargs, { Arguments, Argv } from 'yargs'

import HelpCommand from '../../src/actions/help/help-command'

describe('View Command Unit Tests', () => {
  describe('getCommand', () => {
    it('builder returns without modifications', () => {
      const builder = HelpCommand.getCommand().builder as (yargs: Argv) => Argv
      const yargClone = yargs
      expect(builder(yargs)).toEqual(yargClone)
    })
    it('handler calls showHelp', async () => {
      const showHelpSpy = jest.spyOn(yargs, 'showHelp').mockImplementation()
      const handler = HelpCommand.getCommand().handler as (args: Arguments) => void
      handler(await yargs.argv)
      expect(showHelpSpy.mock.calls).toHaveLength(1)
    })
  })
})
