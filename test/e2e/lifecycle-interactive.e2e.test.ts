import E2eAddUtil from './helpers/e2e-add-util'
import E2eBaseUtil, { RowDecoration } from './helpers/e2e-base-util'
import E2eDeleteUtil from './helpers/e2e-delete-util'
import E2eEditUtil from './helpers/e2e-edit-util'
import E2eHomeUtil, { HomeChoiceOption } from './helpers/e2e-home-util'
import E2eViewUtil from './helpers/e2e-view-util'
import interactiveExecute from './helpers/interactive-execute'
import Software from '../../src/software/software'
import Website from '../helpers/website'

describe('Lifecycle Interactive', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  it('lifecycle interactive adds, edits, views and deletes correctly', async () => {
    const installedVersion = '1.0.0'
    const latestVersion = '1.0.1'
    const updatedLatestVersion = '1.0.0'
    const software = new Software({
      name: 'e2e lifecycle interactive',
      shell: '',
      directory: '',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    const updatedSoftware = new Software({
      name: software.name,
      shell: software.shell,
      directory: software.directory,
      executable: {
        command: 'node',
      },
      args: software.args,
      installedRegex: software.installedRegex,
      url: Website.getResponseUrl(`latest: v${updatedLatestVersion}`),
      latestRegex: software.latestRegex,
    })
    const response = await interactiveExecute({
      timeoutMs: 17000,
      inputs: [
        ...E2eHomeUtil.getInputs(HomeChoiceOption.View),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Add),
        ...E2eAddUtil.getInputs({
          software,
        }),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.View),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Edit),
        ...E2eEditUtil.getInputs({
          position: 0,
          newSoftware: updatedSoftware,
          oldSoftware: software,
        }),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.View),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Delete),
        ...E2eDeleteUtil.getInputs({
          position: 0,
        }),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.View),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit),
      ],
    })
    await E2eBaseUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.View),
      E2eViewUtil.MESSAGES.NoSoftwaresToView,
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Add),
      ...E2eAddUtil.getChunks({
        software,
        installedVersion,
        latestVersion,
      }),
      ...E2eHomeUtil.getChunks(HomeChoiceOption.View),
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
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Edit),
      ...E2eEditUtil.getChunks({
        existingSoftwares: [software],
        newSoftware: updatedSoftware,
        installedVersion: installedVersion,
        latestVersion: updatedLatestVersion,
        oldSoftware: software,
      }),
      ...E2eHomeUtil.getChunks(HomeChoiceOption.View),
      ...E2eViewUtil.getChunks({
        rows: [
          {
            name: software.name,
            installed: installedVersion,
            latest: updatedLatestVersion,
          },
        ],
      }),
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Delete),
      ...E2eDeleteUtil.getChunks({
        existingSoftwares: [updatedSoftware],
        softwareToDelete: updatedSoftware,
      }),
      ...E2eHomeUtil.getChunks(HomeChoiceOption.View),
      E2eViewUtil.MESSAGES.NoSoftwaresToView,
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
    ])
  })
})
