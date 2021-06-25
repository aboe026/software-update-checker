import E2eHelpUtil from './helpers/e2e-help-util'
import interactiveExecute from './helpers/interactive-execute'

describe('Help Silent', () => {
  describe('root', () => {
    it('help silent shows root help text with command', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getSilentCommand(),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getRootChunks()
      )
    })
    it('help silent shows root help text with long option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getLongOption(),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getRootChunks()
      )
    })
    it('help silent shows root help text with short option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getShortOption(),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getRootChunks()
      )
    })
  })
  describe('add', () => {
    it('help silent shows add help text with command', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getSilentCommand(['add']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getAddChunks()
      )
    })
    it('help silent shows add help text with long option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getLongOption(['add']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getAddChunks()
      )
    })
    it('help silent shows add help text with short option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getShortOption(['add']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getAddChunks()
      )
    })
  })
  describe('static', () => {
    it('help silent shows static help text with command', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getSilentCommand(['add', 'static']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getStaticChunks()
      )
    })
    it('help silent shows static help text with long option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getLongOption(['add', 'static']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getStaticChunks()
      )
    })
    it('help silent shows static help text with short option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getShortOption(['add', 'static']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getStaticChunks()
      )
    })
  })
  describe('dynamic', () => {
    it('help silent shows dynamic help text with command', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getSilentCommand(['add', 'dynamic']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getDynamicChunks()
      )
    })
    it('help silent shows dynamic help text with long option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getLongOption(['add', 'dynamic']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getDynamicChunks()
      )
    })
    it('help silent shows dynamic help text with short option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getShortOption(['add', 'dynamic']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getDynamicChunks()
      )
    })
  })
  describe('view', () => {
    it('help silent shows view help text with command', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getSilentCommand(['view']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getViewChunks()
      )
    })
    it('help silent shows view help text with long option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getLongOption(['view']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getViewChunks()
      )
    })
    it('help silent shows view help text with short option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getShortOption(['view']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getViewChunks()
      )
    })
  })
  describe('edit', () => {
    it('help silent shows edit help text with command', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getSilentCommand(['edit']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getEditChunks()
      )
    })
    it('help silent shows edit help text with long option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getLongOption(['edit']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getEditChunks()
      )
    })
    it('help silent shows edit help text with short option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getShortOption(['edit']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getEditChunks()
      )
    })
  })
  describe('remove', () => {
    it('help silent shows remove help text with command', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getSilentCommand(['remove']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getRemoveChunks()
      )
    })
    it('help silent shows remove help text with long option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getLongOption(['remove']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getRemoveChunks()
      )
    })
    it('help silent shows remove help text with short option', async () => {
      const response = await interactiveExecute({
        args: E2eHelpUtil.getShortOption(['remove']),
      })

      await E2eHelpUtil.validateChunks(
        E2eHelpUtil.splitChunksOnNewline(response.chunks),
        await E2eHelpUtil.getRemoveChunks()
      )
    })
  })
})
