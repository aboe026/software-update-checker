import colors from '../../src/colors'
import Home from '../../src/home/home'

describe('Index Unit Tests', () => {
  it('calls main menu', async () => {
    const mainMenuSpy = jest.spyOn(Home, 'mainMenu').mockResolvedValue()
    await jest.isolateModules(async () => {
      await require('../../src/index')
    })
    expect(mainMenuSpy.mock.calls.length).toBe(1)
  })
  it('prints error and exits with unsuccessful code', async () => {
    const error = 'whoopsy daisy'
    const homeSpy = jest.spyOn(Home, 'mainMenu').mockRejectedValue(error)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation()
    await jest.isolateModules(async () => {
      await require('../../src/index')
    })
    await new Promise((resolve) => setTimeout(resolve, 0)) // need explicit sleep here because isolateModules does not await thrown error :/
    expect(homeSpy.mock.calls.length).toBe(1)
    // Not sure why there are 2 errors/exists...
    expect(consoleErrorSpy.mock.calls).toEqual([[error], [colors.red(error)]])
    expect(exitSpy.mock.calls).toEqual([[1], [1]])
  })
})
