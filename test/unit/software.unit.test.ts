import * as executable from '../../src/software/executable'
import SelfReference from '../../src/util/self-reference'
import Software, { getCommand, getFromRegex, getFromExecutable } from '../../src/software/software'
import * as execute from '../../src/util/execute-async'

describe('Software Unit Tests', () => {
  describe('constructor', () => {
    it('throw error if name empty', () => {
      expect(() => {
        new Software({
          name: '',
          directory: '',
          executable: {
            command: '',
          },
          args: '',
          installedRegex: '',
          url: '',
          latestRegex: '',
        })
      }).toThrow('Name must be non-empty')
    })
    it('do not throw error if name non-empty', () => {
      expect(() => {
        new Software({
          name: 'a',
          directory: '',
          executable: {
            command: '',
          },
          args: '',
          installedRegex: '',
          url: '',
          latestRegex: '',
        })
      }).not.toThrow()
    })
  })
  describe('getFromRegex', () => {
    it('throw error if no match', () => {
      expect(() => getFromRegex('version 1.0.0', /version v(.*)/)).toThrow(
        'Could not find match for regex "/version v(.*)/" in text "version 1.0.0"'
      )
    })
    it('retuns correct single match at end', () => {
      expect(getFromRegex('version v1.0.0', /version v(.*)/)).toBe('1.0.0')
    })
    it('retuns correct single match in middle', () => {
      expect(getFromRegex('version v1.0.0 build 234', /version v(\d+\.\d+(\.\d+)?)/)).toBe('1.0.0')
    })
    it('retuns correct single match at beginning', () => {
      expect(getFromRegex('1.0.0 build 333', /(\d+\.\d+(\.\d+)?)/)).toBe('1.0.0')
    })
    it('retuns first match out of multiple', () => {
      expect(getFromRegex('client version v1.0.0, server version v2.0.0', /version v(\d+\.\d+(\.\d+)?)/)).toBe('1.0.0')
    })
  })
  describe('getCommand', () => {
    it('static returns command', async () => {
      const command = 'world'
      const getDynamicExecutableSpy = jest.spyOn(executable, 'getDynamicExecutable')
      await expect(
        getCommand({
          executable: {
            command,
          },
        })
      ).resolves.toBe(command)
      expect(getDynamicExecutableSpy).toHaveBeenCalledTimes(0)
    })
    it('dynamic returns resolved command with directory', async () => {
      const command = 'dynamic-with-dir'
      const regex = 'goodbye'
      const directory = 'ola'
      const getDynamicExecutableSpy = jest.spyOn(executable, 'getDynamicExecutable').mockResolvedValue(command)
      await expect(
        getCommand({
          executable: {
            regex,
          },
          directory,
        })
      ).resolves.toBe(command)
      expect(getDynamicExecutableSpy).toHaveBeenCalledTimes(1)
      expect(getDynamicExecutableSpy).toHaveBeenCalledWith({
        regex,
        directory,
      })
    })
    it('dynamic returns resolved command without directory', async () => {
      const command = 'dynamic-no-dir'
      const regex = 'salsa'
      const getDynamicExecutableSpy = jest.spyOn(executable, 'getDynamicExecutable').mockResolvedValue(command)
      await expect(
        getCommand({
          executable: {
            regex,
          },
        })
      ).resolves.toBe(command)
      expect(getDynamicExecutableSpy).toHaveBeenCalledTimes(1)
      expect(getDynamicExecutableSpy).toHaveBeenCalledWith({
        regex,
      })
    })
  })
  describe('getFromExecutable', () => {
    it('returns stderr even if no stdout', async () => {
      const stderr = 'just stderr'
      await testGetFromExecutable({
        command: 'broken',
        args: 'null',
        stdout: '',
        stderr,
        expectedReturn: stderr,
      })
    })
    it('concatenates stdout with stderr', async () => {
      const stdout = 'with stderr'
      const stderr = 'Crikey!'
      await testGetFromExecutable({
        command: 'hunter',
        args: 'crocodile',
        stdout,
        stderr,
      })
    })
    it('returns empty string if no stdout or stderr', async () => {
      await testGetFromExecutable({
        command: 'silence',
        args: 'none',
        stdout: '',
        expectedReturn: '',
      })
    })
    describe('directory', () => {
      it('does not add directory to options if directory not provided', async () => {
        const stdout = 'woof'
        await testGetFromExecutable({
          command: 'roll',
          args: 'over',
          stdout,
          expectedReturn: stdout,
        })
      })
      it('does not add directory to options if directory undefined', async () => {
        const stdout = 'abe'
        await testGetFromExecutable({
          directory: undefined,
          command: 'treads',
          args: 'tire',
          addDirectory: true,
          expectedDirectory: false,
          stdout,
          expectedReturn: stdout,
        })
      })
      it('does not add directory to options if directory empty string', async () => {
        const stdout = 'handlebar'
        await testGetFromExecutable({
          command: 'hair',
          directory: '',
          args: 'lip',
          addDirectory: true,
          expectedDirectory: false,
          stdout,
          expectedReturn: stdout,
        })
      })
      it('adds directory to options if directory provided', async () => {
        const stdout = 'directory provided'
        await testGetFromExecutable({
          command: 'phone',
          directory: 'address',
          args: 'book',
          addDirectory: true,
          expectedDirectory: true,
          stdout,
          expectedReturn: stdout,
        })
      })
    })
    describe('shell', () => {
      it('does not add shell to options if shell not provided', async () => {
        const stdout = 'no shell'
        await testGetFromExecutable({
          command: 'hermits',
          args: 'mollusc',
          addShell: false,
          expectedShell: false,
          stdout,
          expectedReturn: stdout,
        })
      })
      it('does not add shell to options if shell undefined', async () => {
        const stdout = 'undefined shell'
        await testGetFromExecutable({
          command: 'cone murex',
          args: 'venus',
          shell: undefined,
          addShell: true,
          expectedShell: false,
          stdout,
          expectedReturn: stdout,
        })
      })
      it('does not add shell to options if shell empty string', async () => {
        const stdout = 'empty string shell'
        await testGetFromExecutable({
          command: 'vacancy',
          directory: 'crab',
          args: 'bigger',
          shell: '',
          addShell: true,
          expectedShell: false,
          stdout,
          expectedReturn: stdout,
        })
      })
      it('adds shell to options if shell provided', async () => {
        const stdout = 'shell provided'
        await testGetFromExecutable({
          command: 'villians',
          directory: 'comics',
          args: 'Dr. Gregory Herd',
          shell: 'shadrac',
          addShell: true,
          expectedShell: true,
          stdout,
          expectedReturn: stdout,
        })
      })
    })
    describe('self-reference', () => {
      const defaultEntrypoint = '/build/src/index.js'
      beforeEach(() => {
        ;(process as any).pkg = { defaultEntrypoint }
      })
      it('appends default entrypoint if referencing self by name from current relative directory', async () => {
        const command = 'appends-default-current-dir-name'
        const args = '--version'
        const stdout = 'cowbell'
        const stderr = 'triangle'
        jest.spyOn(SelfReference, 'getName').mockReturnValue(command)
        await testGetFromExecutable({
          command,
          directory: '.', // ignore-duplicate-test-resource
          addDirectory: true,
          expectedDirectory: true,
          args,
          stdout,
          stderr,
          expectedExecCall: `${command} ${defaultEntrypoint} ${args}`,
        })
      })
      it('appends default entrypoint if referencing self by dot slashed name from current relative directory', async () => {
        const command = 'appends-default-current-dir-dot-slash-name'
        const args = 'dice'
        const stdout = 'six-fives'
        const stderr = 'liar!'
        jest.spyOn(SelfReference, 'getName').mockReturnValue(command)
        await testGetFromExecutable({
          command: `./${command}`,
          directory: '.', // ignore-duplicate-test-resource
          addDirectory: true,
          expectedDirectory: true,
          args,
          stdout,
          stderr,
          expectedExecCall: `./${command} ${defaultEntrypoint} ${args}`,
        })
      })
      it('appends default entrypoint if referencing self by name from absolute directory', async () => {
        const command = 'appends-default-absolute-dir-name'
        const directory = '/path/to/self'
        const args = 'version'
        const stdout = 'bramble'
        const stderr = 'jam'
        jest.spyOn(SelfReference, 'getName').mockReturnValue(command)
        jest.spyOn(SelfReference, 'getDirectory').mockReturnValue(directory)
        await testGetFromExecutable({
          command,
          directory,
          addDirectory: true,
          expectedDirectory: true,
          args,
          stdout,
          stderr,
          expectedExecCall: `${command} ${defaultEntrypoint} ${args}`,
        })
      })
      it('appends default entrypoint if referencing self by dot slashed name from absolute directory', async () => {
        const command = 'appends-default-absolute-dir-dot-slash-name'
        const directory = 'deer'
        const args = 'circumpolar'
        const stdout = 'caribou'
        const stderr = 'rangifer tarandus'
        jest.spyOn(SelfReference, 'getName').mockReturnValue(command)
        jest.spyOn(SelfReference, 'getDirectory').mockReturnValue(directory)
        await testGetFromExecutable({
          command: `./${command}`,
          directory,
          addDirectory: true,
          expectedDirectory: true,
          args,
          stdout,
          stderr,
          expectedExecCall: `./${command} ${defaultEntrypoint} ${args}`,
        })
      })
      it('does not append default entrypoint if command is not self from current relative directory', async () => {
        const command = 'no-append-relative-dir'
        const args = '-v'
        const stdout = 'ebb'
        const stderr = 'flow'
        jest.spyOn(SelfReference, 'getName').mockReturnValue(command)
        await testGetFromExecutable({
          command: 'does not match',
          directory: '.', // ignore-duplicate-test-resource
          addDirectory: true,
          expectedDirectory: true,
          args,
          stdout,
          stderr,
        })
      })
      it('does not append default entrypoint if command is not self from absolute directory', async () => {
        const command = 'no-append-absolute-dir'
        const directory = '/path/to/where/executed/at'
        const args = 'v'
        const stdout = 'flotsam'
        const stderr = 'jetsam'
        jest.spyOn(SelfReference, 'getName').mockReturnValue(command)
        jest.spyOn(SelfReference, 'getDirectory').mockReturnValue(directory)
        await testGetFromExecutable({
          command: 'different',
          directory,
          addDirectory: true,
          expectedDirectory: true,
          args,
          stdout,
          stderr,
        })
      })
      it('does not append default entrypoint if referencing self but not self directory', async () => {
        const command = 'no-append-not-self-dir'
        const directory = '/path/to/where/executable/resides'
        const args = 'ver'
        const stdout = 'give'
        const stderr = 'take'
        jest.spyOn(SelfReference, 'getName').mockReturnValue(command)
        jest.spyOn(SelfReference, 'getDirectory').mockReturnValue(directory)
        await testGetFromExecutable({
          command,
          directory: '/path/to/another/dir',
          addDirectory: true,
          expectedDirectory: true,
          args,
          stdout,
          stderr,
        })
      })
      it('does not append default entrypoint if no pkg env var', async () => {
        ;(process as any).pkg = undefined
        const command = 'no-pkg-env-var'
        const args = 'sling'
        const stdout = 'person'
        const stderr = 'hammock'
        jest.spyOn(SelfReference, 'getName').mockReturnValue(command)
        await testGetFromExecutable({
          command,
          directory: '.', // ignore-duplicate-test-resource
          addDirectory: true,
          expectedDirectory: true,
          args,
          stdout,
          stderr,
        })
      })
    })
  })
})

