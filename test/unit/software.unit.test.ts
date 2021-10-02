import * as executable from '../../src/software/executable'
import SelfReference from '../../src/util/self-reference'
import Software, { getExecutable, getFromRegex, getFromExecutable } from '../../src/software/software'
import * as execute from '../../src/util/execute-async'

describe('Software Unit Tests', () => {
  describe('constructor', () => {
    it('throw error if name empty', () => {
      expect(() => {
        new Software({
          name: '',
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
  describe('getExecutable', () => {
    it('Static returns command', async () => {
      const command = 'world'
      await expect(
        getExecutable({
          command,
        })
      ).resolves.toBe(command)
    })
    it('Dynamic does not return command', async () => {
      const mockExecutable = 'dynamic-test'
      const getDynamicExecutableSpy = jest.spyOn(executable, 'getDynamicExecutable').mockResolvedValue(mockExecutable)
      await expect(
        getExecutable({
          directory: 'ola',
          regex: 'goodbye',
        })
      ).resolves.toBe(mockExecutable)
      expect(getDynamicExecutableSpy.mock.calls.length).toBe(1)
    })
  })
  describe('getFromExecutable', () => {
    it('does not add shell to options if shell not provided', async () => {
      const stdout = 'no shell'
      await testGetFromExecutable({
        command: 'hermits',
        directory: 'anomuran decapod crustaceans',
        args: 'mollusc',
        addshell: false,
        expectshell: false,
        stdout,
        stderr: '',
        expectedReturn: stdout,
      })
    })
    it('does not add shell to options if shell undefined', async () => {
      const stdout = 'undefined shell'
      await testGetFromExecutable({
        command: 'cone murex',
        directory: 'muricidae',
        args: 'venus',
        shell: undefined,
        addshell: true,
        expectshell: false,
        stdout,
        stderr: '',
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
        addshell: true,
        expectshell: false,
        stdout,
        stderr: '',
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
        addshell: true,
        expectshell: true,
        stdout,
        stderr: '',
        expectedReturn: stdout,
      })
    })
    it('returns stderr even if no stdout', async () => {
      const stderr = 'just stderr'
      await testGetFromExecutable({
        command: 'broken',
        directory: 'invalid',
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
        directory: 'the best of us',
        args: 'crocodile',
        stdout,
        stderr,
        expectedReturn: `${stdout}${stderr}`,
      })
    })
    it('returns empty string if no stdout or stderr', async () => {
      await testGetFromExecutable({
        command: 'silence',
        directory: 'sounds',
        args: 'none',
        stdout: '',
        stderr: '',
        expectedReturn: '',
      })
    })
    describe('self-reference', () => {
      const defaultEntrypoint = '/build/src/index.js'
      beforeEach(() => {
        ;(process as any).pkg = { defaultEntrypoint }
      })
      it('appends default entrypoint if referencing self from current relative directory', async () => {
        const command = 'appends-default-current-dir'
        const args = '--version'
        const stdout = 'cowbell'
        const stderr = 'triangle'
        jest.spyOn(SelfReference, 'getName').mockReturnValue(command)
        await testGetFromExecutable({
          command,
          directory: '.', // ignore-duplicate-test-resource
          args,
          stdout,
          stderr,
          expectedReturn: `${stdout}${stderr}`,
          expectedExecCall: `./${command} ${defaultEntrypoint} ${args}`, // TODO: remove "./" in the future (when the working directory is a separate question)
        })
      })
      it('appends default entrypoint if referencing self from absolute directory', async () => {
        const command = 'appends-default-absolute-dir'
        const directory = '/path/to/self'
        const args = 'version'
        const stdout = 'bramble'
        const stderr = 'jam'
        jest.spyOn(SelfReference, 'getName').mockReturnValue(command)
        jest.spyOn(SelfReference, 'getDirectory').mockReturnValue(directory)
        await testGetFromExecutable({
          command,
          directory,
          args,
          stdout,
          stderr,
          expectedReturn: `${stdout}${stderr}`,
          expectedExecCall: `./${command} ${defaultEntrypoint} ${args}`, // TODO: remove "./" in the future (when the working directory is a separate question)
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
          args,
          stdout,
          stderr,
          expectedReturn: `${stdout}${stderr}`,
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
          args,
          stdout,
          stderr,
          expectedReturn: `${stdout}${stderr}`,
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
          args,
          stdout,
          stderr,
          expectedReturn: `${stdout}${stderr}`,
        })
      })
    })
  })
})

async function testGetFromExecutable({
  command,
  directory,
  shell,
  addshell = false,
  expectshell = false,
  args,
  stdout,
  stderr,
  expectedReturn,
  expectedExecCall,
}: {
  command: string
  directory: string
  shell?: string
  addshell?: boolean
  expectshell?: boolean
  args?: string
  stdout: string
  stderr: string
  expectedReturn: string
  expectedExecCall?: string
}) {
  const executeSpy = jest.spyOn(execute, 'default').mockResolvedValue({
    stdout,
    stderr,
  })
  const options: any = {
    command,
    directory,
    args,
  }
  if (addshell) {
    options.shell = shell
  }
  await expect(getFromExecutable(options)).resolves.toBe(expectedReturn)
  const executeOptions: any = {
    cwd: directory,
  }
  if (expectshell) {
    executeOptions.shell = shell
  }
  expect(JSON.stringify(executeSpy.mock.calls, null, 2)).toBe(
    JSON.stringify([[expectedExecCall || `${command} ${args}`, executeOptions]], null, 2)
  )
}
