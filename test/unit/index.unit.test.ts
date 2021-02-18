import Prompts from '../../src/prompts'
import colors from 'colors'

describe('Index Unit Tests', () => {
  it('calls home prompt', async () => {
    const homeSpy = jest.spyOn(Prompts, 'home').mockResolvedValue()
    await jest.isolateModules(async () => {
      await require('../../src/index')
    })
    expect(homeSpy.mock.calls.length).toBe(1)
  })
  it('prints error and exits with unsuccessful code', async () => {
    const error = 'whoopsy daisy'
    const homeSpy = jest.spyOn(Prompts, 'home').mockRejectedValue(error)
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
    const mockExit = jest.spyOn(process, 'exit').mockImplementation()
    await jest.isolateModules(async () => {
      await require('../../src/index')
    })
    expect(homeSpy.mock.calls.length).toBe(1)
    expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([[colors.red(error)]], null, 2))
    expect(JSON.stringify(mockExit.mock.calls, null, 2)).toBe(JSON.stringify([[1]], null, 2))
  })
})
