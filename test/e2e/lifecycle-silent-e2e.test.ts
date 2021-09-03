import E2eBaseUtil, { RowDecoration } from './helpers/e2e-base-util'
import E2eTestUtil from './helpers/e2e-test-util'
import Software from '../../src/software/software'
import Website from '../helpers/website'

describe('Lifecycle Silent', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  it('lifecycle silent adds, edits, views and deletes correctly', async () => {
    const installedVersion = '1.0.0'
    const latestVersion = '1.0.1'
    const updatedLatestVersion = '1.0.0'
    const software = new Software({
      name: 'e2e lifecycle silent',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      shell: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    const updatedSoftware = new Software({
      name: software.name,
      executable: {
        command: 'node',
      },
      args: software.args,
      shell: software.shell,
      installedRegex: software.installedRegex,
      url: Website.getResponseUrl(`latest: v${updatedLatestVersion}`),
      latestRegex: software.latestRegex,
    })
    await E2eTestUtil.viewSilentNoSoftwares()
    await E2eTestUtil.addSilent({
      software,
      installedVersion,
      latestVersion,
    })
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
    await E2eTestUtil.editSilent({
      existingName: software.name,
      newSoftware: updatedSoftware,
      newInstalledVersion: installedVersion,
      newLatestVersion: updatedLatestVersion,
    })
    await E2eTestUtil.viewSilent({
      rows: [
        {
          name: software.name,
          installed: installedVersion,
          latest: updatedLatestVersion,
        },
      ],
    })
    await E2eTestUtil.deleteSilent({
      existingName: updatedSoftware.name,
    })
    await E2eTestUtil.viewSilentNoSoftwares()
  })
})
