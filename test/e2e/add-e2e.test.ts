import E2eAddUtil from './helpers/e2e-add-util'
import E2eHomeUtil, { HomeChoiceOption } from './helpers/e2e-home-util'
import interactiveExecute, { KEYS } from './helpers/interactive-execute'
import Software from '../../src/software'
import Website from '../helpers/website'

describe('Add', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  it('cannot add software with existing name', async () => {
    const existing = new Software({
      name: 'e2e add name that already exists existing',
      executable: {
        command: 'UNSC',
      },
      args: 'spartan',
      shellOverride: 'halo',
      installedRegex: '117',
      url: 'https://ineedaweapon.com',
      latestRegex: 'master chief',
    })
    await E2eAddUtil.setSoftwares([existing])
    await E2eAddUtil.verifySoftwares([existing])
    await testAddNameAlreadyExists({
      name: existing.name,
    })
    await E2eAddUtil.setSoftwares([existing])
    await E2eAddUtil.verifySoftwares([existing])
  })
  it('adds valid software with non-existent softwares file', async () => {
    await E2eAddUtil.verifySoftwares(undefined, false)
    const installedVersion = '1.0.0'
    const latestVersion = '1.0.1'
    const software = new Software({
      name: 'e2e valid with non-existent',
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
  it('adds valid software with no content softwares file', async () => {
    await E2eAddUtil.setSoftwares(undefined)
    await E2eAddUtil.verifySoftwares(undefined)
    const installedVersion = '1.0.1'
    const latestVersion = '1.0.2'
    const software = new Software({
      name: 'e2e valid with empty file',
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
  it('adds valid software with empty array softwares file', async () => {
    await E2eAddUtil.setSoftwares([])
    await E2eAddUtil.verifySoftwares([])
    const installedVersion = '1.0.2'
    const latestVersion = '1.0.3'
    const software = new Software({
      name: 'e2e valid with empty array',
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
  it('adds valid software to beginning with single existing softwares file', async () => {
    const existing = new Software({
      name: 'z very last von',
      executable: {
        command: 'endings',
      },
      args: 'heroes',
      shellOverride: 'literature',
      installedRegex: 'return',
      url: 'https://endoftheroad.com',
      latestRegex: 'denouement',
    })
    await E2eAddUtil.setSoftwares([existing])
    await E2eAddUtil.verifySoftwares([existing])
    const installedVersion = '1.1.1'
    const latestVersion = '1.1.2'
    const software = new Software({
      name: 'e2e valid to beginning with single existing',
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
  it('adds valid software to end with single existing softwares file', async () => {
    const existing = new Software({
      name: 'a first software',
      executable: {
        command: 'medals',
      },
      args: 'materials',
      shellOverride: 'metals',
      installedRegex: 'gold',
      url: 'https://winner.com',
      latestRegex: 'aurum',
    })
    await E2eAddUtil.setSoftwares([existing])
    await E2eAddUtil.verifySoftwares([existing])
    const installedVersion = '0.1.0'
    const latestVersion = '1.0.0'
    const software = new Software({
      name: 'e2e valid to end with single existing',
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
  it('adds valid software to middle with two existing softwares file', async () => {
    const existingFirst = new Software({
      name: 'a first of two softwares',
      executable: {
        command: 'sentences',
      },
      args: 'first',
      shellOverride: 'historical fiction',
      installedRegex: 'the\\ whale',
      url: 'https://callmeishmael.com',
      latestRegex: 'moby\\ dick',
    })
    const existingSecond = new Software({
      name: 'z last of two softwares',
      executable: {
        command: 'lines',
      },
      args: 'last',
      shellOverride: 'science fiction',
      installedRegex: 'the\\ modern\\ prometheus',
      url: 'https://lostindarknessanddistance.com',
      latestRegex: 'frankenstein',
    })
    await E2eAddUtil.setSoftwares([existingFirst, existingSecond])
    await E2eAddUtil.verifySoftwares([existingFirst, existingSecond])
    const installedVersion = '1.5.0'
    const latestVersion = '1.5.1'
    const software = new Software({
      name: 'e2e valid to middle with two existing',
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
})

async function testAddNameAlreadyExists({ name }: { name: string }) {
  const response = await interactiveExecute({
    inputs: [...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Add), name, KEYS.Enter],
  })
  E2eAddUtil.validatePromptChunks(response.chunks, [
    ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Add),
    {
      question: 'Name to identify new software',
      answer: name,
    },
    E2eAddUtil.getNameInUseMessage(name),
    '? Name to identify new software: ',
  ])
}

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
    inputs: [
      ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Add),
      ...E2eAddUtil.getDefaultAddInputs({
        software,
      }),
      ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Exit),
    ],
  })
  E2eAddUtil.validatePromptChunks(response.chunks, [
    ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Add),
    ...E2eAddUtil.getDefaultAddChunks({
      software,
      installedVersion,
      latestVersion,
    }),
    ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Exit),
  ])
}
