import E2eHelpUtil from './helpers/e2e-help-util'
import E2eTestUtil from './helpers/e2e-test-util'

describe('Help Silent', () => {
  describe('root', () => {
    it('help silent shows root help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(),
        expected: await E2eHelpUtil.getRootChunks(),
      })
    })
    it('help silent shows root help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(),
        expected: await E2eHelpUtil.getRootChunks(),
      })
    })
    it('help silent shows root help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(),
        expected: await E2eHelpUtil.getRootChunks(),
      })
    })
  })
  describe('add', () => {
    it('help silent shows add help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['add']),
        expected: await E2eHelpUtil.getAddChunks(),
      })
    })
    it('help silent shows add help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['add']),
        expected: await E2eHelpUtil.getAddChunks(),
      })
    })
    it('help silent shows add help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['add']),
        expected: await E2eHelpUtil.getAddChunks(),
      })
    })
  })
  describe('static', () => {
    it('help silent shows static help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['add', 'static']),
        expected: await E2eHelpUtil.getStaticChunks(),
      })
    })
    it('help silent shows static help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['add', 'static']),
        expected: await E2eHelpUtil.getStaticChunks(),
      })
    })
    it('help silent shows static help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['add', 'static']),
        expected: await E2eHelpUtil.getStaticChunks(),
      })
    })
  })
  describe('dynamic', () => {
    it('help silent shows dynamic help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['add', 'dynamic']),
        expected: await E2eHelpUtil.getDynamicChunks(),
      })
    })
    it('help silent shows dynamic help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['add', 'dynamic']),
        expected: await E2eHelpUtil.getDynamicChunks(),
      })
    })
    it('help silent shows dynamic help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['add', 'dynamic']),
        expected: await E2eHelpUtil.getDynamicChunks(),
      })
    })
  })
  describe('view', () => {
    it('help silent shows view help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['view']),
        expected: await E2eHelpUtil.getViewChunks(),
      })
    })
    it('help silent shows view help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['view']),
        expected: await E2eHelpUtil.getViewChunks(),
      })
    })
    it('help silent shows view help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['view']),
        expected: await E2eHelpUtil.getViewChunks(),
      })
    })
  })
  describe('edit', () => {
    it('help silent shows edit help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['edit']),
        expected: await E2eHelpUtil.getEditChunks(),
      })
    })
    it('help silent shows edit help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['edit']),
        expected: await E2eHelpUtil.getEditChunks(),
      })
    })
    it('help silent shows edit help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['edit']),
        expected: await E2eHelpUtil.getEditChunks(),
      })
    })
  })
  describe('remove', () => {
    it('help silent shows remove help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['remove']),
        expected: await E2eHelpUtil.getRemoveChunks(),
      })
    })
    it('help silent shows remove help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['remove']),
        expected: await E2eHelpUtil.getRemoveChunks(),
      })
    })
    it('help silent shows remove help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['remove']),
        expected: await E2eHelpUtil.getRemoveChunks(),
      })
    })
  })
})
