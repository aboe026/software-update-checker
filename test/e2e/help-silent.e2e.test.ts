import E2eHelpUtil from './helpers/e2e-help-util'
import E2eTestUtil from './helpers/e2e-test-util'

describe('Help Silent', () => {
  describe('root', () => {
    it('help silent shows root help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(),
        expected: E2eHelpUtil.getRootChunks(),
      })
    })
    it('help silent shows root help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(),
        expected: E2eHelpUtil.getRootChunks(),
      })
    })
    it('help silent shows root help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(),
        expected: E2eHelpUtil.getRootChunks(),
      })
    })
  })
  describe('add', () => {
    it('help silent shows add help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['add']),
        expected: E2eHelpUtil.getAddChunks(),
      })
    })
    it('help silent shows add help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['add']),
        expected: E2eHelpUtil.getAddChunks(),
      })
    })
    it('help silent shows add help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['add']),
        expected: E2eHelpUtil.getAddChunks(),
      })
    })
  })
  describe('static', () => {
    it('help silent shows static help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['add', 'static']),
        expected: E2eHelpUtil.getStaticChunks(),
      })
    })
    it('help silent shows static help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['add', 'static']),
        expected: E2eHelpUtil.getStaticChunks(),
      })
    })
    it('help silent shows static help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['add', 'static']),
        expected: E2eHelpUtil.getStaticChunks(),
      })
    })
  })
  describe('dynamic', () => {
    it('help silent shows dynamic help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['add', 'dynamic']),
        expected: E2eHelpUtil.getDynamicChunks(),
      })
    })
    it('help silent shows dynamic help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['add', 'dynamic']),
        expected: E2eHelpUtil.getDynamicChunks(),
      })
    })
    it('help silent shows dynamic help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['add', 'dynamic']),
        expected: E2eHelpUtil.getDynamicChunks(),
      })
    })
  })
  describe('view', () => {
    it('help silent shows view help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['view']),
        expected: E2eHelpUtil.getViewChunks(),
      })
    })
    it('help silent shows view help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['view']),
        expected: E2eHelpUtil.getViewChunks(),
      })
    })
    it('help silent shows view help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['view']),
        expected: E2eHelpUtil.getViewChunks(),
      })
    })
  })
  describe('edit', () => {
    it('help silent shows edit help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['edit']),
        expected: E2eHelpUtil.getEditChunks(),
      })
    })
    it('help silent shows edit help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['edit']),
        expected: E2eHelpUtil.getEditChunks(),
      })
    })
    it('help silent shows edit help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['edit']),
        expected: E2eHelpUtil.getEditChunks(),
      })
    })
  })
  describe('remove', () => {
    it('help silent shows remove help text with command', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getSilentCommand(['remove']),
        expected: E2eHelpUtil.getRemoveChunks(),
      })
    })
    it('help silent shows remove help text with long option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getLongOption(['remove']),
        expected: E2eHelpUtil.getRemoveChunks(),
      })
    })
    it('help silent shows remove help text with short option', async () => {
      await E2eTestUtil.helpSilent({
        args: E2eHelpUtil.getShortOption(['remove']),
        expected: E2eHelpUtil.getRemoveChunks(),
      })
    })
  })
})
