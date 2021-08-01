import E2eAddUtil from './helpers/e2e-add-util'
import E2eBaseUtil, { RowDecoration } from './helpers/e2e-base-util'
import E2eDeleteUtil from './helpers/e2e-delete-util'
import E2eEditUtil from './helpers/e2e-edit-util'
import E2eViewUtil from './helpers/e2e-view-util'
import interactiveExecute from './helpers/interactive-execute'
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
    await E2eViewUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eViewUtil.getSilentCommand(),
        })
      ).chunks,
      [E2eViewUtil.MESSAGES.NoSoftwares]
    )
    await E2eAddUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eAddUtil.getSilentCommand({ software }),
        })
      ).chunks,
      [
        ...E2eAddUtil.getChunksSilent({
          installedVersion,
          latestVersion,
        }),
      ]
    )
    await E2eViewUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eViewUtil.getSilentCommand(),
        })
      ).chunks,
      [
        ...E2eViewUtil.getChunks({
          rows: [
            {
              name: software.name,
              installed: installedVersion,
              latest: latestVersion,
              decoration: RowDecoration.Update,
            },
          ],
        }),
      ]
    )
    await E2eEditUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eEditUtil.getSilentCommand({
            existingName: software.name,
            newSoftware: updatedSoftware,
          }),
        })
      ).chunks,
      [
        ...E2eEditUtil.getChunksSilent({
          installedVersion,
          latestVersion: updatedLatestVersion,
        }),
      ]
    )
    await E2eViewUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eViewUtil.getSilentCommand(),
        })
      ).chunks,
      [
        ...E2eViewUtil.getChunks({
          rows: [
            {
              name: software.name,
              installed: installedVersion,
              latest: updatedLatestVersion,
            },
          ],
        }),
      ]
    )
    await E2eDeleteUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eDeleteUtil.getSilentCommand({
            existingName: updatedSoftware.name,
          }),
        })
      ).chunks,
      [...E2eDeleteUtil.getChunksSilent()]
    )
    await E2eViewUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eViewUtil.getSilentCommand(),
        })
      ).chunks,
      [E2eViewUtil.MESSAGES.NoSoftwares]
    )
  })
})
