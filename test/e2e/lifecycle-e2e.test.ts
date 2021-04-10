import E2eAddUtil from './helpers/e2e-add-util'
import E2eDeleteUtil from './helpers/e2e-delete-util'
import E2eEditUtil from './helpers/e2e-edit-util'
import E2eHomeUtil, { HomeChoiceOption } from './helpers/e2e-home-util'
import E2eViewUtil from './helpers/e2e-view-util'
import interactiveExecute from './helpers/interactive-execute'
import Software from '../../src/software'
import Website from '../helpers/website'
import E2eBaseUtil, { RowDecoration } from './helpers/e2e-base-util'

describe('Lifecycle', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  it('lifecycle adds, edits, views and deletes correctly', async () => {
    const installedVersion = '1.0.0'
    const latestVersion = '1.0.1'
    const updatedLatestVersion = '1.0.0'
    const software = new Software({
      name: 'e2e lifecycle',
      executable: {
        command: 'node',
      },
      args: `${E2eAddUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
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
      shellOverride: software.shellOverride,
      installedRegex: software.installedRegex,
      url: Website.getResponseUrl(`latest: v${updatedLatestVersion}`),
      latestRegex: software.latestRegex,
    })
    const response = await interactiveExecute({
      inputs: [
        ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.View),
        ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Add),
        ...E2eAddUtil.getDefaultAddInputs({
          software,
        }),
        ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.View),
        ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Edit),
        ...E2eEditUtil.getDefaultEditInputs({
          position: 0,
          newSoftware: updatedSoftware,
          oldSoftware: software,
        }),
        ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.View),
        ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Delete),
        ...E2eDeleteUtil.getDefaultDeleteInputs({
          position: 0,
        }),
        ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.View),
        ...E2eHomeUtil.getDefaultOptionInputs(HomeChoiceOption.Exit),
      ],
    })
    E2eBaseUtil.validatePromptChunks(response.chunks, [
      ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.View),
      E2eViewUtil.MESSAGES.NoSoftwares,
      ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Add),
      ...E2eAddUtil.getDefaultAddChunks({
        software,
        installedVersion,
        latestVersion,
      }),
      ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.View),
      ...E2eViewUtil.getDefaultViewChunks({
        rows: [
          {
            name: software.name,
            installed: installedVersion,
            latest: latestVersion,
            decoration: RowDecoration.Update,
          },
        ],
      }),
      ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Edit),
      ...E2eEditUtil.getDefaultEditChunks({
        existingSoftwares: [software],
        newSoftware: updatedSoftware,
        installedVersion: installedVersion,
        latestVersion: updatedLatestVersion,
        oldSoftware: software,
      }),
      ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.View),
      ...E2eViewUtil.getDefaultViewChunks({
        rows: [
          {
            name: software.name,
            installed: installedVersion,
            latest: updatedLatestVersion,
          },
        ],
      }),
      ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Delete),
      ...E2eDeleteUtil.getDefaultDeleteChunks({
        existingSoftwares: [updatedSoftware],
        softwareToDelete: updatedSoftware,
      }),
      ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.View),
      E2eViewUtil.MESSAGES.NoSoftwares,
      ...E2eHomeUtil.getDefaultOptionChunks(HomeChoiceOption.Exit),
    ])
  })
})
