import E2eHomeUtil, { HomeChoiceOption } from './helpers/e2e-home-util'
import E2eViewUtil from './helpers/e2e-view-util'
import interactiveExecute from './helpers/interactive-execute'
import { RowDecoration, TableRow } from './helpers/e2e-base-util'
import Software from '../../src/software'
import Website from '../helpers/website'

describe('View', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  it('viewing with non-existent softwares file says nothing to view', async () => {
    await E2eViewUtil.verifySoftwares(undefined, false)
    await testNoSoftwaresView()
    await E2eViewUtil.verifySoftwares([])
  })
  it('viewing with no content softwares file says nothing to view', async () => {
    await E2eViewUtil.setSoftwares(undefined)
    await E2eViewUtil.verifySoftwares(undefined)
    await testNoSoftwaresView()
    await E2eViewUtil.verifySoftwares([])
  })
  it('viewing with empty array softwares file says nothing to view', async () => {
    await E2eViewUtil.setSoftwares([])
    await E2eViewUtil.verifySoftwares([])
    await testNoSoftwaresView()
    await E2eViewUtil.verifySoftwares([])
  })
  it('view single software without error or update', async () => {
    const installedVersion = '1.0.0'
    const latestVersion = '1.0.0'
    const software = new Software({
      name: 'e2e view single no error or update',
      executable: {
        command: 'node',
      },
      args: `${E2eViewUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eViewUtil.setSoftwares([software])
    await E2eViewUtil.verifySoftwares([software])
    await testDefaultView({
      rows: [
        {
          name: software.name,
          installed: installedVersion,
          latest: latestVersion,
        },
      ],
    })
    await E2eViewUtil.verifySoftwares([software])
  })
  it('view single software with installed error', async () => {
    const installedError = 'null pointer'
    const latestVersion = '1.0.0'
    const software = new Software({
      name: 'e2e view single installed error',
      executable: {
        command: 'node',
      },
      args: `${E2eViewUtil.COMMAND.Bad} ${installedError}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eViewUtil.setSoftwares([software])
    await E2eViewUtil.verifySoftwares([software])
    await testDefaultView({
      rows: [
        {
          name: software.name,
          installed: 'Error',
          latest: latestVersion,
          decoration: RowDecoration.Error,
        },
      ],
    })
    await E2eViewUtil.verifySoftwares([software])
  })
  it('view single software with latest error', async () => {
    try {
      const installedVersion = '1.1.1'
      const latestError = 'socket timeout'
      const software = new Software({
        name: 'e2e view single latest error',
        executable: {
          command: 'node',
        },
        args: `${E2eViewUtil.COMMAND.Good} v${installedVersion}`,
        shellOverride: '',
        installedRegex: 'v(.*)',
        url: Website.getErrorUrl(latestError),
        latestRegex: 'latest: v(.*)',
      })
      await E2eViewUtil.setSoftwares([software])
      await E2eViewUtil.verifySoftwares([software])
      await Website.stop()
      await testDefaultView({
        rows: [
          {
            name: software.name,
            installed: installedVersion,
            latest: 'Error',
            decoration: RowDecoration.Error,
          },
        ],
      })
      await E2eViewUtil.verifySoftwares([software])
    } finally {
      await Website.start()
    }
  })
  it('view single software with update', async () => {
    const installedVersion = '1.0.0'
    const latestVersion = '1.0.1'
    const software = new Software({
      name: 'e2e view single update',
      executable: {
        command: 'node',
      },
      args: `${E2eViewUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eViewUtil.setSoftwares([software])
    await E2eViewUtil.verifySoftwares([software])
    await testDefaultView({
      rows: [
        {
          name: software.name,
          installed: installedVersion,
          latest: latestVersion,
          decoration: RowDecoration.Update,
        },
      ],
    })
    await E2eViewUtil.verifySoftwares([software])
  })
  it('view two softwares without errors or updates', async () => {
    const firstInstalledVersion = '1.0.0'
    const firstLatestVersion = '1.0.0'
    const lastInstalledVersion = '1.0.1'
    const lastLatestVersion = '1.0.1'
    const firstSoftware = new Software({
      name: 'e2e view two no error or update first',
      executable: {
        command: 'node',
      },
      args: `${E2eViewUtil.COMMAND.Good} v${firstInstalledVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${firstLatestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    const lastSoftware = new Software({
      name: 'e2e view two no error or update last',
      executable: {
        command: 'node',
      },
      args: `${E2eViewUtil.COMMAND.Good} v${lastInstalledVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${lastLatestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eViewUtil.setSoftwares([firstSoftware, lastSoftware])
    await E2eViewUtil.verifySoftwares([firstSoftware, lastSoftware])
    await testDefaultView({
      rows: [
        {
          name: firstSoftware.name,
          installed: firstInstalledVersion,
          latest: firstLatestVersion,
        },
        {
          name: lastSoftware.name,
          installed: lastInstalledVersion,
          latest: lastLatestVersion,
        },
      ],
    })
    await E2eViewUtil.verifySoftwares([firstSoftware, lastSoftware])
  })
  it('view two softwares first installed error second none', async () => {
    const firstInstalledError = 'command not found'
    const firstLatestVersion = '1.0.0'
    const lastInstalledVersion = '1.0.1'
    const lastLatestVersion = '1.0.1'
    const firstSoftware = new Software({
      name: 'e2e view two first installed error second none first',
      executable: {
        command: 'node',
      },
      args: `${E2eViewUtil.COMMAND.Bad} ${firstInstalledError}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${firstLatestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    const lastSoftware = new Software({
      name: 'e2e view two first installed error second none last',
      executable: {
        command: 'node',
      },
      args: `${E2eViewUtil.COMMAND.Good} v${lastInstalledVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${lastLatestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eViewUtil.setSoftwares([firstSoftware, lastSoftware])
    await E2eViewUtil.verifySoftwares([firstSoftware, lastSoftware])
    await testDefaultView({
      rows: [
        {
          name: firstSoftware.name,
          installed: 'Error',
          latest: firstLatestVersion,
          decoration: RowDecoration.Error,
        },
        {
          name: lastSoftware.name,
          installed: lastInstalledVersion,
          latest: lastLatestVersion,
        },
      ],
    })
    await E2eViewUtil.verifySoftwares([firstSoftware, lastSoftware])
  })
  it('view two softwares first update second latest error', async () => {
    const firstInstalledVersion = '1.0.0'
    const firstLatestVersion = '1.0.1'
    const lastInstalledVersion = '1.0.1'
    const lastLatestError = 'EADDRESS_NOT_FOUND'
    const firstSoftware = new Software({
      name: 'e2e view two first update second latest error first',
      executable: {
        command: 'node',
      },
      args: `${E2eViewUtil.COMMAND.Good} v${firstInstalledVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${firstLatestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    const lastSoftware = new Software({
      name: 'e2e view two first update second latest error last',
      executable: {
        command: 'node',
      },
      args: `${E2eViewUtil.COMMAND.Good} v${lastInstalledVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getErrorUrl(lastLatestError),
      latestRegex: 'latest: v(.*)',
    })
    await E2eViewUtil.setSoftwares([firstSoftware, lastSoftware])
    await E2eViewUtil.verifySoftwares([firstSoftware, lastSoftware])
    await testDefaultView({
      rows: [
        {
          name: firstSoftware.name,
          installed: firstInstalledVersion,
          latest: firstLatestVersion,
          decoration: RowDecoration.Update,
        },
        {
          name: lastSoftware.name,
          installed: lastInstalledVersion,
          latest: 'Error',
          decoration: RowDecoration.Error,
        },
      ],
    })
    await E2eViewUtil.verifySoftwares([firstSoftware, lastSoftware])
  })
})

async function testNoSoftwaresView() {
  const response = await interactiveExecute({
    inputs: [...E2eHomeUtil.getInputs(HomeChoiceOption.View), ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit)],
  })
  E2eViewUtil.validateChunks(response.chunks, [
    ...E2eHomeUtil.getChunks(HomeChoiceOption.View),
    E2eViewUtil.MESSAGES.NoSoftwares,
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
  ])
}

async function testDefaultView({ rows }: { rows: TableRow[] }) {
  const response = await interactiveExecute({
    inputs: [...E2eHomeUtil.getInputs(HomeChoiceOption.View), ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit)],
  })
  E2eViewUtil.validateChunks(response.chunks, [
    ...E2eHomeUtil.getChunks(HomeChoiceOption.View),
    ...E2eViewUtil.getChunks({
      rows,
    }),
    ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
  ])
}
