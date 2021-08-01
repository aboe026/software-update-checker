import E2eAddUtil, { InstalledReconfiguration, LatestReconfiguration } from './helpers/e2e-add-util'
import E2eHomeUtil, { HomeChoiceOption } from './helpers/e2e-home-util'
import interactiveExecute, { KEYS } from './helpers/interactive-execute'
import Software from '../../src/software'
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
    it('add interactive fails if installed error and choose not to reconfigure', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      const installedError = 'does not compute'
      await testReconfigureAdd({
        name: 'e2e add interactive installed error no reconfigure',
        installed: [
          {
            command: 'node',
            args: `${E2eAddUtil.COMMAND.Bad} ${installedError}`,
            shellOverride: '',
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
        await testReconfigureAdd({
          name: 'e2e add interactive latest error no reconfigure',
          installed: [
            {
              command: 'node',
              args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
              shellOverride: '',
              regex: 'v(.*)',
              version: installedVersion,
              confirmOrReconfigure: true,
            },
          ],
          latest: [
            {
              url,
              regex: 'latest: v(.*)',
              error: `request to ${url} failed, reason: connect ECONNREFUSED 127.0.0.1:${port}`,
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
      await E2eAddUtil.verifySoftwares(undefined, false)
      const installedVersion = '1.0.0'
      const latestVersion = '1.0.1'
      const software = new Software({
        name: 'e2e add interactive valid with non-existent',
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
    it('add interactive valid software with no content softwares file', async () => {
      await E2eAddUtil.setSoftwares(undefined)
      await E2eAddUtil.verifySoftwares(undefined)
      const installedVersion = '1.0.1'
      const latestVersion = '1.0.2'
      const software = new Software({
        name: 'e2e add interactive valid with empty file',
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
    it('add interactive valid software with empty array softwares file', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      const installedVersion = '1.0.2'
      const latestVersion = '1.0.3'
      const software = new Software({
        name: 'e2e add interactive valid with empty array',
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
    it('add interactive valid software to beginning with single existing softwares file', async () => {
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
        name: 'e2e add interactive valid to beginning with single existing',
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
    it('add interactive valid software to end with single existing softwares file', async () => {
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
        name: 'e2e add interactive valid to end with single existing',
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
    it('add interactive valid software to middle with two existing softwares file', async () => {
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
        name: 'e2e add interactive valid to middle with two existing',
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
    it('add interactive valid software if installed error is reconfigured', async () => {
      await E2eAddUtil.setSoftwares([])
      await E2eAddUtil.verifySoftwares([])
      const command = 'node'
      const installedError = 'does not compute'
      const installedVersion = '1.2.3'
      const latestVersion = '2.3.4'
      const software = new Software({
        name: 'e2e add interactive installed error reconfigured',
        executable: {
          command,
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shellOverride: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await testReconfigureAdd({
        name: software.name,
        installed: [
          {
            command,
            args: `${E2eAddUtil.COMMAND.Bad} ${installedError}`,
            shellOverride: software.shellOverride,
            regex: software.installedRegex,
            error: installedError,
            confirmOrReconfigure: true,
          },
          {
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
        executable: {
          command,
        },
        args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
        shellOverride: '',
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await testReconfigureAdd({
        name: software.name,
        installed: [
          {
            command,
            args: software.args,
            shellOverride: software.shellOverride,
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
  })
})

async function testAddNameAlreadyExists({ name }: { name: string }) {
  const response = await interactiveExecute({
    inputs: [...E2eHomeUtil.getInputs(HomeChoiceOption.Add), name, KEYS.Enter],
  })
  await E2eAddUtil.validateChunks(response.chunks, [
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Add),
    {
      question: 'Name to identify software configuration',
      answer: name,
    },
    E2eAddUtil.getNameInUseMessage(name),
    '? Name to identify software configuration: ',
  ])
}

async function testReconfigureAdd({
  name,
  installed,
  latest = [],
}: {
  name: string
  installed: InstalledReconfiguration[]
  latest?: LatestReconfiguration[]
}) {
  const response = await interactiveExecute({
    inputs: [
      ...E2eHomeUtil.getInputs(HomeChoiceOption.Add),
      ...E2eAddUtil.getInputsReconfigure({
        name,
        installed,
        latest,
      }),
      ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit),
    ],
  })
  await E2eAddUtil.validateChunks(response.chunks, [
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Add),
    ...E2eAddUtil.getChunksReconfigure({
      name,
      installed,
      latest,
    }),
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
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
      ...E2eHomeUtil.getInputs(HomeChoiceOption.Add),
      ...E2eAddUtil.getInputs({
        software,
      }),
      ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit),
    ],
  })
  await E2eAddUtil.validateChunks(response.chunks, [
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Add),
    ...E2eAddUtil.getChunks({
      software,
      installedVersion,
      latestVersion,
    }),
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
  ])
}
