import yargs, { Arguments, Argv } from 'yargs'

import View from '../../src/view/view'
import ViewCommand from '../../src/view/view-command'

describe('View Command Unit Tests', () => {
  describe('getCommand', () => {
    it('builder enables showHelpOnFail', () => {
      const showHelpOnFailSpy = jest.spyOn(yargs, 'showHelpOnFail').mockReturnValue(yargs)
      const builder = ViewCommand.getCommand().builder as (yargs: Argv) => Argv
      builder(yargs)
      expect(showHelpOnFailSpy.mock.calls).toEqual([[true]])
    })
    it('handler calls showVersions', async () => {
      const showVersionsSpy = jest.spyOn(View, 'showVersions').mockResolvedValue()
      const handler = ViewCommand.getCommand().handler as (args: Arguments) => void
      await handler(yargs.argv)
      expect(showVersionsSpy.mock.calls).toHaveLength(1)
    })
  })
})
