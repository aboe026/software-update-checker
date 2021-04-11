import E2eHomeUtil from './helpers/e2e-home-util'
import interactiveExecute from './helpers/interactive-execute'

describe('Home', () => {
  it('displays all options to user with add as default selection', async () => {
    await E2eHomeUtil.verifySoftwares(undefined, false)
    const response = await interactiveExecute({
      inputs: [],
    })
    E2eHomeUtil.validatePromptChunks(response.chunks, [
      {
        choice: E2eHomeUtil.CHOICES.Home,
      },
    ])
    await E2eHomeUtil.verifySoftwares(undefined, false)
  })
  it('selecting exit properly exits', async () => {
    await E2eHomeUtil.verifySoftwares(undefined, false)
    const response = await interactiveExecute({
      inputs: E2eHomeUtil.getDefaultOptionInputs(E2eHomeUtil.CHOICES.Home.options.Exit),
    })
    console.log('TEST response: ' + JSON.stringify(response, null, 2))
    E2eHomeUtil.validatePromptChunks(
      response.chunks,
      E2eHomeUtil.getDefaultOptionChunks(E2eHomeUtil.CHOICES.Home.options.Exit)
    )
    await E2eHomeUtil.verifySoftwares(undefined, false)
  })
})
