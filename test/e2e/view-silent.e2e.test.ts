import E2eTestUtil from './helpers/e2e-test-util'
import E2eViewUtil from './helpers/e2e-view-util'
import { RowDecoration } from './helpers/e2e-base-util'
import Software from '../../src/software/software'
import Website from '../helpers/website'

describe('View Silent', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  describe('valid', () => {
    it('view silent with non-existent softwares file says nothing to view', async () => {
      await E2eViewUtil.verifySoftwaresFileDoesNotExist()
      await E2eTestUtil.viewSilentNoSoftwares()
      await E2eViewUtil.verifySoftwares([])
    })
    it('view silent with no content softwares file says nothing to view', async () => {
      await E2eViewUtil.setSoftwares(undefined)
      await E2eViewUtil.verifySoftwares(undefined)
      await E2eTestUtil.viewSilentNoSoftwares()
      await E2eViewUtil.verifySoftwares([])
    })
    it('view silent with empty array softwares file says nothing to view', async () => {
      await E2eViewUtil.setSoftwares([])
      await E2eViewUtil.verifySoftwares([])
      await E2eTestUtil.viewSilentNoSoftwares()
      await E2eViewUtil.verifySoftwares([])
    })
    it('view silent single software without error or update', async () => {
      const installedVersion = '1.0.0'
      const latestVersion = '1.0.0'
      const software = new Software({
        name: 'e2e view silent single no error or update',
        shell: '',
        executable: {
          command: 'node',
        },
        args: `${E2eViewUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eViewUtil.setSoftwares([software])
      await E2eViewUtil.verifySoftwares([software])
      await E2eTestUtil.viewSilent({
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
    it('view silent single software with installed error', async () => {
      const installedError = 'null pointer'
      const latestVersion = '1.0.0'
      const software = new Software({
        name: 'e2e view silent single installed error',
        shell: '',
        executable: {
          command: 'node',
        },
        args: `${E2eViewUtil.COMMAND.Bad} ${installedError}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eViewUtil.setSoftwares([software])
      await E2eViewUtil.verifySoftwares([software])
      await E2eTestUtil.viewSilent({
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
    it('view silent single software with latest error', async () => {
      try {
        const installedVersion = '1.1.1'
        const latestError = 'socket timeout'
        const software = new Software({
          name: 'e2e view single latest error',
          shell: '',
          executable: {
            command: 'node',
          },
          args: `${E2eViewUtil.COMMAND.Good} v${installedVersion}`,
          installedRegex: 'v(.*)',
          url: Website.getErrorUrl(latestError),
          latestRegex: 'latest: v(.*)',
        })
        await E2eViewUtil.setSoftwares([software])
        await E2eViewUtil.verifySoftwares([software])
        await Website.stop()
        await E2eTestUtil.viewSilent({
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
    it('view silent single software with update', async () => {
      const installedVersion = '1.0.0'
      const latestVersion = '1.0.1'
      const software = new Software({
        name: 'e2e view single update',
        shell: '',
        executable: {
          command: 'node',
        },
        args: `${E2eViewUtil.COMMAND.Good} v${installedVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${latestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eViewUtil.setSoftwares([software])
      await E2eViewUtil.verifySoftwares([software])
      await E2eTestUtil.viewSilent({
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
    it('view silent two softwares without errors or updates', async () => {
      const firstInstalledVersion = '1.0.0'
      const firstLatestVersion = '1.0.0'
      const lastInstalledVersion = '1.0.1'
      const lastLatestVersion = '1.0.1'
      const firstSoftware = new Software({
        name: 'e2e view silent two no error or update first',
        shell: '',
        executable: {
          command: 'node',
        },
        args: `${E2eViewUtil.COMMAND.Good} v${firstInstalledVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${firstLatestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      const lastSoftware = new Software({
        name: 'e2e view silent two no error or update last',
        shell: '',
        executable: {
          command: 'node',
        },
        args: `${E2eViewUtil.COMMAND.Good} v${lastInstalledVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${lastLatestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eViewUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eViewUtil.verifySoftwares([firstSoftware, lastSoftware])
      await E2eTestUtil.viewSilent({
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
    it('view silent two softwares first installed error second none', async () => {
      const firstInstalledError = 'command not found'
      const firstLatestVersion = '1.0.0'
      const lastInstalledVersion = '1.0.1'
      const lastLatestVersion = '1.0.1'
      const firstSoftware = new Software({
        name: 'e2e view silent two first installed error second none first',
        shell: '',
        executable: {
          command: 'node',
        },
        args: `${E2eViewUtil.COMMAND.Bad} ${firstInstalledError}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${firstLatestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      const lastSoftware = new Software({
        name: 'e2e view silent two first installed error second none last',
        shell: '',
        executable: {
          command: 'node',
        },
        args: `${E2eViewUtil.COMMAND.Good} v${lastInstalledVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${lastLatestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      await E2eViewUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eViewUtil.verifySoftwares([firstSoftware, lastSoftware])
      await E2eTestUtil.viewSilent({
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
    it('view silent two softwares first update second latest error', async () => {
      const firstInstalledVersion = '1.0.0'
      const firstLatestVersion = '1.0.1'
      const lastInstalledVersion = '1.0.1'
      const lastLatestError = 'EADDRESS_NOT_FOUND'
      const firstSoftware = new Software({
        name: 'e2e view silent two first update second latest error first',
        shell: '',
        executable: {
          command: 'node',
        },
        args: `${E2eViewUtil.COMMAND.Good} v${firstInstalledVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getResponseUrl(`latest: v${firstLatestVersion}`),
        latestRegex: 'latest: v(.*)',
      })
      const lastSoftware = new Software({
        name: 'e2e view silent two first update second latest error last',
        shell: '',
        executable: {
          command: 'node',
        },
        args: `${E2eViewUtil.COMMAND.Good} v${lastInstalledVersion}`,
        installedRegex: 'v(.*)',
        url: Website.getErrorUrl(lastLatestError),
        latestRegex: 'latest: v(.*)',
      })
      await E2eViewUtil.setSoftwares([firstSoftware, lastSoftware])
      await E2eViewUtil.verifySoftwares([firstSoftware, lastSoftware])
      await E2eTestUtil.viewSilent({
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
})
