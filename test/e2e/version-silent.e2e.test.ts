import E2eTestUtil from './helpers/e2e-test-util'
import E2eVersionUtil from './helpers/e2e-version-util'

describe('Version Silent', () => {
  it('version silent shows version with command', async () => {
    await E2eTestUtil.versionSilent({ args: E2eVersionUtil.getSilentCommand() })
  })
  it('version silent shows version with long option', async () => {
    await E2eTestUtil.versionSilent({ args: E2eVersionUtil.getLongOption() })
  })
  it('version silent shows version with short option', async () => {
    await E2eTestUtil.versionSilent({ args: E2eVersionUtil.getShortOption() })
  })
  it('version silent command supersedes help command', async () => {
    await E2eTestUtil.versionSilent({ args: E2eVersionUtil.getSilentCommand(['help']) })
  })
  it('version silent command supersedes help long option', async () => {
    await E2eTestUtil.versionSilent({ args: E2eVersionUtil.getSilentCommand(['--help']) })
  })
  it('version silent command supersedes help short option', async () => {
    await E2eTestUtil.versionSilent({ args: E2eVersionUtil.getSilentCommand(['-h']) })
  })
})
