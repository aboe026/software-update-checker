import fs from 'fs-extra'
import path from 'path'

import E2eAddUtil from './helpers/e2e-add-util'
import E2eConfig from './helpers/e2e-config'
import E2eTestUtil from './helpers/e2e-test-util'
import { getExecutableName } from './helpers/interactive-execute'
import Software from '../../src/software/software'
import { version } from '../../package.json'
import Website from '../helpers/website'

describe('Add Silent', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  describe('invalid', () => {
    it('add silent fails with existing name', async () => {
      const existing = new Software({
        name: 'e2e add silent name that already exists existing',
        directory: 'chain',
        executable: {
          command: 'cycle',
        },
        args: 'bi',
        shell: 'vehicle',
        installedRegex: 'hybrid',
        url: 'https://lookmanohands.com',
        latestRegex: 'general-purpose',
      })
      await E2eAddUtil.setSoftwares([existing])
      await E2eAddUtil.verifySoftwares([existing])
      await E2eTestUtil.silentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: existing.name,
            executable: {
              command: 'suv',
            },
            args: 'electric',
            shell: 'auto',
            installedRegex: 'model y',
            url: 'https://plugmein.com',
            latestRegex: 'tesla',
          }),
        }),
        error: E2eAddUtil.getNameInUseMessage(existing.name),
      })
      await E2eAddUtil.setSoftwares([existing])
      await E2eAddUtil.verifySoftwares([existing])
    })
    it('add silent fails if installed error', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      const installedError = 'mercy file not found'
      await E2eTestUtil.silentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent installed error',
            directory: '',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Bad} ${installedError}`,
            shell: '',
            installedRegex: 'v(.*)',
            url: 'https://donbot.com',
            latestRegex: 'latest: v(.*)',
          }),
        }),
        error: E2eAddUtil.getInstalledErrorMessage(installedError),
      })
      await E2eAddUtil.verifySoftwares([])
    })
    it('add silent fails if latest error', async () => {
      try {
        await E2eAddUtil.setSoftwares([])
        await E2eAddUtil.verifySoftwares([])
        const installedVersion = '5.25.830'
        const url = Website.getErrorUrl('how the turn tables')
        const port = Website.getPort()
        await Website.stop()
        await E2eTestUtil.silentError({
          args: E2eAddUtil.getSilentCommand({
            software: new Software({
              name: 'e2e add silent latest error',
              directory: '',
              executable: {
                command: 'node',
              },
              args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
              shell: '',
              installedRegex: 'v(.*)',
              url,
              latestRegex: 'v(.*)',
            }),
          }),
          error: E2eAddUtil.getLatestErrorMessage(
            `request to ${url} failed, reason: connect ECONNREFUSED 127.0.0.1:${port}`
          ),
        })
        await E2eAddUtil.verifySoftwares([])
      } finally {
        Website.start()
      }
    })
    it('add silent fails type subcommand', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      await E2eTestUtil.silentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent invalid without type subcommand',
            directory: '',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Good} v1.4.3`,
            shell: '',
            installedRegex: 'v(.*)',
            url: Website.getResponseUrl(`latest: v1.4.3`),
            latestRegex: 'latest: v(.*)',
          }),
        }).filter((arg) => arg !== 'static'),
        error: E2eAddUtil.getNotEnoughCommandsMessage(0, 1),
      })
      await E2eAddUtil.verifySoftwares([])
    })
    it('add silent fails without name flag', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      await E2eTestUtil.silentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent invalid without name flag',
            directory: '',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Good} v1.7.1`,
            shell: '',
            installedRegex: 'v(.*)',
            url: Website.getResponseUrl(`latest: v1.7.2`),
            latestRegex: 'latest: v(.*)',
          }),
        }).filter((arg) => !arg.includes('--name')),
        error: 'Missing required argument: name',
      })
      await E2eAddUtil.verifySoftwares([])
    })
    it('add silent fails without installedRegex flag', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      await E2eTestUtil.silentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent invalid without installedRegex flag',
            directory: '',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Good} v1.8.2`,
            shell: '',
            installedRegex: 'v(.*)',
            url: Website.getResponseUrl(`latest: v1.8.3`),
            latestRegex: 'latest: v(.*)',
          }),
        }).filter((arg) => !arg.includes('--installedRegex')),
        error: 'Missing required argument: installedRegex',
      })
      await E2eAddUtil.verifySoftwares([])
    })
    it('add silent fails without url flag', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      await E2eTestUtil.silentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent invalid without url flag',
            directory: '',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Good} v1.9.4`,
            shell: '',
            installedRegex: 'v(.*)',
            url: Website.getResponseUrl(`latest: v1.9.5`),
            latestRegex: 'latest: v(.*)',
          }),
        }).filter((arg) => !arg.includes('--url')),
        error: 'Missing required argument: url',
      })
      await E2eAddUtil.verifySoftwares([])
    })
    it('add silent fails without latestRegex flag', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      await E2eTestUtil.silentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent invalid without latestRegex flag',
            directory: '',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Good} v1.9.6`,
            shell: '',
            installedRegex: 'v(.*)',
            url: Website.getResponseUrl(`latest: v1.9.7`),
            latestRegex: 'latest: v(.*)',
          }),
        }).filter((arg) => !arg.includes('--latestRegex')),
        error: 'Missing required argument: latestRegex',
      })
      await E2eAddUtil.verifySoftwares([])
    })
  })
  describe('valid', () => {
    it('add silent valid software with non-existent softwares file', async () => {
      await E2eAddUtil.verifySoftwaresFileDoesNotExist()
      const installedVersion = '2.0.0'
      const latestVersion = '2.0.1'
      const software = new Software({
        name: 'e2e add silent valid with non-existent',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shell: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addSilent({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add silent valid software with no content softwares file', async () => {
      await E2eAddUtil.setSoftwares(undefined)
      await E2eAddUtil.verifySoftwares(undefined)
      const installedVersion = '1.0.7'
      const latestVersion = '1.0.8'
      const software = new Software({
        name: 'e2e add silent valid with empty file',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shell: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addSilent({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add silent valid software with empty array softwares file', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      const installedVersion = '1.0.9'
      const latestVersion = '1.0.10'
      const software = new Software({
        name: 'e2e add silent valid with empty array',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shell: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addSilent({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add silent valid software to beginning with single existing softwares file', async () => {
      const existing = new Software({
        name: 'z end of z line',
        directory: 'unkown',
        executable: {
          command: 'functions',
        },
        args: 'irreversible',
        shell: 'biological',
        installedRegex: 'death',
        url: 'https://forwhomethebelltolls.com',
        latestRegex: 'thee',
      })
      await E2eAddUtil.setSoftwares([existing])
      await E2eAddUtil.verifySoftwares([existing])
      const installedVersion = '1.2.1'
      const latestVersion = '1.2.2'
      const software = new Software({
        name: 'e2e add silent valid to beginning with single existing',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shell: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addSilent({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software, existing])
    })
    it('add silent valid software to end with single existing softwares file', async () => {
      const existing = new Software({
        name: 'an initial software',
        directory: 'routines',
        executable: {
          command: 'sequence',
        },
        args: 'pre-boot',
        shell: 'electronics',
        installedRegex: 'post',
        url: 'https://poweronselftest.com',
        latestRegex: 'beep',
      })
      await E2eAddUtil.setSoftwares([existing])
      await E2eAddUtil.verifySoftwares([existing])
      const installedVersion = '0.2.0'
      const latestVersion = '2.0.0'
      const software = new Software({
        name: 'e2e add silent valid to end with single existing',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shell: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addSilent({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([existing, software])
    })
    it('add silent valid software to middle with two existing softwares file', async () => {
      const existingFirst = new Software({
        name: 'an initial of two softwares',
        directory: 'train',
        executable: {
          command: 'rail',
        },
        args: 'power',
        shell: 'transportation',
        installedRegex: 'engine',
        url: 'https://thomasthetankengine.com',
        latestRegex: 'locomotive',
      })
      const existingSecond = new Software({
        name: 'z end of two softwares',
        directory: 'shelter',
        executable: {
          command: 'freight',
        },
        args: 'cars',
        shell: 'train',
        installedRegex: 'caboose',
        url: 'https://waitforit.com',
        latestRegex: 'cupola',
      })
      await E2eAddUtil.setSoftwares([existingFirst, existingSecond])
      await E2eAddUtil.verifySoftwares([existingFirst, existingSecond])
      const installedVersion = '2.5.0'
      const latestVersion = '2.5.1'
      const software = new Software({
        name: 'e2e add silent valid to middle with two existing',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shell: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addSilent({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([existingFirst, software, existingSecond])
    })
    it('add silent valid if specifying directory', async () => {
      await E2eAddUtil.verifySoftwaresFileDoesNotExist()
      const installedVersion = '4.5.0'
      const latestVersion = '4.5.6'
      const software = new Software({
        name: 'e2e add silent valid specifying directory',
        directory: path.dirname(E2eAddUtil.COMMAND.Good),
        executable: {
          command: 'node',
        },
        args: `${path.basename(E2eAddUtil.COMMAND.Good)} v${installedVersion}`,
        shell: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addSilent({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add silent valid if absolute path to command without directory', async () => {
      await E2eAddUtil.verifySoftwaresFileDoesNotExist()
      const installedVersion = '6.3.0'
      const latestVersion = '6.3.2'
      const software = new Software({
        name: 'e2e add silent valid absolute command no directory',
        directory: '',
        executable: {
          command: E2eAddUtil.COMMAND.Powershell,
        },
        args: `v${installedVersion}`,
        shell: 'pwsh',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addSilent({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add silent valid if absolute path to command ignores directory', async () => {
      await E2eAddUtil.verifySoftwaresFileDoesNotExist()
      const installedVersion = '8.0.5'
      const latestVersion = '8.1.1'
      const software = new Software({
        name: 'e2e add silent valid absolute command ignores directory',
        directory: E2eConfig.DIRECTORY.Temp,
        executable: {
          command: E2eAddUtil.COMMAND.Powershell,
        },
        args: `v${installedVersion}`,
        shell: 'pwsh',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.addSilent({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add silent valid if using defaults', async () => {
      await E2eAddUtil.verifySoftwaresFileDoesNotExist()
      const installedVersion = version
      const latestVersion = '1.2.1.0'
      const software = new Software({
        name: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.NameExample),
        directory: E2eAddUtil.getExampleFromMessage(E2eAddUtil.getDirectoryExampleMessage({})),
        executable: {
          command: E2eAddUtil.getExampleFromMessage(E2eAddUtil.getCommandExampleMessage({})),
        },
        args: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ArgumentsExample),
        shell: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ShellExample),
        installedRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.InstalledRegexExample),
        url: Website.getFileUrl('latest-release.html'),
        latestRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.LatestRegexExample),
      })
      await E2eTestUtil.addSilent({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add silent valid if renamed executable using defaults', async () => {
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
        const latestVersion = '1.2.1.0'
        const software = new Software({
          name: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.NameExample),
          directory: renamedExecutableDir,
          executable: {
            command: `./${renamedExecutableFile}`,
          },
          args: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ArgumentsExample),
          shell: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ShellExample),
          installedRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.InstalledRegexExample),
          url: Website.getFileUrl('latest-release.html'),
          latestRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.LatestRegexExample),
        })
        await E2eTestUtil.addSilent({
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
    it('add silent valid if spaces in directory using defaults', async () => {
      const dirWithSpaces = path.join(E2eConfig.DIRECTORY.Temp, 'path with spaces')
      try {
        await fs.ensureDir(dirWithSpaces)
        await fs.copyFile(
          path.join(E2eConfig.DIRECTORY.Executables, getExecutableName()),
          path.join(dirWithSpaces, getExecutableName())
        )
        await E2eAddUtil.verifySoftwaresFileDoesNotExist()
        const installedVersion = version
        const latestVersion = '1.2.1.0'
        const software = new Software({
          name: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.NameExample),
          directory: dirWithSpaces,
          executable: {
            command: E2eAddUtil.getExampleFromMessage(E2eAddUtil.getCommandExampleMessage({})),
          },
          args: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ArgumentsExample),
          shell: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.ShellExample),
          installedRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.InstalledRegexExample),
          url: Website.getFileUrl('latest-release.html'),
          latestRegex: E2eAddUtil.getExampleFromMessage(E2eAddUtil.MESSAGES.LatestRegexExample),
        })
        await E2eTestUtil.addSilent({
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
    /**
     * TODO: test optional args (no args, with shell?)
     */
  })
})
