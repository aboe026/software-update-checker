import fs from 'fs-extra'
import path from 'path'

import E2eAddUtil from './helpers/e2e-add-util'
import E2eConfig from './helpers/e2e-config'
import E2eTestUtil from './helpers/e2e-test-util'
import { getExecutableName, KEYS } from './helpers/interactive-execute'
import Software from '../../src/software/software'
import { version } from '../../package.json'
import Website from '../helpers/website'

describe('Add Interactive', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  describe('invalid', () => {
    it('add interactive fails with existing name', async () => {
      const existing = new Software({
        name: 'e2e add interactive name that already exists existing',
        shell: 'halo',
        directory: 'Generation II',
        executable: {
          command: 'UNSC',
        },
        args: 'spartan',
        installedRegex: '117',
        url: 'https://ineedaweapon.com',
        latestRegex: 'master chief',
      })
      await E2eAddUtil.setSoftwares([existing])
      await E2eAddUtil.verifySoftwares([existing])
      await E2eTestUtil.addInteractiveDuplicate({
        name: existing.name,
      })
      await E2eAddUtil.setSoftwares([existing])
      await E2eAddUtil.verifySoftwares([existing])
    })
    it('add interactive fails if installed error and choose not to reconfigure', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      const installedError = 'does not compute'
      await E2eTestUtil.addInteractiveReconfigure({
        installed: [
          {
            name: 'e2e add interactive installed error no reconfigure',
            shell: '',
            directory: '',
            command: 'node',
            args: `${E2eAddUtil.COMMAND.Bad} ${installedError}`,
            regex: 'v(.*)',
            error: installedError,
            confirmOrReconfigure: false,
          },
        ],
      })
      await E2eAddUtil.verifySoftwares([])
    })
    it('add interactive fails if latest error and choose not to reconfigure', async () => {
      try {
        await E2eAddUtil.setSoftwares([])
        await E2eAddUtil.verifySoftwares([])
        const installedVersion = '1.0.1'
        const url = Website.getErrorUrl('could not connect')
        const port = Website.getPort()
        await Website.stop()
        await E2eTestUtil.addInteractiveReconfigure({
          installed: [
            {
              name: 'e2e add interactive latest error no reconfigure',
              shell: '',
              directory: '',
              command: 'node',
              args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
              regex: 'v(.*)',
              version: installedVersion,
              confirmOrReconfigure: true,
            },
          ],
          latest: [
            {
              url,
              regex: 'latest: v(.*)',
              error: `request to ${url} failed, reason: connect ECONNREFUSED ::1:${port}`,
              confirmOrReconfigure: false,
            },
          ],
        })
        await E2eAddUtil.verifySoftwares([])
      } finally {
        await Website.start()
      }
    })
  })
  describe('valid', () => {
    it('add interactive valid software with non-existent softwares file', async () => {
      await E2eAddUtil.verifySoftwaresFileDoesNotExist()
      const installedVersion = '1.0.0'
      const latestVersion = '1.0.1'
      const software = new Software({
        name: 'e2e add interactive valid with non-existent',
        shell: '',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractive({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add interactive valid software with no content softwares file', async () => {
      await E2eAddUtil.setSoftwares(undefined)
      await E2eAddUtil.verifySoftwares(undefined)
      const installedVersion = '1.0.1'
      const latestVersion = '1.0.2'
      const software = new Software({
        name: 'e2e add interactive valid with empty file',
        shell: '',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractive({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add interactive valid software with empty array softwares file', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      const installedVersion = '1.0.2'
      const latestVersion = '1.0.3'
      const software = new Software({
        name: 'e2e add interactive valid with empty array',
        shell: '',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractive({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add interactive valid software to beginning with single existing softwares file', async () => {
      const existing = new Software({
        name: 'z very last von',
        shell: 'literature',
        directory: 'journey',
        executable: {
          command: 'endings',
        },
        args: 'heroes',
        installedRegex: 'return',
        url: 'https://endoftheroad.com',
        latestRegex: 'denouement',
      })
      await E2eAddUtil.setSoftwares([existing])
      await E2eAddUtil.verifySoftwares([existing])
      const installedVersion = '1.1.1'
      const latestVersion = '1.1.2'
      const software = new Software({
        name: 'e2e add interactive valid to beginning with single existing',
        shell: '',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractive({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software, existing])
    })
    it('add interactive valid software to end with single existing softwares file', async () => {
      const existing = new Software({
        name: 'a first software',
        shell: 'metals',
        directory: 'transition',
        executable: {
          command: 'medals',
        },
        args: 'materials',
        installedRegex: 'gold',
        url: 'https://winner.com',
        latestRegex: 'aurum',
      })
      await E2eAddUtil.setSoftwares([existing])
      await E2eAddUtil.verifySoftwares([existing])
      const installedVersion = '0.1.0'
      const latestVersion = '1.0.0'
      const software = new Software({
        name: 'e2e add interactive valid to end with single existing',
        shell: '',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractive({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([existing, software])
    })
    it('add interactive valid software to middle with two existing softwares file', async () => {
      const existingFirst = new Software({
        name: 'a first of two softwares',
        shell: 'historical fiction',
        directory: 'pequod',
        executable: {
          command: 'sentences',
        },
        args: 'first',
        installedRegex: 'the\\ whale',
        url: 'https://callmeishmael.com',
        latestRegex: 'moby\\ dick',
      })
      const existingSecond = new Software({
        name: 'z last of two softwares',
        shell: 'science fiction',
        directory: 'its alive',
        executable: {
          command: 'lines',
        },
        args: 'last',
        installedRegex: 'the\\ modern\\ prometheus',
        url: 'https://lostindarknessanddistance.com',
        latestRegex: 'frankenstein',
      })
      await E2eAddUtil.setSoftwares([existingFirst, existingSecond])
      await E2eAddUtil.verifySoftwares([existingFirst, existingSecond])
      const installedVersion = '1.5.0'
      const latestVersion = '1.5.1'
      const software = new Software({
        name: 'e2e add interactive valid to middle with two existing',
        shell: '',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractive({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([existingFirst, software, existingSecond])
    })
    it('add interactive valid software if name error is reconfigured', async () => {
      const existingSoftware = new Software({
        name: 'e2e add interactive name error reconfigured existing',
        shell: 'video\\ game',
        directory: 'mare',
        executable: {
          command: 'equine',
        },
        args: 'bay',
        installedRegex: 'roach',
        url: 'https://smallfry.com',
        latestRegex: 'rutilus rutilus',
      })
      await E2eAddUtil.setSoftwares([existingSoftware])
      await E2eAddUtil.verifySoftwares([existingSoftware])
      const command = 'node'
      const installedVersion = '1.2.2'
      const latestVersion = '2.3.3'
      const software = new Software({
        name: 'e2e add interactive name error reconfigured',
        shell: '',
        directory: '',
        executable: {
          command,
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractiveReconfigure({
        installed: [
          {
            name: existingSoftware.name,
          },
          {
            name: software.name,
            shell: software.shell,
            directory: software.directory,
            command,
            args: software.args,
            regex: software.installedRegex,
            version: installedVersion,
            confirmOrReconfigure: true,
          },
        ],
        latest: [
          {
            url: software.url,
            regex: software.latestRegex,
            version: latestVersion,
            confirmOrReconfigure: true,
          },
        ],
      })
      await E2eAddUtil.verifySoftwares([software, existingSoftware])
    })
    it('add interactive valid software if directory error is reconfigured', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      const command = 'node'
      const installedVersion = '1.2.3'
      const latestVersion = '2.3.4'
      const software = new Software({
        name: 'e2e add interactive directory error reconfigured',
        shell: '',
        directory: '',
        executable: {
          command,
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractiveReconfigure({
        installed: [
          {
            name: software.name,
            shell: software.shell,
            directory: path.join(E2eConfig.DIRECTORY.Executables, 'bad bad leroy brown'),
          },
          {
            directory: KEYS.BACK_SPACE,
            command,
            args: software.args,
            regex: software.installedRegex,
            version: installedVersion,
            confirmOrReconfigure: true,
          },
        ],
        latest: [
          {
            url: software.url,
            regex: software.latestRegex,
            version: latestVersion,
            confirmOrReconfigure: true,
          },
        ],
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add interactive valid software if name and directory error is reconfigured', async () => {
      const existingSoftware = new Software({
        name: 'e2e add interactive name and directory error reconfigured existing',
        shell: 'fashion',
        directory: 'male',
        executable: {
          command: 'model',
        },
        args: 'balls',
        installedRegex: 'blue steel',
        url: 'https://reallyreallyridiculouslygoodlooking.com',
        latestRegex: 'derek zoolander',
      })
      await E2eAddUtil.setSoftwares([existingSoftware])
      await E2eAddUtil.verifySoftwares([existingSoftware])
      const command = 'node'
      const installedVersion = '1.6.2'
      const latestVersion = '2.7.3'
      const software = new Software({
        name: 'e2e add interactive name directory error reconfigured',
        shell: '',
        directory: '',
        executable: {
          command,
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractiveReconfigure({
        installed: [
          {
            name: existingSoftware.name,
          },
          {
            name: software.name,
            shell: software.shell,
            directory: path.join(E2eConfig.DIRECTORY.Executables, 'lights on but nobody home'),
          },
          {
            directory: KEYS.BACK_SPACE,
            command,
            args: software.args,
            regex: software.installedRegex,
            version: installedVersion,
            confirmOrReconfigure: true,
          },
        ],
        latest: [
          {
            url: software.url,
            regex: software.latestRegex,
            version: latestVersion,
            confirmOrReconfigure: true,
          },
        ],
      })
      await E2eAddUtil.verifySoftwares([existingSoftware, software])
    })
    it('add interactive valid software if installed error is reconfigured', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      const command = 'node'
      const installedError = 'does not compute'
      const installedVersion = '1.2.3'
      const latestVersion = '2.3.4'
      const software = new Software({
        name: 'e2e add interactive installed error reconfigured',
        shell: '',
        directory: '',
        executable: {
          command,
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractiveReconfigure({
        installed: [
          {
            name: software.name,
            shell: software.shell,
            directory: software.directory,
            command,
            args: `${E2eAddUtil.COMMAND.Bad} ${installedError}`,
            regex: software.installedRegex,
            error: installedError,
            confirmOrReconfigure: true,
          },
          {
            shell: software.shell,
            directory: software.directory,
            command,
            args: software.args,
            regex: software.installedRegex,
            version: installedVersion,
            confirmOrReconfigure: true,
          },
        ],
        latest: [
          {
            url: software.url,
            regex: software.latestRegex,
            version: latestVersion,
            confirmOrReconfigure: true,
          },
        ],
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add interactive valid software if latest error is reconfigured', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      const command = 'node'
      const installedVersion = '2.0.0'
      const latestError = 'webserver not available'
      const latestVersion = '4.0.0'
      const software = new Software({
        name: 'e2e add interactive latest error reconfigured',
        shell: '',
        directory: '',
        executable: {
          command,
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractiveReconfigure({
        installed: [
          {
            name: software.name,
            shell: software.shell,
            directory: software.directory,
            command,
            args: software.args,
            regex: software.installedRegex,
            version: installedVersion,
            confirmOrReconfigure: true,
          },
        ],
        latest: [
          {
            url: Website.getErrorUrl(latestError),
            regex: software.latestRegex,
            error: `Could not find match for regex "/${software.latestRegex}/" in text "${latestError}"`,
            confirmOrReconfigure: true,
          },
          {
            url: software.url,
            regex: software.latestRegex,
            version: latestVersion,
            confirmOrReconfigure: true,
          },
        ],
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add interactive valid if specifying directory', async () => {
      await E2eAddUtil.verifySoftwaresFileDoesNotExist()
      const installedVersion = '1.1.4'
      const latestVersion = '1.1.6'
      const software = new Software({
        name: 'e2e add interactive valid specifying directory',
        shell: '',
        directory: path.dirname(E2eAddUtil.COMMAND.Good),
        executable: {
          command: 'node',
        },
        args: `${path.basename(E2eAddUtil.COMMAND.Good)} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractive({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add interactive valid if absolute path to command without directory', async () => {
      await E2eAddUtil.verifySoftwaresFileDoesNotExist()
      const installedVersion = '4.1.4'
      const latestVersion = '4.1.7'
      const software = new Software({
        name: 'e2e add interactive valid absolute command no directory',
        shell: 'pwsh',
        directory: '',
        executable: {
          command: E2eAddUtil.COMMAND.Powershell,
        },
        args: `v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractive({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add interactive valid if absolute path to command ignores directory', async () => {
      await E2eAddUtil.verifySoftwaresFileDoesNotExist()
      const installedVersion = '8.0.4'
      const latestVersion = '8.1.0'
      const software = new Software({
        name: 'e2e add interactive valid absolute command ignores directory',
        shell: 'pwsh',
        directory: E2eConfig.DIRECTORY.Temp,
        executable: {
          command: E2eAddUtil.COMMAND.Powershell,
        },
        args: `v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addInteractive({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add interactive valid if using defaults', async () => {
      await E2eAddUtil.verifySoftwaresFileDoesNotExist()
      const installedVersion = version
      const latestVersion = '1.0.0'
      const software = new Software({
        name: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.NameExample),
        shell: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ShellExample),
        directory: E2eAddUtil.getExampleFromMessage(E2eAddUtil.getDirectoryExampleMessage({})),
        executable: {
          command: E2eAddUtil.getExampleFromMessage(E2eAddUtil.getCommandExampleMessage({})),
        },
        args: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ArgumentsExample),
        installedRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.InstalledRegexExample),
        url: Website.getFileUrl('latest-release.html'),
        latestRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.LatestRegexExample),
      })
      await E2eTestUtil.addInteractive({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add interactive valid if renamed executable using defaults', async () => {
      const renamedExecutableDir = path.join(E2eConfig.DIRECTORY.Temp, 'renamed-executable')
      const renamedExecutableFile = `renamed-${getExecutableName()}`
      try {
        await fs.ensureDir(renamedExecutableDir)
        await fs.copyFile(
          path.join(E2eConfig.DIRECTORY.Executables, getExecutableName()),
          path.join(renamedExecutableDir, renamedExecutableFile)
        )
        await E2eAddUtil.verifySoftwaresFileDoesNotExist()
        const installedVersion = version
        const latestVersion = '1.0.0'
        const software = new Software({
          name: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.NameExample),
          shell: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ShellExample),
          directory: renamedExecutableDir,
          executable: {
            command: `./${renamedExecutableFile}`,
          },
          args: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ArgumentsExample),
          installedRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.InstalledRegexExample),
          url: Website.getFileUrl('latest-release.html'),
          latestRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.LatestRegexExample),
        })
        await E2eTestUtil.addInteractive({
          software,
          installedVersion,
          latestVersion,
          executableDirectory: renamedExecutableDir,
          executableFile: renamedExecutableFile,
        })
        await E2eAddUtil.verifySoftwares([software])
      } finally {
        if (await fs.pathExists(renamedExecutableDir)) {
          await fs.remove(renamedExecutableDir)
        }
      }
    })
    it('add interactive valid if spaces in directory using defaults', async () => {
      const dirWithSpaces = path.join(E2eConfig.DIRECTORY.Temp, 'path with spaces')
      try {
        await fs.ensureDir(dirWithSpaces)
        await fs.copyFile(
          path.join(E2eConfig.DIRECTORY.Executables, getExecutableName()),
          path.join(dirWithSpaces, getExecutableName())
        )
        await E2eAddUtil.verifySoftwaresFileDoesNotExist()
        const installedVersion = version
        const latestVersion = '1.0.0'
        const software = new Software({
          name: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.NameExample),
          shell: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ShellExample),
          directory: dirWithSpaces,
          executable: {
            command: E2eAddUtil.getExampleFromMessage(E2eAddUtil.getCommandExampleMessage({})),
          },
          args: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ArgumentsExample),
          installedRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.InstalledRegexExample),
          url: Website.getFileUrl('latest-release.html'),
          latestRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.LatestRegexExample),
        })
        await E2eTestUtil.addInteractive({
          software,
          installedVersion,
          latestVersion,
          executableDirectory: dirWithSpaces,
        })
        await E2eAddUtil.verifySoftwares([software])
      } finally {
        if (await fs.pathExists(dirWithSpaces)) {
          await fs.remove(dirWithSpaces)
        }
      }
    })
  })
  /**
   * TODO: add tests around dynamic
   */
})
