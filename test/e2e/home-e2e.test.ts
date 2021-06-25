import E2eHomeUtil from './helpers/e2e-home-util'
import interactiveExecute from './helpers/interactive-execute'

describe('Home Interactive', () => {
  it('home interactive displays all options to user with add as default selection', async () => {
    await E2eHomeUtil.verifySoftwares(undefined, false)
    const response = await interactiveExecute({
      inputs: [],
    })
    await E2eHomeUtil.validateChunks(response.chunks, [
      {
        choice: E2eHomeUtil.CHOICES.Home,
      },
    ])
    await E2eHomeUtil.verifySoftwares(undefined, false)
  })
  it('home interactive selecting exit properly exits', async () => {
    await E2eHomeUtil.verifySoftwares(undefined, false)
    const response = await interactiveExecute({
      inputs: E2eHomeUtil.getInputs(E2eHomeUtil.CHOICES.Home.options.Exit),
    })
    await E2eHomeUtil.validateChunks(response.chunks, E2eHomeUtil.getChunks(E2eHomeUtil.CHOICES.Home.options.Exit))
    await E2eHomeUtil.verifySoftwares(undefined, false)
  })
})
