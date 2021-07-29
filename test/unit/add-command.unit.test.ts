import yargs, { Arguments, Argv } from 'yargs'

import Add from '../../src/add/add'
import AddCommand from '../../src/add/add-command'
import { Option } from '../../src/base/base-options'

describe('Add Command Unit Tests', () => {
  describe('getCommand', () => {
    it('builder enables showHelpOnFail and sets static and dynamic commands', () => {
      const showHelpOnFailSpy = jest.spyOn(yargs, 'showHelpOnFail').mockReturnValue(yargs)
      const commandSpy = jest.spyOn(yargs, 'command').mockReturnValue(yargs)
      const staticCommandSpy = jest.spyOn(AddCommand, 'getStaticCommand').mockImplementation()
      const dynamicCommandSpy = jest.spyOn(AddCommand, 'getDynamicCommand').mockImplementation()
      const builder = AddCommand.getCommand().builder as (yargs: Argv) => Argv
      builder(yargs)
      expect(showHelpOnFailSpy.mock.calls).toEqual([[true]])
      expect(commandSpy.mock.calls).toHaveLength(2)
      expect(staticCommandSpy.mock.calls).toHaveLength(1)
      expect(dynamicCommandSpy.mock.calls).toHaveLength(1)
    })
    it('handler throws error', () => {
      const handler = AddCommand.getCommand().handler as (args: Arguments) => void
      expect(() => handler(yargs.argv)).toThrow('Must specify sub-command of either "static" or "dynamic"')
    })
  })
  describe('getStaticCommand', () => {
    it('handler throws error if command missing and non-interactive', async () => {
      const handler = AddCommand.getStaticCommand().handler as (args: Arguments) => void
      await expect(handler(yargs.argv)).rejects.toThrow('Option "command" must be non-empty string')
    })
    it('handler calls configure if command passed', async () => {
      jest.spyOn(AddCommand, 'getStringArgument').mockReturnValue('test')
      const configureSpy = jest.spyOn(AddCommand, 'configure').mockResolvedValue()
      const handler = AddCommand.getStaticCommand().handler as (args: Arguments) => void
      await expect(handler(yargs.argv)).resolves.toBe(undefined)
      expect(configureSpy.mock.calls).toHaveLength(1)
    })
  })
  describe('getDynamicCommand', () => {
    it('handler throws error if directory missing and non-interactive', async () => {
      jest.spyOn(AddCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'directory' ? '' : 'test'
      })
      const handler = AddCommand.getDynamicCommand().handler as (args: Arguments) => void
      await expect(handler(yargs.argv)).rejects.toThrow('Option "directory" must be non-empty string')
    })
    it('handler throws error if regex missing and non-interactive', async () => {
      jest.spyOn(AddCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'regex' ? '' : 'test'
      })
      const handler = AddCommand.getDynamicCommand().handler as (args: Arguments) => void
      await expect(handler(yargs.argv)).rejects.toThrow('Option "regex" must be non-empty string')
    })
    it('handler calls configure if directory and regex passed', async () => {
      jest.spyOn(AddCommand, 'getStringArgument').mockReturnValue('test')
      const configureSpy = jest.spyOn(AddCommand, 'configure').mockResolvedValue()
      const handler = AddCommand.getDynamicCommand().handler as (args: Arguments) => void
      await expect(handler(yargs.argv)).resolves.toBe(undefined)
      expect(configureSpy.mock.calls).toHaveLength(1)
    })
  })
  describe('configure', () => {
    it('throws error if name missing and non-interactive', async () => {
      jest.spyOn(AddCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'name' ? '' : 'test'
      })
      await expect(AddCommand.configure(yargs.argv, { command: 'sunrise' })).rejects.toThrow(
        'Option "name" must be non-empty string'
      )
    })
    it('throws error if installedRegex missing and non-interactive', async () => {
      jest.spyOn(AddCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'installedRegex' ? '' : 'test'
      })
      await expect(AddCommand.configure(yargs.argv, { command: 'horizon' })).rejects.toThrow(
        'Option "installedRegex" must be non-empty string'
      )
    })
    it('throws error if url missing and non-interactive', async () => {
      jest.spyOn(AddCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'url' ? '' : 'test'
      })
      await expect(AddCommand.configure(yargs.argv, { command: 'sunset' })).rejects.toThrow(
        'Option "url" must be non-empty string'
      )
    })
    it('throws error if latestRegex missing and non-interactive', async () => {
      jest.spyOn(AddCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'latestRegex' ? '' : 'test'
      })
      await expect(AddCommand.configure(yargs.argv, { command: 'dusk' })).rejects.toThrow(
        'Option "latestRegex" must be non-empty string'
      )
    })
    it('calls configure if required params passed', async () => {
      jest.spyOn(AddCommand, 'getStringArgument').mockReturnValue('test')
      const configureSpy = jest.spyOn(Add, 'configure').mockResolvedValue()
      await expect(AddCommand.configure(yargs.argv, { command: 'eve' })).resolves.toBe(undefined)
      expect(configureSpy.mock.calls).toHaveLength(1)
    })
  })
})
