import yargs, { Arguments, Argv } from 'yargs'

import VersionCommand from '../../src/version/version-command'
import { version } from '../../package.json'

describe('Version Command Unit Tests', () => {
  describe('getCommand', () => {
    it('builder disables help', () => {
      const helpSpy = jest.spyOn(yargs, 'help').mockReturnValue(yargs)
      const builder = VersionCommand.getCommand().builder as (yargs: Argv) => Argv
      builder(yargs)
      expect(helpSpy.mock.calls).toEqual([[false]])
    })
    it('handler prints package version', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      const handler = VersionCommand.getCommand().handler as (args: Arguments) => void
      handler(yargs.argv)
      expect(consoleLogSpy.mock.calls).toEqual([[version]])
    })
  })
})