async function testGetFromExecutable({
  command,
  directory,
  addDirectory = false,
  expectedDirectory,
  shell,
  addShell = false,
  expectedShell = false,
  args,
  stdout,
  stderr = '',
  expectedReturn,
  expectedExecCall,
}: {
  command: string
  directory?: string
  addDirectory?: boolean
  expectedDirectory?: boolean
  shell?: string
  addShell?: boolean
  expectedShell?: boolean
  args?: string
  stdout: string
  stderr?: string
  expectedReturn?: string
  expectedExecCall?: string
}) {
  const executeSpy = jest.spyOn(execute, 'default').mockResolvedValue({
    stdout,
    stderr,
  })
  const options: any = {
    command,
    args,
  }

  if (addDirectory) {
    options.directory = directory
  }
  if (addShell) {
    options.shell = shell
  }
  await expect(getFromExecutable(options)).resolves.toBe(expectedReturn || `${stdout}${stderr}`)
  const expectedOptions: any = {}
  if (expectedDirectory) {
    expectedOptions.cwd = directory
  }
  if (expectedShell) {
    expectedOptions.shell = shell
  }
  expect(JSON.stringify(executeSpy.mock.calls, null, 2)).toBe(
    JSON.stringify([[expectedExecCall || `${command} ${args}`, expectedOptions]], null, 2)
  )
}
