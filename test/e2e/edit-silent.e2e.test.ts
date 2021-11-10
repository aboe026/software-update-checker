import { CommandType } from '../../src/software/executable'
import E2eAddUtil from './helpers/e2e-add-util'
import E2eEditUtil from './helpers/e2e-edit-util'
import E2eTestUtil from './helpers/e2e-test-util'
import Software from '../../src/software/software'
import Website from '../helpers/website'

describe('Edit Silent', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  describe('invalid', () => {
    it('edit silent with non-existent softwares file says no softwares to edit', async () => {
      await E2eEditUtil.verifySoftwaresFileDoesNotExist()
      const existingName = 'Chinook'
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName,
          newSoftware: {
            name: 'Sockeye',
            directory: 'fish',
            type: CommandType.Static,
            command: 'salmon',
            args: 'anadromous',
            shell: 'animals',
            installedRegex: 'red',
            url: 'https://swimupstream.com',
            latestRegex: 'oncorhynchus nerka',
          },
        }),
        error: E2eEditUtil.MESSAGES.NoSoftwaresToEdit,
      })
      await E2eEditUtil.verifySoftwares([])
    })
    it('edit silent with no content softwares file says no softwares to edit', async () => {
      await E2eEditUtil.setSoftwares(undefined)
      await E2eEditUtil.verifySoftwares(undefined)
      const existingName = 'Douglas Fir'
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName,
          newSoftware: {
            name: 'Big Tree',
            directory: 'california',
            type: CommandType.Static,
            command: 'trees',
            args: 'conifers',
            shell: 'plants',
            installedRegex: 'redwood',
            url: 'https://longnecks.com',
            latestRegex: 'sequoia',
          },
        }),
        error: E2eEditUtil.MESSAGES.NoSoftwaresToEdit,
      })
      await E2eEditUtil.verifySoftwares([])
    })
    it('edit silent with empty array softwares file says no softwares to edit', async () => {
      await E2eEditUtil.setSoftwares([])
      await E2eEditUtil.verifySoftwares([])
      const existingName = 'VGA'
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName,
          newSoftware: {
            name: 'HDMI',
            directory: 'proprietary',
            type: CommandType.Static,
            command: 'interface',
            args: 'av',
            shell: 'digital',
            installedRegex: 'hdmi',
            url: 'https://sweetsweethidef.com',
            latestRegex: 'high definition multimedia interface',
          },
        }),
        error: E2eEditUtil.MESSAGES.NoSoftwaresToEdit,
      })
      await E2eEditUtil.verifySoftwares([])
    })
    it('edit silent with single software file referring to non existent one says it does not exist', async () => {
      const name = 'e2e edit silent does not exist'
      const software = new Software({
        name,
        directory: 'doubly-reflective',
        executable: {
          command: 'navigation',
        },
        args: 'celestial',
        shell: 'instrument',
        installedRegex: 'doubly reflecting',
        url: 'https://bringmethathorizon.com',
        latestRegex: 'sextant',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      const existingName = `${name} non existent`
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName,
          newSoftware: {
            name: `${name} edited`,
            directory: 'navigation',
            type: CommandType.Static,
            command: 'detection',
            args: 'sound',
            shell: 'technique',
            installedRegex: 'propagation',
            url: 'https://batsub.com',
            latestRegex: 'sonar',
          },
        }),
        error: E2eEditUtil.getNonExistingSoftwareMessage(existingName),
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent prevents using an existing name', async () => {
      const firstSoftware = new Software({
        name: 'e2e edit silent to name that already exists first',
        directory: 'general',
        executable: {
          command: 'presidents',
        },
        args: 'usa',
        shell: 'people',
        installedRegex: 'first',
        url: 'https://fatherofthenation.com',
        latestRegex: 'george washington',
      })
      const secondSoftware = new Software({
        name: 'e2e edit silent to name that already exists second',
        directory: 'western',
        executable: {
          command: 'emperor',
        },
        args: 'rome',
        shell: 'person',
        installedRegex: 'last',
        url: 'https://littledisgrace.com',
        latestRegex: 'romulus augustus',
      })
      await E2eEditUtil.setSoftwares([firstSoftware, secondSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, secondSoftware])
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: firstSoftware.name,
          newSoftware: {
            name: secondSoftware.name,
          },
        }),
        error: E2eEditUtil.getNameInUseMessage(secondSoftware.name),
      })
      await E2eEditUtil.setSoftwares([firstSoftware, secondSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, secondSoftware])
    })
    it('edit silent to installed error does not persist', async () => {
      const installedError = 'syntax error'
      const software = new Software({
        name: 'e2e edit silent installed error',
        directory: 'american',
        executable: {
          command: 'actors',
        },
        args: 'movie',
        shell: 'male',
        installedRegex: 'the chip',
        url: 'https://sixdegrees.org',
        latestRegex: 'kevin norwood bacon',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            directory: '',
            command: 'node',
            args: `${E2eEditUtil.COMMAND.Bad} ${installedError}`,
            shell: '',
            installedRegex: 'v(.*)',
          },
        }),
        error: E2eAddUtil.getInstalledErrorMessage(installedError),
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent to latest error does not persist', async () => {
      try {
        const installedVersion = '1.1.0'
        const software = new Software({
          name: 'e2e edit silent latest error',
          directory: 'thirst mutilator',
          executable: {
            command: 'dissolves',
          },
          args: 'yield anions',
          shell: 'substances',
          installedRegex: 'electrolytes',
          url: 'https://itswhatplantscrave.com',
          latestRegex: 'brwando',
        })
        const url = Website.getErrorUrl('could not connect')
        const port = Website.getPort()
        await Website.stop()
        await E2eEditUtil.setSoftwares([software])
        await E2eEditUtil.verifySoftwares([software])
        await E2eTestUtil.silentError({
          args: E2eEditUtil.getSilentCommand({
            existingName: software.name,
            newSoftware: {
              name: `${software.name} edited`,
              directory: '',
              command: 'node',
              args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
              shell: '',
              installedRegex: 'v(.*)',
              url,
              latestRegex: 'latest: v(.*)',
            },
          }),
          error: E2eAddUtil.getLatestErrorMessage(
            `request to ${url} failed, reason: connect ECONNREFUSED 127.0.0.1:${port}`
          ),
        })
        await E2eEditUtil.verifySoftwares([software])
      } finally {
        await Website.start()
      }
    })
    it('edit silent errors without options', async () => {
      await E2eEditUtil.setSoftwares([])
      await E2eEditUtil.verifySoftwares([])
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: 'toast',
          newSoftware: {},
        }),
        error: E2eEditUtil.MESSAGES.NoOptionsProvided,
      })
      await E2eEditUtil.verifySoftwares([])
    })
    it('edit silent requires existing name positional argument', async () => {
      const software = new Software({
        name: 'e2e edit silent no existing name positional argument',
        directory: 'king',
        executable: {
          command: 'norse',
        },
        args: 'god',
        shell: 'mythology',
        installedRegex: 'woden',
        url: 'https://wednesday.com',
        latestRegex: 'odin',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: undefined,
          newSoftware: {
            name: `${software.name} edited`,
          },
        }),
        error: E2eEditUtil.getNotEnoughCommandsMessage(0, 1),
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent regex flag does not work with static type', async () => {
      const software = new Software({
        name: 'e2e edit silent regex flag does not work with static type',
        directory: 'polish',
        executable: {
          command: 'scientist',
        },
        args: 'nobel-laureate',
        shell: 'female',
        installedRegex: 'physics|chemistry',
        url: 'https://motherofmodernphysics.com',
        latestRegex: 'marie curie',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            type: CommandType.Static,
            regex: 'radioactivity',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleRegexWithStaticType,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent command flag does not work with dynamic type', async () => {
      const software = new Software({
        name: 'e2e edit silent command flag does not work with dynamic type',
        directory: 'pods',
        executable: {
          command: 'seed',
        },
        args: 'theobroma',
        shell: 'bean',
        installedRegex: 'cocoa',
        url: 'https://darkormilk.com',
        latestRegex: 'chocolate',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            type: CommandType.Dynamic,
            command: 'liquor',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleCommandWithDynamicType,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent command flag not compatible with regex flag', async () => {
      const software = new Software({
        name: 'e2e edit silent command flag not compatible with regex flag',
        directory: 'cascades',
        executable: {
          command: 'volcano',
        },
        args: 'cascades',
        shell: 'geology',
        installedRegex: 'tahoma',
        url: 'https://thelonelymountain.com',
        latestRegex: 'mount rainier',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            command: '',
            regex: '',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleCommandWithRegex,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent command flag not compatible with dynamic executable', async () => {
      const software = new Software({
        name: 'e2e edit silent command flag not compatible with dynamic executable',
        directory: 'leavened',
        executable: {
          regex: 'flat',
        },
        args: 'mediterranean',
        shell: 'bread',
        installedRegex: 'focaccia',
        url: 'https://protopizza.com',
        latestRegex: 'panis focacius',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            command: 'rise',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleCommandWithDynamicExecutable,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent regex flag not compatible with static executable', async () => {
      const software = new Software({
        name: 'e2e edit silent regex flag not compatible with static executable',
        directory: 'backwards',
        executable: {
          command: 'avian',
        },
        args: 'sweet-beak',
        shell: 'animal',
        installedRegex: 'ruby throated hummingbird',
        url: 'https://backwardsandupsidedown.com',
        latestRegex: 'crchilochus colubris',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            regex: 'hum',
          },
        }),
        error: E2eEditUtil.MESSAGES.IncompatibleRegexWithStaticExecutable,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent change type to dynamic errors without regex option', async () => {
      const software = new Software({
        name: 'e2e edit silent change type to dynamic without regex',
        directory: 'english',
        executable: {
          command: 'mathematician',
        },
        args: 'ww2',
        shell: 'english',
        installedRegex: 'computer\\ scientist|logician|cryptanalyst|philosopher|theoretical\\ biologist',
        url: 'https://fatherofcomputers.com',
        latestRegex: 'alan mathison turing',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            type: CommandType.Dynamic,
            directory: 'ai',
          },
        }),
        error: E2eEditUtil.MESSAGES.NoRegexForDynamic,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit silent change type to static errors without command option', async () => {
      const software = new Software({
        name: 'e2e edit silent change type to static without command',
        directory: 'horror',
        executable: {
          regex: 'overlook',
        },
        args: 'room',
        shell: 'hotel',
        installedRegex: 'redrum',
        url: 'https://theshine.com',
        latestRegex: '237',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eTestUtil.silentError({
        args: E2eEditUtil.getSilentCommand({
          existingName: software.name,
          newSoftware: {
            name: `${software.name} edited`,
            type: CommandType.Static,
          },
        }),
        error: E2eEditUtil.MESSAGES.NoCommandForStatic,
      })
      await E2eEditUtil.verifySoftwares([software])
    })
  })
  describe('valid', () => {
    it('edit silent all fields single software', async () => {
      const oldSoftware = new Software({
        name: 'e2e edit silent all fields single old',
        directory: 'cass county',
        executable: {
          command: 'cities',
        },
        args: 'north dakota',
        shell: 'geography',
        installedRegex: 'populous',
        url: 'https://youbetcha.com',
        latestRegex: 'fargo',
      })
      await E2eEditUtil.setSoftwares([oldSoftware])
      await E2eEditUtil.verifySoftwares([oldSoftware])
      const installedVersion = '3.1.0'
      const latestVersion = '3.1.1'
      const editedSoftware = new Software({
        name: 'e2e edit silent all fields single edited',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
        shell: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.editSilent({
        existingName: oldSoftware.name,
        newSoftware: editedSoftware,
        newInstalledVersion: installedVersion,
        newLatestVersion: latestVersion,
      })
      await E2eEditUtil.verifySoftwares([editedSoftware])
    })
    it('edit silent all fields first of two softwares', async () => {
      const firstSoftware = new Software({
        name: 'e2e edit silent all fields first of two first',
        directory: 'spiral',
        executable: {
          command: 'galaxy',
        },
        args: 'nearest',
        shell: 'astrology',
        installedRegex: 'andromeda',
        url: 'https://sonearyetsofar.com',
        latestRegex: 'Messier 31',
      })
      const lastSoftware = new Software({
        name: 'e2e edit silent all fields first of two last',
        directory: 'aeronautical engineer',
        executable: {
          command: 'apollo',
        },
        args: '11',
        shell: 'astronaut',
        installedRegex: 'commander',
        url: 'https://onesmallstep.com',
        latestRegex: 'neil armstrong',
      })
      await E2eEditUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, lastSoftware])
      const installedVersion = '1.2.0'
      const latestVersion = '2.2.0'
      const editedSoftware = new Software({
        name: `${firstSoftware.name} edited`,
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
        shell: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.editSilent({
        existingName: firstSoftware.name,
        newSoftware: editedSoftware,
        newInstalledVersion: installedVersion,
        newLatestVersion: latestVersion,
      })
      await E2eEditUtil.verifySoftwares([editedSoftware, lastSoftware])
    })
    it('edit silent all fields last of two softwares', async () => {
      const firstSoftware = new Software({
        name: 'e2e edit silent all fields last of two first',
        directory: 'automated',
        executable: {
          command: 'equipment',
        },
        args: 'farming',
        shell: 'machine',
        installedRegex: 'thresher',
        url: 'https://westernminnesotasteamthreshersreunion.com',
        latestRegex: 'garr-scott',
      })
      const lastSoftware = new Software({
        name: 'e2e edit silent all fields last of two last',
        directory: 'british',
        executable: {
          command: 'owner',
        },
        args: 'factory',
        shell: 'character',
        installedRegex: 'candies',
        url: 'https://snozberries.com',
        latestRegex: 'willy wonka',
      })
      await E2eEditUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, lastSoftware])
      const installedVersion = '1.1.1'
      const latestVersion = '1.2.1'
      const editedSoftware = new Software({
        name: `${lastSoftware.name} edited`,
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
        shell: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.editSilent({
        existingName: lastSoftware.name,
        newSoftware: editedSoftware,
        newInstalledVersion: installedVersion,
        newLatestVersion: latestVersion,
      })
      await E2eEditUtil.verifySoftwares([firstSoftware, editedSoftware])
    })
    it('edit silent directory flag works with static type', async () => {
      const oldSoftware = new Software({
        name: 'e2e edit silent directory flag works with static type',
        directory: 'microsoft',
        executable: {
          command: 'gaming',
        },
        args: 'console',
        shell: 'platform',
        installedRegex: 'directx',
        url: 'https://staggersticks4life.com',
        latestRegex: 'xbox',
      })
      await E2eEditUtil.setSoftwares([oldSoftware])
      await E2eEditUtil.verifySoftwares([oldSoftware])
      const installedVersion = '3.1.0'
      const latestVersion = '3.1.1'
      const editedSoftware = new Software({
        name: `${oldSoftware.name} edited`,
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
        shell: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.editSilent({
        existingName: oldSoftware.name,
        newSoftware: editedSoftware,
        newInstalledVersion: installedVersion,
        newLatestVersion: latestVersion,
      })
      await E2eEditUtil.verifySoftwares([editedSoftware])
    })
  })
})
