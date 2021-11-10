import path from 'path'

import { getDynamicExecutable } from '../../src/software/executable'

describe('Executable Func Tests', () => {
  describe('getDynamicExecutable', () => {
    it('Nonexistent directory throws error', async () => {
      const directory = path.join(__dirname, '../helpers/fake')
      await expect(
        getDynamicExecutable({
          directory,
          regex: 'v(.*)',
        })
      ).rejects.toThrow(`Directory specified "${directory}" does not exist. Please specify a valid path.`)
    })
    it('No match throws error', async () => {
      const directory = path.join(__dirname, '../helpers/test-commands')
      const regex = 'fake-command.js'
      await expect(
        getDynamicExecutable({
          directory,
          regex,
        })
      ).rejects.toThrow(`Could not find any file in directory "${directory}" matching regex pattern "${regex}"`)
    })
    it('Single match gets returned', async () => {
      const directory = path.join(__dirname, '../helpers/test-commands')
      const match = 'good-command.js'
      await expect(
        getDynamicExecutable({
          directory,
          regex: match,
        })
      ).resolves.toBe(match)
    })
    it('Second match gets ignored', async () => {
      const directory = path.join(__dirname, '../helpers/test-commands')
      await expect(
        getDynamicExecutable({
          directory,
          regex: '.*-command.js',
        })
      ).resolves.toBe('bad-command.js')
    })
    it('First file not matching regex gets ignored', async () => {
      const directory = path.join(__dirname, '../helpers/test-commands')
      await expect(
        getDynamicExecutable({
          directory,
          regex: 'good-.*',
        })
      ).resolves.toBe('good-command.js')
    })
  })
})
