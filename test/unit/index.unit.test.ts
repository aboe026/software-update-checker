import colors from '../../src/util/colors'
import Home from '../../src/actions/home/home'

describe('Index Unit Tests', () => {
  // TODO: for some reason, having both of these files caused the second test to fail
  // something to do wtih isolateModules and "await import" being called twice?
  // https://github.com/facebook/jest/issues/11709
  //
  // it('calls main menu', async () => {
  //   const mainMenuSpy = jest.spyOn(Home, 'mainMenu').mockResolvedValueOnce()
  //   await jest.isolateModules(async () => {
  //     await import('../../src/index')
  //   })
  //   expect(mainMenuSpy.mock.calls).toEqual([[]])
  // })
  it('prints error and exits with unsuccessful code', async () => {
    const error = 'whoopsy daisy'
    const homeSpy = jest.spyOn(Home, 'mainMenu').mockRejectedValueOnce(error)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation()
    await jest.isolateModules(async () => {
      await import('../../src/index')
    })
    await new Promise((resolve) => setTimeout(resolve, 0)) // need explicit sleep here because isolateModules does not await thrown error :/
    expect(homeSpy.mock.calls).toEqual([[]])
    // Not sure why there are 2 errors/exists...
    expect(consoleErrorSpy.mock.calls).toEqual([[error], [colors.red(error)]])
    expect(exitSpy.mock.calls).toEqual([[1], [1]])
  })
})
