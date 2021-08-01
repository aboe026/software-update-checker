import child_process, { ExecOptions, ExecException } from 'child_process'
import { ObjectEncodingOptions } from 'fs-extra'
import path from 'path'

import execute from '../../src/execute-async'

jest.mock('child_process')

describe('Execute Async Unit Tests', () => {
  describe('stdout', () => {
    it('non erroring command without options resolves to stdout', async () => {
      const command = 'non erroring no options'
      const options = {}
      const stdout = 'no errors without options'
      const error = null
      const stderr = ''
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command)).resolves.toStrictEqual({ stdout, stderr })
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
    it('non erroring command with empty options resolves to stdout', async () => {
      const command = 'non erroring with empty options'
      const options = {}
      const stdout = 'no errors with empty options'
      const error = null
      const stderr = ''
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command, options)).resolves.toStrictEqual({ stdout, stderr })
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
    it('non erroring command with options resolves to stdout', async () => {
      const command = 'non erroring with options'
      const options = {
        cwd: path.join(__dirname, '../helpers/test-commands'),
      }
      const stdout = 'no errors with options'
      const error = null
      const stderr = ''
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command, options)).resolves.toStrictEqual({ stdout, stderr })
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
  })
  describe('stderr', () => {
    it('sdterr command without options resolves with error', async () => {
      const command = 'erroring no options stderr'
      const options = {}
      const stdout = 'i should not be returned'
      const error = null
      const stderr = 'no options'
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command)).resolves.toStrictEqual({ stdout, stderr })
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
    it('sdterr command with empty options resolves with error', async () => {
      const command = 'erroring empty options stderr'
      const options = {}
      const stdout = 'i should not be returned'
      const error = null
      const stderr = 'empty options'
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command, options)).resolves.toStrictEqual({ stdout, stderr })
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
    it('sdterr command with options resolves with error', async () => {
      const command = 'erroring with options stderr'
      const options = {
        cwd: path.join(__dirname, '../helpers/test-commands'),
      }
      const stdout = 'i should not be returned'
      const error = null
      const stderr = 'with options'
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command, options)).resolves.toStrictEqual({ stdout, stderr })
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
  })
  describe('stdout and stderr', () => {
    it('stdout and stderr command without options resolves with both', async () => {
      const command = 'both no options'
      const options = {}
      const stdout = 'i should be returned both no options'
      const error = null
      const stderr = 'both no options'
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command)).resolves.toStrictEqual({ stdout, stderr })
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
    it('stdout and stderr command empty options resolves with both', async () => {
      const command = 'both empty options'
      const options = {}
      const stdout = 'i should be returned both empty options'
      const error = null
      const stderr = 'both empty options'
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command, options)).resolves.toStrictEqual({ stdout, stderr })
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
    it('stdout and stderr command with options resolves with both', async () => {
      const command = 'both with options'
      const options = {
        cwd: path.join(__dirname, '../helpers/test-commands'),
      }
      const stdout = 'i should be returned both with options'
      const error = null
      const stderr = 'both with options'
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command, options)).resolves.toStrictEqual({ stdout, stderr })
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
  })
  describe('error', () => {
    it('erroring command without options rejects with error', async () => {
      const command = 'erroring no options error'
      const options = {}
      const stdout = 'i should not be returned'
      const error = new Error('no options')
      const stderr = ''
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command)).rejects.toStrictEqual(error)
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
    it('erroring command with empty options rejects with error', async () => {
      const command = 'erroring empty options error'
      const options = {}
      const stdout = 'i should not be returned'
      const error = new Error('empty options')
      const stderr = ''
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command, options)).rejects.toStrictEqual(error)
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
    it('erroring command with options rejects with error', async () => {
      const command = 'erroring with options error'
      const options = {
        cwd: path.join(__dirname, '../helpers/test-commands'),
      }
      const stdout = 'i should not be returned'
      const error = new Error('with options')
      const stderr = ''
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command, options)).rejects.toStrictEqual(error)
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
    it('erroring command with stderr rejects with stderr', async () => {
      const command = 'erroring with empty options stderr'
      const options = {}
      const stdout = 'i should not be returned'
      const error = new Error('i should not be returned either')
      const stderr = 'error with stderr'
      const execSpy = mockExec({
        stdout,
        stderr,
        error,
      })
      await expect(execute(command, options)).rejects.toStrictEqual(stderr)
      expect(JSON.stringify(execSpy.mock.calls, null, 2)).toBe(JSON.stringify([[command, options, null]], null, 2))
    })
  })
})

function mockExec({
  stdout,
  stderr,
  error,
}: {
  stdout: string
  stderr: string
  error: ExecException | null
}): jest.SpyInstance<
  child_process.ChildProcess,
  [
    command: string,
    options: (ObjectEncodingOptions & ExecOptions) | null | undefined,
    callback?: (error: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) => void
  ]
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jest.spyOn(child_process, 'exec').mockImplementation((command, options, callback): any => {
    if (callback) {
      return callback(error, stdout, stderr)
    }
  })
}
