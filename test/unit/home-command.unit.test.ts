import yargs, { Arguments, Argv } from 'yargs'

import HomeCommand from '../../src/actions/home/home-command'
import Home from '../../src/actions/home/home'
import Version from '../../src/actions/version/version'

describe('Home Command Unit Tests', () => {
  describe('getCommand', () => {
    it('builder disables version and sets options', () => {
      const versionSpy = jest.spyOn(yargs, 'version').mockReturnValue(yargs)
      const optionsSpy = jest.spyOn(yargs, 'options').mockReturnValue(yargs)
      const builder = HomeCommand.getCommand().builder as (yargs: Argv) => Argv
      builder(yargs)
      expect(versionSpy.mock.calls).toEqual([[false]])
      expect(optionsSpy.mock.calls).toHaveLength(1)
      expect(Object.keys(optionsSpy.mock.calls[0][0])).toEqual(['version'])
    })
    it('handler shows home menu if no version option passed', async () => {
      const handler = HomeCommand.getCommand().handler as (args: Arguments) => void
      const getBooleanArgumentSpy = jest.spyOn(HomeCommand, 'getBooleanArgument').mockReturnValue(false)
      const mainMenuSpy = jest.spyOn(Home, 'mainMenu').mockResolvedValue()
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      await expect(handler(await yargs.argv)).resolves.toEqual(undefined)
      expect(getBooleanArgumentSpy.mock.calls).toHaveLength(1)
      expect(JSON.stringify(mainMenuSpy.mock.calls)).toEqual(JSON.stringify([[]]))
      expect(consoleLogSpy.mock.calls).toHaveLength(0)
    })
    it('handler prints version if version option passed', async () => {
      const handler = HomeCommand.getCommand().handler as (args: Arguments) => void
      const getBooleanArgumentSpy = jest.spyOn(HomeCommand, 'getBooleanArgument').mockReturnValue(true)
      const mainMenuSpy = jest.spyOn(Home, 'mainMenu').mockResolvedValue()
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
      await expect(handler(await yargs.argv)).resolves.toEqual(undefined)
      expect(getBooleanArgumentSpy.mock.calls).toHaveLength(1)
      expect(mainMenuSpy.mock.calls).toHaveLength(0)
      expect(consoleLogSpy.mock.calls).toHaveLength(1)
      expect(consoleLogSpy.mock.calls[0]).toHaveLength(1)
      expect(consoleLogSpy.mock.calls[0][0]).toEqual(Version.getVersion())
    })
  })
})
