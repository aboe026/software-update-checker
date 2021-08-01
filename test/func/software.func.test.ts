import path from 'path'

import Software, { getFromExecutable, getFromUrl, getExecutable } from '../../src/software/software'
import Website from '../helpers/website'
import TestUtil from '../helpers/test-util'

describe('Software Func Tests', () => {
  describe('getFromExecutable', () => {
    it('captures single word output of command that exits cleanly', async () => {
      await expect(
        getFromExecutable({
          directory: path.join(__dirname, '../helpers/test-commands'),
          command: 'node',
          args: 'good-command.js foo',
        })
      ).resolves.toBe('foo')
    })
    it('captures multi-word output of command that exits cleanly', async () => {
      await expect(
        getFromExecutable({
          directory: path.join(__dirname, '../helpers/test-commands'),
          command: 'node',
          args: 'good-command.js foo bar hello world',
        })
      ).resolves.toBe('foo bar hello world')
    })
    it('captures multi-line output of command that exits cleanly', async () => {
      await expect(
        getFromExecutable({
          directory: path.join(__dirname, '../helpers/test-commands'),
          command: 'node',
          args: `good-command.js foo bar${TestUtil.NEWLINE_CHARS}hello world`,
        })
      ).resolves.toBe('foo bar\nhello world')
    })
  })
  describe('getExecutable', () => {
    it('returns command for static', async () => {
      const command = 'caramel'
      await expect(
        getExecutable({
          command,
        })
      ).resolves.toBe(command)
    })
    it('throws error for non-existent directory', async () => {
      const directory = path.join(__dirname, '../helpers/fake')
      await expect(
        getExecutable({
          directory,
          regex: 'good-c.*',
        })
      ).rejects.toThrow(`Directory specified "${directory}" does not exist. Please specify a valid path.`)
    })
    it('throws error for no matching file', async () => {
      const directory = path.join(__dirname, '../helpers/test-commands')
      const regex = 'fake-.*'
      await expect(
        getExecutable({
          directory,
          regex,
        })
      ).rejects.toThrow(`Could not find any file in directory "${directory}" matching regex pattern "${regex}"`)
    })
    it('returns file for dynamic single match', async () => {
      const directory = path.join(__dirname, '../helpers/test-commands')
      const match = 'good-command.js'
      await expect(
        getExecutable({
          directory,
          regex: match,
        })
      ).resolves.toBe(path.join(directory, match))
    })
    it('returns file for dynamic first match', async () => {
      const directory = path.join(__dirname, '../helpers/test-commands')
      await expect(
        getExecutable({
          directory,
          regex: '.*-command.*',
        })
      ).resolves.toBe(path.join(directory, 'bad-command.js'))
    })
    it('returns file for dynamic ingoring non-match', async () => {
      const directory = path.join(__dirname, '../helpers/test-commands')
      await expect(
        getExecutable({
          directory,
          regex: 'good-command.*',
        })
      ).resolves.toBe(path.join(directory, 'good-command.js'))
    })
  })
  describe('getInstalledVersion', () => {
    it('throws error if error from static executable', async () => {
      const error = 'bad static executable'
      await expect(
        new Software({
          name: 'runtime environments',
          executable: {
            command: 'node',
          },
          args: path.join(__dirname, `../helpers/test-commands/bad-command.js ${error}`),
          installedRegex: 'v(.*)',
          url: '',
          latestRegex: '',
        }).getInstalledVersion()
      ).rejects.toEqual(error)
    })
    it('throws error if dynamic directory does not exist', async () => {
      const directory = path.join(__dirname, '../helpers/test-commands-fake')
      await expect(
        new Software({
          name: 'no dir',
          executable: {
            directory,
            regex: '',
          },
          args: '',
          installedRegex: 'v(.*)',
          url: '',
          latestRegex: '',
        }).getInstalledVersion()
      ).rejects.toThrow(`Directory specified "${directory}" does not exist. Please specify a valid path.`)
    })
    it('throws error if dynamic file match not found', async () => {
      const directory = path.join(__dirname, '../helpers/test-commands')
      const regex = 'fake'
      await expect(
        new Software({
          name: 'dynamo',
          executable: {
            directory,
            regex,
          },
          args: '',
          installedRegex: 'v(.*)',
          url: '',
          latestRegex: '',
        }).getInstalledVersion()
      ).rejects.toThrow(`Could not find any file in directory "${directory}" matching regex pattern "${regex}"`)
    })
    it('throws error if static version match not found', async () => {
      await expect(
        new Software({
          name: 'static electricity',
          executable: {
            command: 'node',
          },
          args: `${path.join(__dirname, '../helpers/test-commands/good-command.js')} version 1.2.3`,
          installedRegex: 'spanish inquisition(.*)',
          url: '',
          latestRegex: '',
        }).getInstalledVersion()
      ).rejects.toThrow(`Could not find match for regex "/spanish inquisition(.*)/" in text "version 1.2.3"`)
    })
    it('returns only match static', async () => {
      await expect(
        new Software({
          name: 'single as a pringle',
          executable: {
            command: 'node',
          },
          args: `${path.join(__dirname, '../helpers/test-commands/good-command.js')} version v1.2.3`,
          installedRegex: ' v(\\S+)$',
          url: '',
          latestRegex: '',
        }).getInstalledVersion()
      ).resolves.toBe('1.2.3')
    })
    it('returns first match static', async () => {
      await expect(
        new Software({
          name: 'if you are not first you are last',
          executable: {
            command: 'node',
          },
          args: `${path.join(__dirname, '../helpers/test-commands/good-command.js')} server version v4.5.6${
            TestUtil.NEWLINE_CHARS
          }client vesion v1.2.3`,
          installedRegex: 'version v(.*)',
          url: '',
          latestRegex: '',
        }).getInstalledVersion()
      ).resolves.toBe('4.5.6')
    })
  })
  describe('getFromUrl', () => {
    beforeAll(async () => {
      await Website.start()
    })
    afterAll(async () => {
      await Website.stop()
    })
    it('retuns text specified', async () => {
      const response = 'hello world'
      await expect(getFromUrl(Website.getResponseUrl(response))).resolves.toBe(response)
    })
  })
  describe('getLatestVersion', () => {
    beforeAll(async () => {
      await Website.start()
    })
    afterAll(async () => {
      await Website.stop()
    })
    it('throws error if error from website', async () => {
      await expect(
        new Software({
          name: '500',
          executable: {
            command: '',
          },
          args: '',
          installedRegex: '',
          url: Website.getErrorUrl(''),
          latestRegex: 'The current stable release of GIMP is <b>(.*)</b>',
        }).getLatestVersion()
      ).rejects.toThrow(
        'Could not find match for regex "/The current stable release of GIMP is <b>(.*)<\\/b>/" in text ""'
      )
    })
    it('throws error if no match from website', async () => {
      await expect(
        new Software({
          name: 'go fish',
          executable: {
            command: '',
          },
          args: '',
          installedRegex: '',
          url: Website.getResponseUrl('Hello World!\nThe current stable release of GIMP is <b>1.2.3</b>\nThe End!'),
          latestRegex: 'version (.*)',
        }).getLatestVersion()
      ).rejects.toThrow(
        'Could not find match for regex "/version (.*)/" in text "Hello World!\nThe current stable release of GIMP is <b>1.2.3</b>\nThe End!"'
      )
    })
    it('returns correct single match', async () => {
      const version = '1.2.3'
      await expect(
        new Software({
          name: 'uno',
          executable: {
            command: '',
          },
          args: '',
          installedRegex: '',
          url: Website.getResponseUrl(`Hello World!\nMy latest version is <b>${version}</b>\nThe End!`),
          latestRegex: 'My latest version is <b>(.*)</b>',
        }).getLatestVersion()
      ).resolves.toBe(version)
    })
    it('returns first match out of many', async () => {
      const version = '2.3.4'
      await expect(
        new Software({
          name: 'pass go',
          executable: {
            command: '',
          },
          args: '',
          installedRegex: '',
          url: Website.getResponseUrl(`Hello!\nLatest Version 2.3.4\nLatest Dev Version 2.3.5`),
          latestRegex: 'Version (\\d+\\.\\d+(\\.\\d+)?)',
        }).getLatestVersion()
      ).resolves.toBe(version)
    })
  })
})
