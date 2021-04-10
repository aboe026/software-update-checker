import E2eEditUtil from './helpers/e2e-edit-util'
import E2eHomeUtil, { HomeChoiceOption } from './helpers/e2e-home-util'
import interactiveExecute, { KEYS } from './helpers/interactive-execute'
import Software from '../../src/software'
import Website from '../helpers/website'

describe('Edit', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  describe('No Softwares', () => {
    it('editing with non-existent softwares file says nothing to edit', async () => {
      await E2eEditUtil.verifySoftwares(undefined, false)
      await testNoSoftwaresEdit()
      await E2eEditUtil.verifySoftwares([])
    })
    it('editing with no content softwares file says nothing to edit', async () => {
      await E2eEditUtil.setSoftwares(undefined)
      await E2eEditUtil.verifySoftwares(undefined)
      await testNoSoftwaresEdit()
      await E2eEditUtil.verifySoftwares([])
    })
    it('editing with empty array softwares file says nothing to edit', async () => {
      await E2eEditUtil.setSoftwares([])
      await E2eEditUtil.verifySoftwares([])
      await testNoSoftwaresEdit()
      await E2eEditUtil.verifySoftwares([])
    })
  })
  it('cannot edit software to existing name', async () => {
    const firstSoftware = new Software({
      name: 'e2e edit to name that already exists first',
      executable: {
        command: 'wrap',
      },
      args: 'greece',
      shellOverride: 'food',
      installedRegex: 'gyros',
      url: 'https://itsallgreektome.com',
      latestRegex: 'doner kebab',
    })
    const secondSoftware = new Software({
      name: 'e2e edit to name that already exists second',
      executable: {
        command: 'dessert',
      },
      args: 'italian',
      shellOverride: 'food',
      installedRegex: 'gelato',
      url: 'https://bestfoodonearth.com',
      latestRegex: 'artisanal gelato',
    })
    await E2eEditUtil.setSoftwares([firstSoftware, secondSoftware])
    await E2eEditUtil.verifySoftwares([firstSoftware, secondSoftware])
    await testEditNameAlreadyExists({
      existingSoftwares: [firstSoftware, secondSoftware],
      positionToEdit: 0,
      name: secondSoftware.name,
    })
    await E2eEditUtil.setSoftwares([firstSoftware, secondSoftware])
    await E2eEditUtil.verifySoftwares([firstSoftware, secondSoftware])
  })
  it('edit all fields single software', async () => {
    const oldSoftware = new Software({
      name: 'e2e edit all fields single old',
      executable: {
        command: 'periods',
      },
      args: 'technological',
      shellOverride: 'past',
      installedRegex: 'paleolithic',
      url: 'https://frombonetosatellite.com',
      latestRegex: 'information age',
    })
    await E2eEditUtil.setSoftwares([oldSoftware])
    await E2eEditUtil.verifySoftwares([oldSoftware])
    const installedVersion = '3.0.0'
    const latestVersion = '3.0.1'
    const editedSoftware = new Software({
      name: 'e2e edit all fields single edited',
      executable: {
        command: 'node',
      },
      args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await testDefaultEdit({
      existingSoftwares: [oldSoftware],
      positionToEdit: 0,
      newSoftware: editedSoftware,
      newInstalledVersion: installedVersion,
      newLatestVersion: latestVersion,
    })
    await E2eEditUtil.verifySoftwares([editedSoftware])
  })
  it('edit all fields first of two softwares', async () => {
    const firstSoftware = new Software({
      name: 'e2e edit all fields first of two first',
      executable: {
        command: 'gods',
      },
      args: 'twins',
      shellOverride: 'greek',
      installedRegex: 'gemini',
      url: 'https://castortroyandpolluxtroy.com',
      latestRegex: 'dioscuri',
    })
    const lastSoftware = new Software({
      name: 'e2e edit all fields first of two last',
      executable: {
        command: 'philosophy',
      },
      args: 'concept',
      shellOverride: 'chinese',
      installedRegex: 'dualism',
      url: 'https://yinyang.com',
      latestRegex: 'cosmological qi',
    })
    await E2eEditUtil.setSoftwares([firstSoftware, lastSoftware])
    await E2eEditUtil.verifySoftwares([firstSoftware, lastSoftware])
    const installedVersion = '1.1.0'
    const latestVersion = '2.1.0'
    const editedSoftware = new Software({
      name: 'e2e edit all fields first of two first edited',
      executable: {
        command: 'node',
      },
      args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await testDefaultEdit({
      existingSoftwares: [firstSoftware, lastSoftware],
      positionToEdit: 0,
      newSoftware: editedSoftware,
      newInstalledVersion: installedVersion,
      newLatestVersion: latestVersion,
    })
    await E2eEditUtil.verifySoftwares([editedSoftware, lastSoftware])
  })
  it('edit all fields last of two softwares', async () => {
    const firstSoftware = new Software({
      name: 'e2e edit all fields last of two first',
      executable: {
        command: 'boss',
      },
      args: 'mafia',
      shellOverride: 'hbo',
      installedRegex: 't',
      url: 'https://sadclown.com',
      latestRegex: 'anthony john soprano sr.',
    })
    const lastSoftware = new Software({
      name: 'e2e edit all fields last of two last',
      executable: {
        command: 'chemist',
      },
      args: 'drugs',
      shellOverride: 'amc',
      installedRegex: 'heisenberg',
      url: 'https://iamtheonewhoknocks.com',
      latestRegex: 'walter hartwell  white sr.',
    })
    await E2eEditUtil.setSoftwares([firstSoftware, lastSoftware])
    await E2eEditUtil.verifySoftwares([firstSoftware, lastSoftware])
    const installedVersion = '1.1.0'
    const latestVersion = '1.2.0'
    const editedSoftware = new Software({
      name: 'e2e edit all fields last of two last edited',
      executable: {
        command: 'node',
      },
      args: `${E2eEditUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await testDefaultEdit({
      existingSoftwares: [firstSoftware, lastSoftware],
      positionToEdit: 1,
      newSoftware: editedSoftware,
      newInstalledVersion: installedVersion,
      newLatestVersion: latestVersion,
    })
    await E2eEditUtil.verifySoftwares([firstSoftware, editedSoftware])
  })
})

async function testNoSoftwaresEdit() {
  const response = await interactiveExecute({
    inputs: [
      ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Edit),
      ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Exit),
    ],
  })
  E2eEditUtil.validatePromptChunks(response.chunks, [
    ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Edit),
    E2eEditUtil.MESSAGES.NoSoftwares,
    ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Exit),
  ])
}

async function testEditNameAlreadyExists({
  existingSoftwares,
  positionToEdit,
  name,
}: {
  existingSoftwares: Software[]
  positionToEdit: number
  name: string
}) {
  const existingName = existingSoftwares[positionToEdit].name
  const response = await interactiveExecute({
    inputs: [
      ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Edit),
      ...E2eEditUtil.getNavigateToSoftwareToEditInputs(positionToEdit),
      name,
      KEYS.Enter,
    ],
  })
  E2eEditUtil.validatePromptChunks(response.chunks, [
    ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Edit),
    ...E2eEditUtil.getNavigateToSoftwareToEditChunks({
      existingSoftwares,
      nameToEdit: existingName,
    }),
    {
      question: 'Name to identify new software',
      answer: name,
      default: existingName,
    },
    E2eEditUtil.getNameInUseMessage(name),
    `? Name to identify new software: (${existingName}) `,
  ])
}

async function testDefaultEdit({
  existingSoftwares,
  positionToEdit,
  newSoftware,
  newInstalledVersion,
  newLatestVersion,
}: {
  existingSoftwares: Software[]
  positionToEdit: number
  newSoftware: Software
  newInstalledVersion: string
  newLatestVersion: string
}) {
  const response = await interactiveExecute({
    inputs: [
      ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Edit),
      ...E2eEditUtil.getDefaultEditInputs({
        position: positionToEdit,
        newSoftware,
        oldSoftware: existingSoftwares[positionToEdit],
      }),
      ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Exit),
    ],
  })
  E2eEditUtil.validatePromptChunks(response.chunks, [
    ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Edit),
    ...E2eEditUtil.getDefaultEditChunks({
      existingSoftwares,
      oldSoftware: existingSoftwares[positionToEdit],
      newSoftware,
      installedVersion: newInstalledVersion,
      latestVersion: newLatestVersion,
    }),
    ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Exit),
  ])
}
