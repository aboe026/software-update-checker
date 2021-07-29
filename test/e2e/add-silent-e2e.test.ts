import E2eAddUtil from './helpers/e2e-add-util'
import interactiveExecute from './helpers/interactive-execute'
import Software from '../../src/software'
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
        executable: {
          command: 'cycle',
        },
        args: 'bi',
        shellOverride: 'vehicle',
        installedRegex: 'hybrid',
        url: 'https://lookmanohands.com',
        latestRegex: 'general-purpose',
      })
      await E2eAddUtil.setSoftwares([existing])
      await E2eAddUtil.verifySoftwares([existing])
      await E2eAddUtil.testSilentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: existing.name,
            executable: {
              command: 'suv',
            },
            args: 'electric',
            shellOverride: 'auto',
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
      await E2eAddUtil.testSilentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent installed error',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Bad} ${installedError}`,
            shellOverride: '',
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
        await E2eAddUtil.testSilentError({
          args: E2eAddUtil.getSilentCommand({
            software: new Software({
              name: 'e2e add silent latest error',
              executable: {
                command: 'node',
              },
              args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
              shellOverride: '',
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
      await E2eAddUtil.testSilentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent invalid without type subcommand',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Good} v1.4.3`,
            shellOverride: '',
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
      await E2eAddUtil.testSilentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent invalid without name flag',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Good} v1.7.1`,
            shellOverride: '',
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
      await E2eAddUtil.testSilentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent invalid without installedRegex flag',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Good} v1.8.2`,
            shellOverride: '',
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
      await E2eAddUtil.testSilentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent invalid without url flag',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Good} v1.9.4`,
            shellOverride: '',
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
      await E2eAddUtil.testSilentError({
        args: E2eAddUtil.getSilentCommand({
          software: new Software({
            name: 'e2e add silent invalid without latestRegex flag',
            executable: {
              command: 'node',
            },
            args: `${E2eAddUtil.COMMAND.Good} v1.9.6`,
            shellOverride: '',
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
      await E2eAddUtil.verifySoftwares(undefined, false)
      const installedVersion = '2.0.0'
      const latestVersion = '2.0.1'
      const software = new Software({
        name: 'e2e add silent valid with non-existent',
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shellOverride: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await testDefaultAdd({
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
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shellOverride: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await testDefaultAdd({
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
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shellOverride: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await testDefaultAdd({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software])
    })
    it('add silent valid software to beginning with single existing softwares file', async () => {
      const existing = new Software({
        name: 'z end of z line',
        executable: {
          command: 'functions',
        },
        args: 'irreversible',
        shellOverride: 'biological',
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
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shellOverride: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await testDefaultAdd({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([software, existing])
    })
    it('add silent valid software to end with single existing softwares file', async () => {
      const existing = new Software({
        name: 'an initial software',
        executable: {
          command: 'sequence',
        },
        args: 'pre-boot',
        shellOverride: 'electronics',
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
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shellOverride: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await testDefaultAdd({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([existing, software])
    })
    it('add silent valid software to middle with two existing softwares file', async () => {
      const existingFirst = new Software({
        name: 'an initial of two softwares',
        executable: {
          command: 'rail',
        },
        args: 'power',
        shellOverride: 'transportation',
        installedRegex: 'engine',
        url: 'https://thomasthetankengine.com',
        latestRegex: 'locomotive',
      })
      const existingSecond = new Software({
        name: 'z end of two softwares',
        executable: {
          command: 'freight',
        },
        args: 'cars',
        shellOverride: 'train',
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
        executable: {
          command: 'node',
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shellOverride: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await testDefaultAdd({
        software,
        installedVersion,
        latestVersion,
      })
      await E2eAddUtil.verifySoftwares([existingFirst, software, existingSecond])
    })
    /**
     * TODO: test optional args (no args, with shelloverride?)
     */
  })
})

async function testDefaultAdd({
  software,
  installedVersion,
  latestVersion,
}: {
  software: Software
  installedVersion: string
  latestVersion: string
}) {
  const response = await interactiveExecute({
    args: E2eAddUtil.getSilentCommand({ software }),
  })
  await E2eAddUtil.validateChunks(response.chunks, [
    ...E2eAddUtil.getChunksSilent({
      installedVersion,
      latestVersion,
    }),
  ])
}
