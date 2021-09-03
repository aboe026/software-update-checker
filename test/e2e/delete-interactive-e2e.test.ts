import E2eDeleteUtil from './helpers/e2e-delete-util'
import E2eTestUtil from './helpers/e2e-test-util'
import Software from '../../src/software/software'
import Website from '../helpers/website'

describe('Delete Interactive', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  describe('invalid', () => {
    it('delete interactive with non-existent softwares file says nothing to delete', async () => {
      await E2eDeleteUtil.verifySoftwaresFileDoesNotExist()
      await E2eTestUtil.deleteInteractiveNoSoftwares()
      await E2eDeleteUtil.verifySoftwares([])
    })
    it('delete interactive with no content softwares file says nothing to delete', async () => {
      await E2eDeleteUtil.setSoftwares(undefined)
      await E2eDeleteUtil.verifySoftwares(undefined)
      await E2eTestUtil.deleteInteractiveNoSoftwares()
      await E2eDeleteUtil.verifySoftwares([])
    })
    it('delete interactive with empty array softwares file says nothing to delete', async () => {
      await E2eDeleteUtil.setSoftwares([])
      await E2eDeleteUtil.verifySoftwares([])
      await E2eTestUtil.deleteInteractiveNoSoftwares()
      await E2eDeleteUtil.verifySoftwares([])
    })
    it('delete interactive without confirm does not remove', async () => {
      const name = 'e2e delete without confirm'
      const software = new Software({
        name,
        executable: {
          command: 'show',
        },
        args: 'reality',
        shell: 'television',
        installedRegex: 'competition',
        url: 'https://thetribehasspoken.com',
        latestRegex: 'survivor',
      })
      await E2eDeleteUtil.setSoftwares([software])
      await E2eDeleteUtil.verifySoftwares([software])
      await E2eTestUtil.deleteInteractive({
        existingSoftwares: [software],
        positionToDelete: 0,
        confirm: false,
      })
      await E2eDeleteUtil.verifySoftwares([software])
    })
  })
  describe('valid', () => {
    it('delete interactive only software', async () => {
      const software = new Software({
        name: 'e2e delete only',
        executable: {
          command: 'commands',
        },
        args: 'delete',
        shell: 'DOS',
        installedRegex: 'del',
        url: 'https://goodbye.com',
        latestRegex: 'erase',
      })
      await E2eDeleteUtil.setSoftwares([software])
      await E2eDeleteUtil.verifySoftwares([software])
      await E2eTestUtil.deleteInteractive({
        existingSoftwares: [software],
        positionToDelete: 0,
      })
      await E2eDeleteUtil.verifySoftwares([])
    })
    it('delete interactive first of two softwares', async () => {
      const firstSoftware = new Software({
        name: 'e2e delete first of two first',
        executable: {
          command: 'assistant-manager',
        },
        args: 'propane',
        shell: 'animated',
        installedRegex: 'hank',
        url: 'https://goshdangitbobby.com',
        latestRegex: 'Hank Rutherford Hill',
      })
      const lastSoftware = new Software({
        name: 'e2e delete first of two last',
        executable: {
          command: 'regional-manager',
        },
        args: 'paper',
        shell: 'sitcom',
        installedRegex: 'michael',
        url: 'https://thatswhatshesaid.com',
        latestRegex: 'Michael Gary Scott',
      })
      await E2eDeleteUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eDeleteUtil.verifySoftwares([firstSoftware, lastSoftware])
      await E2eTestUtil.deleteInteractive({
        existingSoftwares: [firstSoftware, lastSoftware],
        positionToDelete: 0,
      })
      await E2eDeleteUtil.verifySoftwares([lastSoftware])
    })
    it('delete interactive last of two softwares', async () => {
      const firstSoftware = new Software({
        name: 'e2e delete last of two first',
        executable: {
          command: 'hero',
        },
        args: 'mortal',
        shell: 'marvel',
        installedRegex: 'tony',
        url: 'https://3000.com',
        latestRegex: 'iron man',
      })
      const lastSoftware = new Software({
        name: 'e2e delete last of two last',
        executable: {
          command: 'villian',
        },
        args: 'human',
        shell: 'dc',
        installedRegex: 'clown',
        url: 'https://whysoserious.com',
        latestRegex: 'joker',
      })
      await E2eDeleteUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eDeleteUtil.verifySoftwares([firstSoftware, lastSoftware])
      await E2eTestUtil.deleteInteractive({
        existingSoftwares: [firstSoftware, lastSoftware],
        positionToDelete: 1,
      })
      await E2eDeleteUtil.verifySoftwares([firstSoftware])
    })
  })
})
