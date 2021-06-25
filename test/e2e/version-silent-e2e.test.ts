import E2eVersionUtil from './helpers/e2e-version-util'
import interactiveExecute from './helpers/interactive-execute'

describe('Version Silent', () => {
  it('version silent shows version with command', async () => {
    await E2eVersionUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eVersionUtil.getSilentCommand(),
        })
      ).chunks,
      await E2eVersionUtil.getChunks()
    )
  })
  it('version silent shows version with long option', async () => {
    await E2eVersionUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eVersionUtil.getLongOption(),
        })
      ).chunks,
      await E2eVersionUtil.getChunks()
    )
  })
  it('version silent shows version with short option', async () => {
    await E2eVersionUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eVersionUtil.getShortOption(),
        })
      ).chunks,
      await E2eVersionUtil.getChunks()
    )
  })
  it('version silent command supersedes help command', async () => {
    await E2eVersionUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eVersionUtil.getSilentCommand(['help']),
        })
      ).chunks,
      await E2eVersionUtil.getChunks()
    )
  })
  it('version silent command supersedes help long option', async () => {
    await E2eVersionUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eVersionUtil.getSilentCommand(['--help']),
        })
      ).chunks,
      await E2eVersionUtil.getChunks()
    )
  })
  it('version silent command supersedes help short option', async () => {
    await E2eVersionUtil.validateChunks(
      (
        await interactiveExecute({
          args: E2eVersionUtil.getSilentCommand(['-h']),
        })
      ).chunks,
      await E2eVersionUtil.getChunks()
    )
  })
})
