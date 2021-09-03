import E2eDeleteUtil from './helpers/e2e-delete-util'
import E2eTestUtil from './helpers/e2e-test-util'
import Software from '../../src/software/software'
import Website from '../helpers/website'

describe('Delete Silent', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  describe('invalid', () => {
    it('delete silent with non-existent softwares file says nothing to delete', async () => {
      await E2eDeleteUtil.verifySoftwaresFileDoesNotExist()
      await E2eTestUtil.silentError({
        args: E2eDeleteUtil.getSilentCommand({
          existingName: 'pumpernickle',
        }),
        error: E2eDeleteUtil.MESSAGES.NoSoftwares,
      })
      await E2eDeleteUtil.verifySoftwares([])
    })
    it('delete silent with no content softwares file says nothing to delete', async () => {
      await E2eDeleteUtil.setSoftwares(undefined)
      await E2eDeleteUtil.verifySoftwares(undefined)
      await E2eTestUtil.silentError({
        args: E2eDeleteUtil.getSilentCommand({
          existingName: 'snickerdoodle',
        }),
        error: E2eDeleteUtil.MESSAGES.NoSoftwares,
      })
      await E2eDeleteUtil.verifySoftwares([])
    })
    it('delete silent with empty array softwares file says nothing to delete', async () => {
      await E2eDeleteUtil.setSoftwares([])
      await E2eDeleteUtil.verifySoftwares([])
      await E2eTestUtil.silentError({
        args: E2eDeleteUtil.getSilentCommand({
          existingName: 'paprikash',
        }),
        error: E2eDeleteUtil.MESSAGES.NoSoftwares,
      })
      await E2eDeleteUtil.verifySoftwares([])
    })
    it('delete silent no existing command', async () => {
      const software = new Software({
        name: 'e2e delete silent no existing command',
        executable: {
          command: 'coffee',
        },
        args: 'espresso',
        shell: 'caffeine',
        installedRegex: 'marked',
        url: 'https://coffeewithadrop.com',
        latestRegex: 'caffe macchiato',
      })
      await E2eDeleteUtil.setSoftwares([software])
      await E2eDeleteUtil.verifySoftwares([software])
      await E2eTestUtil.silentError({
        args: E2eDeleteUtil.getSilentCommand({
          existingName: undefined,
        }),
        error: E2eDeleteUtil.getNotEnoughCommandsMessage(0, 1),
      })
      await E2eDeleteUtil.verifySoftwares([software])
    })
  })
  describe('valid', () => {
    it('delete silent only software', async () => {
      const software = new Software({
        name: 'e2e delete silent only',
        executable: {
          command: 'apple',
        },
        args: 'cultivar',
        shell: 'fruit',
        installedRegex: 'UofM',
        url: 'https://anappleaday.com',
        latestRegex: 'Malus pumila',
      })
      await E2eDeleteUtil.setSoftwares([software])
      await E2eDeleteUtil.verifySoftwares([software])
      await E2eTestUtil.deleteSilent({
        existingName: software.name,
      })
      await E2eDeleteUtil.verifySoftwares([])
    })
    it('delete silent first of two softwares', async () => {
      const firstSoftware = new Software({
        name: 'e2e delete silent first of two first',
        executable: {
          command: 'cocktail',
        },
        args: 'blended',
        shell: 'drink',
        installedRegex: 'strained pineapple',
        url: 'https://gettingcaughtintherain.com',
        latestRegex: 'piña colada',
      })
      const lastSoftware = new Software({
        name: 'e2e delete silent first of two last',
        executable: {
          command: 'mixed',
        },
        args: 'buck',
        shell: 'beverage',
        installedRegex: 'copper',
        url: 'https://fromrussiawithlime.com',
        latestRegex: 'moscow mule',
      })
      await E2eDeleteUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eDeleteUtil.verifySoftwares([firstSoftware, lastSoftware])
      await E2eTestUtil.deleteSilent({
        existingName: firstSoftware.name,
      })
      await E2eDeleteUtil.verifySoftwares([lastSoftware])
    })
    it('delete silent last of two softwares', async () => {
      const firstSoftware = new Software({
        name: 'e2e delete silent last of two first',
        executable: {
          command: 'atmospheric',
        },
        args: 'ionization',
        shell: 'high-latitude',
        installedRegex: 'northern lights',
        url: 'https://nightlightshow.com',
        latestRegex: 'aurora borealis',
      })
      const lastSoftware = new Software({
        name: 'e2e delete silent last of two last',
        executable: {
          command: 'measurement',
        },
        args: 'length',
        shell: 'unit',
        installedRegex: 'astronomical',
        url: 'https://partialparsec.com',
        latestRegex: 'sun.*earth',
      })
      await E2eDeleteUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eDeleteUtil.verifySoftwares([firstSoftware, lastSoftware])
      await E2eTestUtil.deleteSilent({
        existingName: lastSoftware.name,
      })
      await E2eDeleteUtil.verifySoftwares([firstSoftware])
    })
  })
})
