import E2eEditUtil from './helpers/e2e-edit-util'
import E2eTestUtil from './helpers/e2e-test-util'
import { KEYS } from './helpers/interactive-execute'
import Software from '../../src/software/software'
import Website from '../helpers/website'

describe('Edit Interactive', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  describe('invalid', () => {
    it('edit interactive with non-existent softwares file says nothing to edit', async () => {
      await E2eEditUtil.verifySoftwaresFileDoesNotExist()
      await E2eTestUtil.editInteractiveNoSoftwares()
      await E2eEditUtil.verifySoftwares([])
    })
    it('edit interactive with no content softwares file says nothing to edit', async () => {
      await E2eEditUtil.setSoftwares(undefined)
      await E2eEditUtil.verifySoftwares(undefined)
      await E2eTestUtil.editInteractiveNoSoftwares()
      await E2eEditUtil.verifySoftwares([])
    })
    it('edit interactive with empty array softwares file says nothing to edit', async () => {
      await E2eEditUtil.setSoftwares([])
      await E2eEditUtil.verifySoftwares([])
      await E2eTestUtil.editInteractiveNoSoftwares()
      await E2eEditUtil.verifySoftwares([])
    })
    it('edit interactive prevents using an existing name', async () => {
      const firstSoftware = new Software({
        name: 'e2e edit interactive to name that already exists first',
        shell: 'food',
        directory: 'lamb',
        executable: {
          command: 'wrap',
        },
        args: 'greece',
        installedRegex: 'gyros',
        url: 'https://itsallgreektome.com',
        latestRegex: 'doner kebab',
      })
      const secondSoftware = new Software({
        name: 'e2e edit interactive to name that already exists second',
        shell: 'treat',
        directory: 'frozen',
        executable: {
          command: 'dessert',
        },
        args: 'italian',
        installedRegex: 'gelato',
        url: 'https://bestfoodonearth.com',
        latestRegex: 'artisanal gelato',
      })
      await E2eEditUtil.setSoftwares([firstSoftware, secondSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, secondSoftware])
      await E2eTestUtil.editInteractiveDuplicate({
        existingSoftwares: [firstSoftware, secondSoftware],
        positionToEdit: 0,
        name: secondSoftware.name,
      })
      await E2eEditUtil.setSoftwares([firstSoftware, secondSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, secondSoftware])
    })
    it('edit interactive to installed error without reconfigure does not persist', async () => {
      const installedError = 'permission denied'
      const software = new Software({
        name: 'e2e edit interactive installed error without reconfig',
        shell: 'department',
        directory: 'shipping',
        executable: {
          command: 'company',
        },
        args: 'mail',
        installedRegex: 'sears',
        url: 'https://catalogittome.com',
        latestRegex: 'Sears, Roebuck and Co.',
      })
      await E2eEditUtil.setSoftwares([software])
      await E2eEditUtil.verifySoftwares([software])
      await E2eTestUtil.editInteractiveReconfigure({
        existingSoftwares: [software],
        positionToEdit: 0,
        installed: [
          {
            name: `${software.name} edited`,
            shell: KEYS.BACK_SPACE,
            directory: KEYS.BACK_SPACE,
            command: 'node',
            args: `${E2eEditUtil.COMMAND.Bad} ${installedError}`,
            regex: 'v(.*)',
            error: installedError,
            confirmOrReconfigure: false,
          },
        ],
      })
      await E2eEditUtil.verifySoftwares([software])
    })
    it('edit interactive to latest error without reconfigure does not persist', async () => {
      try {
        const installedVersion = '1.1.0'
        const software = new Software({
          name: 'e2e edit interactive latest error without reconfig',
          shell: 'cosmology',
          directory: 'model',
          executable: {
            command: 'theory',
          },
          args: 'universe',
          installedRegex: 'singularity',
          url: 'https://expandonthis.com',
          latestRegex: 'the big bang',
        })
        const url = Website.getErrorUrl('could not connect')
        const port = Website.getPort()
        await Website.stop()
        await E2eEditUtil.setSoftwares([software])
        await E2eEditUtil.verifySoftwares([software])
        await E2eTestUtil.editInteractiveReconfigure({
          existingSoftwares: [software],
          positionToEdit: 0,
          installed: [
            {
              name: `${software.name} edited`,
              shell: KEYS.BACK_SPACE,
              directory: KEYS.BACK_SPACE,
              command: 'node',
              args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
              regex: 'v(.*)',
              version: installedVersion,
              confirmOrReconfigure: true,
            },
          ],
          latest: [
            {
              url,
              regex: 'latest: (.*)',
              error: `request to ${url} failed, reason: connect ECONNREFUSED 127.0.0.1:${port}`,
              confirmOrReconfigure: false,
            },
          ],
        })
        await E2eEditUtil.verifySoftwares([software])
      } finally {
        await Website.start()
      }
    })
  })
  describe('valid', () => {
    it('edit interactive all fields single software', async () => {
      const oldSoftware = new Software({
        name: 'e2e edit interactive all fields single old',
        shell: 'past',
        directory: 'age',
        executable: {
          command: 'periods',
        },
        args: 'technological',
        installedRegex: 'paleolithic',
        url: 'https://frombonetosatellite.com',
        latestRegex: 'information age',
      })
      await E2eEditUtil.setSoftwares([oldSoftware])
      await E2eEditUtil.verifySoftwares([oldSoftware])
      const installedVersion = '3.0.0'
      const latestVersion = '3.0.1'
      const editedSoftware = new Software({
        name: 'e2e edit interactive all fields single edited',
        shell: '',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.editInteractive({
        existingSoftwares: [oldSoftware],
        positionToEdit: 0,
        newSoftware: editedSoftware,
        newInstalledVersion: installedVersion,
        newLatestVersion: latestVersion,
      })
      await E2eEditUtil.verifySoftwares([editedSoftware])
    })
    it('edit interactive all fields first of two softwares', async () => {
      const firstSoftware = new Software({
        name: 'e2e edit interactive all fields first of two first',
        shell: 'grecian',
        directory: 'mythology',
        executable: {
          command: 'superfecundation',
        },
        args: 'homopaternal',
        installedRegex: 'gemini',
        url: 'https://castortroyandpolluxtroy.com',
        latestRegex: 'dioscuri',
      })
      const lastSoftware = new Software({
        name: 'e2e edit interactive all fields first of two last',
        shell: 'chinese',
        directory: 'opposites',
        executable: {
          command: 'philosophy',
        },
        args: 'concept',
        installedRegex: 'dualism',
        url: 'https://yinyang.com',
        latestRegex: 'cosmological qi',
      })
      await E2eEditUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, lastSoftware])
      const installedVersion = '1.1.0'
      const latestVersion = '2.1.0'
      const editedSoftware = new Software({
        name: `${firstSoftware.name} edited`,
        shell: '',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.editInteractive({
        existingSoftwares: [firstSoftware, lastSoftware],
        positionToEdit: 0,
        newSoftware: editedSoftware,
        newInstalledVersion: installedVersion,
        newLatestVersion: latestVersion,
      })
      await E2eEditUtil.verifySoftwares([editedSoftware, lastSoftware])
    })
    it('edit interactive all fields last of two softwares', async () => {
      const firstSoftware = new Software({
        name: 'e2e edit interactive all fields last of two first',
        shell: 'hbo',
        directory: 'jersey',
        executable: {
          command: 'boss',
        },
        args: 'mafia',
        installedRegex: 't',
        url: 'https://sadclown.com',
        latestRegex: 'anthony john soprano sr.',
      })
      const lastSoftware = new Software({
        name: 'e2e edit interactive all fields last of two last',
        shell: 'amc',
        directory: 'albuquerque',
        executable: {
          command: 'chemist',
        },
        args: 'drugs',
        installedRegex: 'heisenberg',
        url: 'https://iamtheonewhoknocks.com',
        latestRegex: 'walter hartwell white sr.',
      })
      await E2eEditUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eEditUtil.verifySoftwares([firstSoftware, lastSoftware])
      const installedVersion = '1.1.0'
      const latestVersion = '1.2.0'
      const editedSoftware = new Software({
        name: `${lastSoftware.name} edited`,
        shell: '',
        directory: '',
        executable: {
          command: 'node',
        },
        args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eTestUtil.editInteractive({
        existingSoftwares: [firstSoftware, lastSoftware],
        positionToEdit: 1,
        newSoftware: editedSoftware,
        newInstalledVersion: installedVersion,
        newLatestVersion: latestVersion,
      })
      await E2eEditUtil.verifySoftwares([firstSoftware, editedSoftware])
    })
    it('edit interactive all fields installed error reconfigured', async () => {
      const command = 'node'
      const installedError = 'end of file'
      const installedVersion = '4.3.2'
      const latestVersion = '5.4.3'
      const oldSoftware = new Software({
        name: 'e2e edit interactive all fields installed error reconfigured',
        shell: 'greek',
        directory: 'hubris',
        executable: {
          command: 'mythology',
        },
        args: 'prisoner',
        installedRegex: 'wax',
        url: 'https://flytothesun.com',
        latestRegex: 'icarus',
      })
      const newSoftware = new Software({
        name: `${oldSoftware.name} edited`,
        shell: '',
        directory: '',
        executable: {
          command,
        },
        args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eEditUtil.setSoftwares([oldSoftware])
      await E2eEditUtil.verifySoftwares([oldSoftware])
      await E2eTestUtil.editInteractiveReconfigure({
        existingSoftwares: [oldSoftware],
        positionToEdit: 0,
        installed: [
          {
            name: newSoftware.name,
            shell: KEYS.BACK_SPACE,
            directory: KEYS.BACK_SPACE,
            command,
            args: `${E2eEditUtil.COMMAND.Bad} ${installedError}`,
            regex: newSoftware.installedRegex,
            error: installedError,
            confirmOrReconfigure: true,
          },
          {
            shell: KEYS.BACK_SPACE,
            directory: KEYS.BACK_SPACE,
            command,
            args: newSoftware.args,
            regex: newSoftware.installedRegex,
            version: installedVersion,
            confirmOrReconfigure: true,
          },
        ],
        latest: [
          {
            url: newSoftware.url,
            regex: newSoftware.latestRegex,
            version: latestVersion,
            confirmOrReconfigure: true,
          },
        ],
      })
      await E2eEditUtil.verifySoftwares([newSoftware])
    })
    it('edit interactive all fields latest error reconfigured', async () => {
      const command = 'node'
      const latestError = 'could not connect'
      const installedVersion = '7.8.9'
      const latestVersion = '10.9.8'
      const oldSoftware = new Software({
        name: 'e2e edit interactive all fields latest error reconfigured',
        shell: 'sports',
        directory: 'distance',
        executable: {
          command: 'golf',
        },
        args: 'clubs',
        installedRegex: 'wood',
        url: 'https://onthescrews.com',
        latestRegex: 'driver',
      })
      const newSoftware = new Software({
        name: `${oldSoftware.name} edited`,
        shell: '',
        directory: '',
        executable: {
          command,
        },
        args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eEditUtil.setSoftwares([oldSoftware])
      await E2eEditUtil.verifySoftwares([oldSoftware])
      await E2eTestUtil.editInteractiveReconfigure({
        existingSoftwares: [oldSoftware],
        positionToEdit: 0,
        installed: [
          {
            name: newSoftware.name,
            shell: KEYS.BACK_SPACE,
            directory: KEYS.BACK_SPACE,
            command,
            args: newSoftware.args,
            regex: newSoftware.installedRegex,
            version: installedVersion,
            confirmOrReconfigure: true,
          },
        ],
        latest: [
          {
            url: Website.getErrorUrl(latestError),
            regex: newSoftware.latestRegex,
            error: `Could not find match for regex "/${newSoftware.latestRegex}/" in text "${latestError}"`,
            confirmOrReconfigure: true,
          },
          {
            url: newSoftware.url,
            regex: newSoftware.latestRegex,
            version: latestVersion,
            confirmOrReconfigure: true,
          },
        ],
      })
      await E2eEditUtil.verifySoftwares([newSoftware])
    })
  })
})
