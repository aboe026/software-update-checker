import * as executable from '../../src/software/executable'
import * as execute from '../../src/util/execute-async'
import SelfReference from '../../src/util/self-reference'
import Software, { getCommand, getFromRegex, getFromExecutable } from '../../src/software/software'
import TestUtil from '../helpers/test-util'

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
      const getRejection = (directory: string, args: string) => {
        return `node:internal/modules/cjs/loader:936
          throw err;
          ^

          Error: Cannot find module '${directory}${
          directory.endsWith(TestUtil.DIRECTORY_SEPARATOR) ? '' : TestUtil.DIRECTORY_SEPARATOR
        }${args}'
              at Function.Module._resolveFilename (node:internal/modules/cjs/loader:933:15)
              at Function._resolveFilename (pkg/prelude/bootstrap.js:1966:46)
              at Function.Module._load (node:internal/modules/cjs/loader:778:27)
              at Function.runMain (pkg/prelude/bootstrap.js:1994:12)
              at node:internal/main/run_main_module:17:47 {
            code: 'MODULE_NOT_FOUND',
            requireStack: []
          }`
      }
      it('adds default entrypoint to command if expected error thrown without directory at root', async () => {
        const command = 'adds-default-entrypoint-no-dir-root'
        const getDirectoryReturn = TestUtil.getFilePath([''])
        const args = 'cowbell'
        const stdout = 'default entrypoint no dir root'
        await testGetFromExecutable({
          command,
          getDirectoryReturn,
          args,
          shell: '',
          stdout,
          rejection: getRejection(getDirectoryReturn, args),
          expectedReturn: stdout,
          expectedExecCalls: [
            [`${command} ${args}`, {}],
            [`${command} ${defaultEntrypoint} ${args}`, {}],
          ],
          expectedGetDirectoryCalls: [[]],
        })
      })
      it('adds default entrypoint to command if expected error thrown without directory at non-root', async () => {
        const command = 'adds-default-entrypoint-no-dir-non-root'
        const getDirectoryReturn = TestUtil.getFilePath(['down', 'the', 'river'])
        const args = 'dawn'
        const stdout = 'default entrypoint no dir non-root'
        await testGetFromExecutable({
          command,
          getDirectoryReturn,
          args,
          shell: '',
          stdout,
          rejection: getRejection(getDirectoryReturn, args),
          expectedReturn: stdout,
          expectedExecCalls: [
            [`${command} ${args}`, {}],
            [`${command} ${defaultEntrypoint} ${args}`, {}],
          ],
          expectedGetDirectoryCalls: [[]],
        })
      })
      it('adds default entrypoint to command if expected error thrown with root directory', async () => {
        const command = 'adds-default-entrypoint-with-root-dir'
        const directory = 'bramble'
        const args = 'jam'
        const stdout = 'default entrypoint with root dir'
        await testGetFromExecutable({
          command,
          directory,
          addDirectory: true,
          args,
          shell: '',
          stdout,
          rejection: getRejection(directory, args),
          expectedReturn: stdout,
          expectedExecCalls: [
            [
              `${command} ${args}`,
              {
                cwd: directory,
              },
            ],
            [
              `${command} ${defaultEntrypoint} ${args}`,
              {
                cwd: directory,
              },
            ],
          ],
        })
      })
      it('adds default entrypoint to command if expected error thrown with non-root directory no trailing slash', async () => {
        const command = 'adds-default-entrypoint-with-non-root-dir-no-trailing-slash'
        const directory = TestUtil.getFilePath(['ebb'])
        const args = 'flow'
        const stdout = 'default entrypoint with non root dir no trailing slash'
        await testGetFromExecutable({
          command,
          directory,
          addDirectory: true,
          args,
          shell: '',
          stdout,
          rejection: getRejection(directory, args),
          expectedReturn: stdout,
          expectedExecCalls: [
            [
              `${command} ${args}`,
              {
                cwd: directory,
              },
            ],
            [
              `${command} ${defaultEntrypoint} ${args}`,
              {
                cwd: directory,
              },
            ],
          ],
        })
      })
      it('adds default entrypoint to command if expected error thrown with non-root directory trailing slash', async () => {
        const command = 'adds-default-entrypoint-with-non-root-dir-trailing-slash'
        const directory = TestUtil.getFilePath(['flotsam', ''])
        const args = 'jetsam'
        const stdout = 'default entrypoint with non root dir trailing slash'
        await testGetFromExecutable({
          command,
          directory,
          addDirectory: true,
          args,
          shell: '',
          stdout,
          rejection: getRejection(directory, args),
          expectedReturn: stdout,
          expectedExecCalls: [
            [
              `${command} ${args}`,
              {
                cwd: directory,
              },
            ],
            [
              `${command} ${defaultEntrypoint} ${args}`,
              {
                cwd: directory,
              },
            ],
          ],
        })
      })
      it('adds default entrypoint to command if expected error thrown without args', async () => {
        const command = 'adds-default-entrypoint-no-args'
        const getDirectoryReturn = TestUtil.getFilePath([''])
        const args = ''
        const stdout = 'default entrypoint no args'
        await testGetFromExecutable({
          command,
          getDirectoryReturn: getDirectoryReturn,
          args,
          shell: '',
          stdout,
          rejection: getRejection(getDirectoryReturn, args),
          expectedReturn: stdout,
          expectedExecCalls: [
            [`${command} ${args}`, {}],
            [`${command} ${defaultEntrypoint} ${args}`, {}],
          ],
          expectedGetDirectoryCalls: [[]],
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
  getDirectoryReturn,
  shell,
  addShell = false,
  expectedShell = false,
  args,
  stdout,
  stderr = '',
  rejection,
  expectedReturn,
  expectedExecCalls,
  expectedGetDirectoryCalls = [],
}: {
  command: string
  directory?: string
  addDirectory?: boolean
  expectedDirectory?: boolean
  getDirectoryReturn?: string
  shell?: string
  addShell?: boolean
  expectedShell?: boolean
  args?: string
  stdout: string
  stderr?: string
  rejection?: string
  expectedReturn?: string
  expectedExecCalls?: (string[] | object)[]
  expectedGetDirectoryCalls?: string[][]
}) {
  const executeSpy = jest.spyOn(execute, 'default')
  if (rejection) {
    executeSpy.mockRejectedValueOnce(rejection)
  }
  executeSpy.mockResolvedValueOnce({
    stdout,
    stderr,
  })
  const getDirectorySpy = jest.spyOn(SelfReference, 'getDirectory')
  if (getDirectoryReturn) {
    getDirectorySpy.mockReturnValue(getDirectoryReturn)
  }
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
  if (expectedGetDirectoryCalls) {
    expect(JSON.stringify(getDirectorySpy.mock.calls, null, 2)).toBe(JSON.stringify(expectedGetDirectoryCalls, null, 2))
  }
  const expectedOptions: any = {}
  if (expectedDirectory) {
    expectedOptions.cwd = directory
  }
  if (expectedShell) {
    expectedOptions.shell = shell
  }
  expect(JSON.stringify(executeSpy.mock.calls, null, 2)).toBe(
    JSON.stringify(expectedExecCalls || [[`${command} ${args}`, expectedOptions]], null, 2)
  )
}
