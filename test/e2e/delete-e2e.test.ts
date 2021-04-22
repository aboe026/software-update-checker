import E2eHomeUtil, { HomeChoiceOption } from './helpers/e2e-home-util'
import E2eDeleteUtil from './helpers/e2e-delete-util'
import interactiveExecute from './helpers/interactive-execute'
import Software from '../../src/software'
import Website from '../helpers/website'

describe('Delete', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  it('deleting with non-existent softwares file says nothing to delete', async () => {
    await E2eDeleteUtil.verifySoftwares(undefined, false)
    await testNoSoftwaresDelete()
    await E2eDeleteUtil.verifySoftwares([])
  })
  it('deleting with no content softwares file says nothing to delete', async () => {
    await E2eDeleteUtil.setSoftwares(undefined)
    await E2eDeleteUtil.verifySoftwares(undefined)
    await testNoSoftwaresDelete()
    await E2eDeleteUtil.verifySoftwares([])
  })
  it('deleting with empty array softwares file says nothing to delete', async () => {
    await E2eDeleteUtil.setSoftwares([])
    await E2eDeleteUtil.verifySoftwares([])
    await testNoSoftwaresDelete()
    await E2eDeleteUtil.verifySoftwares([])
  })
  it('delete but do not confirm does not remove', async () => {
    const name = 'e2e delete without confirm'
    const software = new Software({
      name,
      executable: {
        command: 'show',
      },
      args: 'reality',
      shellOverride: 'television',
      installedRegex: 'competition',
      url: 'https://thetribehasspoken.com',
      latestRegex: 'survivor',
    })
    await E2eDeleteUtil.setSoftwares([software])
    await E2eDeleteUtil.verifySoftwares([software])
    await testDefaultDelete({
      existingSoftwares: [software],
      positionToDelete: 0,
      confirm: false,
    })
    await E2eDeleteUtil.verifySoftwares([software])
  })
  it('delete only software', async () => {
    const software = new Software({
      name: 'e2e delete only',
      executable: {
        command: 'commands',
      },
      args: 'delete',
      shellOverride: 'DOS',
      installedRegex: 'del',
      url: 'https://goodbye.com',
      latestRegex: 'erase',
    })
    await E2eDeleteUtil.setSoftwares([software])
    await E2eDeleteUtil.verifySoftwares([software])
    await testDefaultDelete({
      existingSoftwares: [software],
      positionToDelete: 0,
    })
    await E2eDeleteUtil.verifySoftwares([])
  })
  it('delete first of two softwares', async () => {
    const firstSoftware = new Software({
      name: 'e2e delete first of two first',
      executable: {
        command: 'assistant-manager',
      },
      args: 'propane',
      shellOverride: 'animated',
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
      shellOverride: 'sitcom',
      installedRegex: 'michael',
      url: 'https://thatswhatshesaid.com',
      latestRegex: 'Michael Gary Scott',
    })
    await E2eDeleteUtil.setSoftwares([firstSoftware, lastSoftware])
    await E2eDeleteUtil.verifySoftwares([firstSoftware, lastSoftware])
    await testDefaultDelete({
      existingSoftwares: [firstSoftware, lastSoftware],
      positionToDelete: 0,
    })
    await E2eDeleteUtil.verifySoftwares([lastSoftware])
  })
  it('delete last of two softwares', async () => {
    const firstSoftware = new Software({
      name: 'e2e delete last of two first',
      executable: {
        command: 'hero',
      },
      args: 'mortal',
      shellOverride: 'marvel',
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
      shellOverride: 'dc',
      installedRegex: 'clown',
      url: 'https://whysoserious.com',
      latestRegex: 'joker',
    })
    await E2eDeleteUtil.setSoftwares([firstSoftware, lastSoftware])
    await E2eDeleteUtil.verifySoftwares([firstSoftware, lastSoftware])
    await testDefaultDelete({
      existingSoftwares: [firstSoftware, lastSoftware],
      positionToDelete: 1,
    })
    await E2eDeleteUtil.verifySoftwares([firstSoftware])
  })
})

async function testNoSoftwaresDelete() {
  const response = await interactiveExecute({
    inputs: [...E2eHomeUtil.getInputs(HomeChoiceOption.Delete), ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit)],
  })
  E2eDeleteUtil.validateChunks(response.chunks, [
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Delete),
    E2eDeleteUtil.MESSAGES.NoSoftwares,
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
  ])
}

async function testDefaultDelete({
  existingSoftwares,
  positionToDelete,
  confirm = true,
}: {
  existingSoftwares: Software[]
  positionToDelete: number
  confirm?: boolean
}) {
  const response = await interactiveExecute({
    inputs: [
      ...E2eHomeUtil.getInputs(HomeChoiceOption.Delete),
      ...E2eDeleteUtil.getInputs({
        position: positionToDelete,
        confirm,
      }),
      ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit),
    ],
  })
  E2eDeleteUtil.validateChunks(response.chunks, [
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Delete),
    ...E2eDeleteUtil.getChunks({
      existingSoftwares,
      softwareToDelete: existingSoftwares[positionToDelete],
      confirm,
    }),
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
  ])
}
