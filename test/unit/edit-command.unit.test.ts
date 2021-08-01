import yargs, { Arguments, Argv } from 'yargs'

import { CommandType } from '../../src/executable'
import Edit from '../../src/edit/edit'
import EditCommand from '../../src/edit/edit-command'
import { Option } from '../../src/base/base-options'

describe('Edit Command Unit Tests', () => {
  describe('getCommand', () => {
    it('builder enables showHelpOnFail and sets options and positional command', () => {
      const showHelpOnFailSpy = jest.spyOn(yargs, 'showHelpOnFail').mockReturnValue(yargs)
      const optionsSpy = jest.spyOn(yargs, 'options').mockReturnValue(yargs)
      const positionalSpy = jest.spyOn(yargs, 'positional').mockReturnValue(yargs)
      const builder = EditCommand.getCommand().builder as (yargs: Argv) => Argv
      builder(yargs)
      expect(showHelpOnFailSpy.mock.calls).toEqual([[true]])
      expect(optionsSpy.mock.calls).toHaveLength(1)
      expect(positionalSpy.mock.calls).toEqual([
        [
          'existing',
          { description: 'Name of existing software configuration to edit', type: 'string', demandOption: true },
        ],
      ])
    })
    it('handler throws error if no options passed', async () => {
      const handler = EditCommand.getCommand().handler as (args: Arguments) => void
      await expect(handler(await yargs.argv)).rejects.toThrow('Must provide something to change as an option/flag')
    })
    it('handler throws error if static type and directory specified', async () => {
      jest.spyOn(EditCommand, 'getCommandTypeArgument').mockReturnValueOnce(CommandType.Static)
      jest.spyOn(EditCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'directory' ? 'test' : ''
      })
      const handler = EditCommand.getCommand().handler as (args: Arguments) => void
      await expect(handler(await yargs.argv)).rejects.toThrow(
        'The "--directory" option is not compatible with "--type=static"'
      )
    })
    it('handler throws error if static type and regex specified', async () => {
      jest.spyOn(EditCommand, 'getCommandTypeArgument').mockReturnValueOnce(CommandType.Static)
      jest.spyOn(EditCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'regex' ? 'test' : ''
      })
      const handler = EditCommand.getCommand().handler as (args: Arguments) => void
      await expect(handler(await yargs.argv)).rejects.toThrow(
        'The "--regex" option is not compatible with "--type=static"'
      )
    })
    it('handler throws error if dynamic type and command specified', async () => {
      jest.spyOn(EditCommand, 'getCommandTypeArgument').mockReturnValueOnce(CommandType.Dynamic)
      jest.spyOn(EditCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'command' ? 'test' : ''
      })
      const handler = EditCommand.getCommand().handler as (args: Arguments) => void
      await expect(handler(await yargs.argv)).rejects.toThrow(
        'The "--command" option is not compatible with "--type=dynamic"'
      )
    })
    it('executable passed to editConfiguration is undefined if no command, directory or regex specified', async () => {
      const editConfigurationSpy = jest.spyOn(Edit, 'editConfiguration').mockResolvedValue()
      const name = 'test'
      jest.spyOn(EditCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'name' ? name : ''
      })
      const handler = EditCommand.getCommand().handler as (args: Arguments) => void
      await handler(await yargs.argv)
      expect(editConfigurationSpy.mock.calls).toEqual([
        [
          {
            inputs: {
              existing: '',
              name,
              type: undefined,
              executable: undefined,
              args: '',
              shellOverride: '',
              installedRegex: '',
              url: '',
              latestRegex: '',
              interactive: undefined,
            },
          },
        ],
      ])
    })
    it('static command passed to editConfiguration if command option specified', async () => {
      const editConfigurationSpy = jest.spyOn(Edit, 'editConfiguration').mockResolvedValue()
      const command = 'test'
      jest.spyOn(EditCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'command' ? command : ''
      })
      const handler = EditCommand.getCommand().handler as (args: Arguments) => void
      await handler(await yargs.argv)
      expect(editConfigurationSpy.mock.calls).toEqual([
        [
          {
            inputs: {
              existing: '',
              name: '',
              type: undefined,
              executable: {
                command,
              },
              args: '',
              shellOverride: '',
              installedRegex: '',
              url: '',
              latestRegex: '',
              interactive: undefined,
            },
          },
        ],
      ])
    })
    it('dynamic command passed to editConfiguration if directory option specified', async () => {
      const editConfigurationSpy = jest.spyOn(Edit, 'editConfiguration').mockResolvedValue()
      const directory = 'ent'
      jest.spyOn(EditCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'directory' ? directory : ''
      })
      const handler = EditCommand.getCommand().handler as (args: Arguments) => void
      await handler(await yargs.argv)
      expect(editConfigurationSpy.mock.calls).toEqual([
        [
          {
            inputs: {
              existing: '',
              name: '',
              type: undefined,
              executable: {
                directory,
                regex: '',
              },
              args: '',
              shellOverride: '',
              installedRegex: '',
              url: '',
              latestRegex: '',
              interactive: undefined,
            },
          },
        ],
      ])
    })
    it('dynamic command passed to editConfiguration if regex option specified', async () => {
      const editConfigurationSpy = jest.spyOn(Edit, 'editConfiguration').mockResolvedValue()
      const regex = 'orc'
      jest.spyOn(EditCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        return option.key === 'regex' ? regex : ''
      })
      const handler = EditCommand.getCommand().handler as (args: Arguments) => void
      await handler(await yargs.argv)
      expect(editConfigurationSpy.mock.calls).toEqual([
        [
          {
            inputs: {
              existing: '',
              name: '',
              type: undefined,
              executable: {
                directory: '',
                regex,
              },
              args: '',
              shellOverride: '',
              installedRegex: '',
              url: '',
              latestRegex: '',
              interactive: undefined,
            },
          },
        ],
      ])
    })
    it('dynamic command passed to editConfiguration if directory and regex option specified', async () => {
      const editConfigurationSpy = jest.spyOn(Edit, 'editConfiguration').mockResolvedValue()
      const directory = 'elf'
      const regex = 'immortal'
      jest.spyOn(EditCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        if (option.key === 'directory') {
          return directory
        } else if (option.key === 'regex') {
          return regex
        } else {
          return ''
        }
      })
      const handler = EditCommand.getCommand().handler as (args: Arguments) => void
      await handler(await yargs.argv)
      expect(editConfigurationSpy.mock.calls).toEqual([
        [
          {
            inputs: {
              existing: '',
              name: '',
              type: undefined,
              executable: {
                directory,
                regex,
              },
              args: '',
              shellOverride: '',
              installedRegex: '',
              url: '',
              latestRegex: '',
              interactive: undefined,
            },
          },
        ],
      ])
    })
    it('all options passed to editConfiguration if all specified and static', async () => {
      const existing = 'test all static existing'
      const name = 'test all static name'
      const type = CommandType.Static
      const command = 'test all static command'
      const args = 'test all static args'
      const shellOverride = 'test all static shellOverride'
      const installedRegex = 'test all static installedRegex'
      const latestRegex = 'test all static latestRegex'
      const url = 'test all static url'
      const interactive = true
      const editConfigurationSpy = jest.spyOn(Edit, 'editConfiguration').mockResolvedValue()
      jest.spyOn(EditCommand, 'getCommandTypeArgument').mockReturnValueOnce(type)
      jest.spyOn(EditCommand, 'getBooleanArgument').mockReturnValueOnce(interactive)
      jest.spyOn(EditCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        if (option.key === 'existing') {
          return existing
        } else if (option.key === 'name') {
          return name
        } else if (option.key === 'command') {
          return command
        } else if (option.key === 'arguments') {
          return args
        } else if (option.key === 'shellOverride') {
          return shellOverride
        } else if (option.key === 'installedRegex') {
          return installedRegex
        } else if (option.key === 'url') {
          return url
        } else if (option.key === 'latestRegex') {
          return latestRegex
        } else {
          return ''
        }
      })
      const handler = EditCommand.getCommand().handler as (args: Arguments) => void
      await handler(await yargs.argv)
      expect(editConfigurationSpy.mock.calls).toEqual([
        [
          {
            inputs: {
              existing,
              name,
              type,
              executable: {
                command,
              },
              args,
              shellOverride,
              installedRegex,
              url,
              latestRegex,
              interactive,
            },
          },
        ],
      ])
    })
    it('all options passed to editConfiguration if all specified and dynamic', async () => {
      const existing = 'test all dynamic existing'
      const name = 'test all dynamic name'
      const type = CommandType.Dynamic
      const directory = 'test all dynamic directory'
      const regex = 'test all dynamic regex'
      const args = 'test all dynamic args'
      const shellOverride = 'test all dynamic shellOverride'
      const installedRegex = 'test all dynamic installedRegex'
      const latestRegex = 'test all dynamic latestRegex'
      const url = 'test all dynamic url'
      const interactive = false
      const editConfigurationSpy = jest.spyOn(Edit, 'editConfiguration').mockResolvedValue()
      jest.spyOn(EditCommand, 'getCommandTypeArgument').mockReturnValueOnce(type)
      jest.spyOn(EditCommand, 'getBooleanArgument').mockReturnValueOnce(interactive)
      jest.spyOn(EditCommand, 'getStringArgument').mockImplementation((argv: Arguments, option: Option): string => {
        if (option.key === 'existing') {
          return existing
        } else if (option.key === 'name') {
          return name
        } else if (option.key === 'directory') {
          return directory
        } else if (option.key === 'regex') {
          return regex
        } else if (option.key === 'arguments') {
          return args
        } else if (option.key === 'shellOverride') {
          return shellOverride
        } else if (option.key === 'installedRegex') {
          return installedRegex
        } else if (option.key === 'url') {
          return url
        } else if (option.key === 'latestRegex') {
          return latestRegex
        } else {
          return ''
        }
      })
      const handler = EditCommand.getCommand().handler as (args: Arguments) => void
      await handler(await yargs.argv)
      expect(editConfigurationSpy.mock.calls).toEqual([
        [
          {
            inputs: {
              existing,
              name,
              type,
              executable: {
                directory,
                regex,
              },
              args,
              shellOverride,
              installedRegex,
              url,
              latestRegex,
              interactive,
            },
          },
        ],
      ])
    })
  })
})
