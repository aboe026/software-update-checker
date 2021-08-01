import BaseCommand, { OptionsSet } from '../../src/actions/base/base-command'
import { CommandType } from '../../src/software/executable'
import { Option } from '../../src/actions/base/base-options'
import os from 'os'

describe('Base Command Unit Tests', () => {
  describe('sortOptions', () => {
    it('works on empty object', () => {
      expect(BaseCommand.sortOptions({})).toEqual({})
    })
    it('works on single object', () => {
      const option: OptionsSet = {
        foo: {
          alias: ['fizz'],
          description: 'lorem ipsum',
          demandOption: false,
          requiresArg: true,
        },
      }
      expect(BaseCommand.sortOptions(option)).toEqual(option)
    })
    it('works on multipel objects already in order', () => {
      const firstOption: OptionsSet = {
        foo: {
          alias: ['fizz'],
          description: 'lorem ipsum',
          demandOption: false,
          requiresArg: true,
        },
      }
      const lastOption: OptionsSet = {
        bar: {
          alias: ['hello'],
          description: 'world',
        },
      }
      expect(JSON.stringify(BaseCommand.sortOptions({ ...lastOption, ...firstOption }))).toBe(
        JSON.stringify({ ...lastOption, ...firstOption })
      )
    })
    it('works on multipel objects out of order', () => {
      const firstOption: OptionsSet = {
        foo: {
          alias: ['fizz'],
          description: 'lorem ipsum',
          demandOption: false,
          requiresArg: true,
        },
      }
      const lastOption: OptionsSet = {
        bar: {
          alias: ['hello'],
          description: 'world',
        },
      }
      expect(JSON.stringify(BaseCommand.sortOptions({ ...firstOption, ...lastOption }))).toBe(
        JSON.stringify({ ...lastOption, ...firstOption })
      )
    })
  })
  describe('getStringArgument', () => {
    it('returns undefined if no arguments match', () => {
      expect(
        BaseCommand.getStringArgument(
          {
            $0: 'command',
            _: ['non-option'],
          },
          new Option({
            key: 'foo',
            value: {
              description: 'hello world',
            },
          })
        )
      ).toBe(undefined)
    })
    it('returns undefined if no string arguments match', () => {
      expect(
        BaseCommand.getStringArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: true,
            bar: 2,
            fiz: undefined,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['bar', 'fiz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(undefined)
    })
    it('returns value if argument matches key without alias', () => {
      expect(
        BaseCommand.getStringArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: 'bar',
          },
          new Option({
            key: 'foo',
            value: {
              description: 'hello world',
            },
          })
        )
      ).toBe('bar')
    })
    it('returns value if argument matches key with other aliases', () => {
      expect(
        BaseCommand.getStringArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: 'bar',
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe('bar')
    })
    it('returns value if argument matches alias', () => {
      expect(
        BaseCommand.getStringArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: 'bar',
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe('bar')
    })
    it('returns key value instead of alias value', () => {
      expect(
        BaseCommand.getStringArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: 'biz',
            foo: 'bar',
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe('bar')
    })
    it('returns second alias value if multiple and no key', () => {
      expect(
        BaseCommand.getStringArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: 'biz',
            foo: 'bar',
          },
          new Option({
            key: 'hello',
            value: {
              alias: ['fizz', 'foo'],
              description: 'hello world',
            },
          })
        )
      ).toBe('bar')
    })
    it('returns second alias value if multiple and option no key', () => {
      expect(
        BaseCommand.getStringArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: 'biz',
            foo: 'bar',
          },
          new Option({
            key: '',
            value: {
              alias: ['fizz', 'foo'],
              description: 'hello world',
            },
          })
        )
      ).toBe('bar')
    })
  })
  describe('getBooleanArgument', () => {
    it('returns undefined if no arguments match', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
          },
          new Option({
            key: 'foo',
            value: {
              description: 'hello world',
            },
          })
        )
      ).toBe(undefined)
    })
    it('returns undefined if no boolean arguments match', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: 'true',
            bar: 2,
            fiz: undefined,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['bar', 'fiz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(undefined)
    })
    it('returns true value if argument matches key without alias', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: true,
          },
          new Option({
            key: 'foo',
            value: {
              description: 'hello world',
            },
          })
        )
      ).toBe(true)
    })
    it('returns false value if argument matches key without alias', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: false,
          },
          new Option({
            key: 'foo',
            value: {
              description: 'hello world',
            },
          })
        )
      ).toBe(false)
    })
    it('returns true value if argument matches key with other aliases', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: true,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(true)
    })
    it('returns false value if argument matches key with other aliases', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: false,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(false)
    })
    it('returns true value if argument matches alias', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: true,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(true)
    })
    it('returns false value if argument matches alias', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: false,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(false)
    })
    it('returns key true value instead of alias value', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: false,
            foo: true,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(true)
    })
    it('returns key false value instead of alias value', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: true,
            foo: false,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(false)
    })
    it('returns second alias true value if multiple and no key', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: false,
            foo: true,
          },
          new Option({
            key: 'hello',
            value: {
              alias: ['fizz', 'foo'],
              description: 'hello world',
            },
          })
        )
      ).toBe(true)
    })
    it('returns second alias false value if multiple and no key', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: true,
            foo: false,
          },
          new Option({
            key: 'hello',
            value: {
              alias: ['fizz', 'foo'],
              description: 'hello world',
            },
          })
        )
      ).toBe(false)
    })
    it('returns second alias false value if multiple and option no key', () => {
      expect(
        BaseCommand.getBooleanArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: true,
            foo: false,
          },
          new Option({
            key: '',
            value: {
              alias: ['fizz', 'foo'],
              description: 'hello world',
            },
          })
        )
      ).toBe(false)
    })
  })
  describe('getCommandTypeArgument', () => {
    it('returns undefined if no arguments match', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
          },
          new Option({
            key: 'foo',
            value: {
              description: 'hello world',
            },
          })
        )
      ).toBe(undefined)
    })
    it('returns undefined if no CommandType arguments match', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: 'true',
            bar: 2,
            fiz: undefined,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['bar', 'fiz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(undefined)
    })
    it('returns static value if argument matches key without alias', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: CommandType.Static,
          },
          new Option({
            key: 'foo',
            value: {
              description: 'hello world',
            },
          })
        )
      ).toBe(CommandType.Static)
    })
    it('returns dynamic value if argument matches key without alias', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: CommandType.Dynamic,
          },
          new Option({
            key: 'foo',
            value: {
              description: 'hello world',
            },
          })
        )
      ).toBe(CommandType.Dynamic)
    })
    it('returns static value if argument matches key with other aliases', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: CommandType.Static,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(CommandType.Static)
    })
    it('returns dynamic value if argument matches key with other aliases', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            foo: CommandType.Dynamic,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(CommandType.Dynamic)
    })
    it('returns static value if argument matches alias', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: CommandType.Static,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(CommandType.Static)
    })
    it('returns dynamic value if argument matches alias', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: CommandType.Dynamic,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(CommandType.Dynamic)
    })
    it('returns key static value instead of alias value', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: CommandType.Dynamic,
            foo: CommandType.Static,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(CommandType.Static)
    })
    it('returns key dynamic value instead of alias value', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: CommandType.Static,
            foo: CommandType.Dynamic,
          },
          new Option({
            key: 'foo',
            value: {
              alias: ['fizz'],
              description: 'hello world',
            },
          })
        )
      ).toBe(CommandType.Dynamic)
    })
    it('returns second alias static value if multiple and no key', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: CommandType.Dynamic,
            foo: CommandType.Static,
          },
          new Option({
            key: 'hello',
            value: {
              alias: ['fizz', 'foo'],
              description: 'hello world',
            },
          })
        )
      ).toBe(CommandType.Static)
    })
    it('returns second alias dynamic value if multiple and no key', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: CommandType.Static,
            foo: CommandType.Dynamic,
          },
          new Option({
            key: 'hello',
            value: {
              alias: ['fizz', 'foo'],
              description: 'hello world',
            },
          })
        )
      ).toBe(CommandType.Dynamic)
    })
    it('returns second alias dynamic value if multiple and option no key', () => {
      expect(
        BaseCommand.getCommandTypeArgument(
          {
            $0: 'command',
            _: ['non-option'],
            fizz: CommandType.Static,
            foo: CommandType.Dynamic,
          },
          new Option({
            key: '',
            value: {
              alias: ['fizz', 'foo'],
              description: 'hello world',
            },
          })
        )
      ).toBe(CommandType.Dynamic)
    })
  })
  describe('getExecutableName', () => {
    it('returns windows exectuable if win32 platform', () => {
      testGetExecutableName({
        platform: 'win32',
        expected: 'software-update-checker-win.exe',
      })
    })
    it('returns macos exectuable if darwin platform', () => {
      testGetExecutableName({
        platform: 'darwin',
        expected: 'software-update-checker-macos',
      })
    })
    it('returns linux exectuable if aix platform', () => {
      testGetExecutableName({
        platform: 'aix',
        expected: 'software-update-checker-linux',
      })
    })
    it('returns linux exectuable if android platform', () => {
      testGetExecutableName({
        platform: 'android',
        expected: 'software-update-checker-linux',
      })
    })
    it('returns linux exectuable if freebsd platform', () => {
      testGetExecutableName({
        platform: 'freebsd',
        expected: 'software-update-checker-linux',
      })
    })
    it('returns linux exectuable if linux platform', () => {
      testGetExecutableName({
        platform: 'linux',
        expected: 'software-update-checker-linux',
      })
    })
    it('returns linux exectuable if openbsd platform', () => {
      testGetExecutableName({
        platform: 'openbsd',
        expected: 'software-update-checker-linux',
      })
    })
    it('returns linux exectuable if sunos platform', () => {
      testGetExecutableName({
        platform: 'sunos',
        expected: 'software-update-checker-linux',
      })
    })
    it('returns linux exectuable if cygwin platform', () => {
      testGetExecutableName({
        platform: 'cygwin',
        expected: 'software-update-checker-linux',
      })
    })
    it('returns linux exectuable if netbsd platform', () => {
      testGetExecutableName({
        platform: 'netbsd',
        expected: 'software-update-checker-linux',
      })
    })
  })
})

function testGetExecutableName({ platform, expected }: { platform: NodeJS.Platform; expected: string }) {
  jest.spyOn(os, 'platform').mockReturnValue(platform)
  expect(BaseCommand.getExecutableName()).toBe(expected)
}
