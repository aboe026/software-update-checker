import Add from '../../src/actions/add/add'
import Delete from '../../src/actions/delete/delete'
import Edit from '../../src/actions/edit/edit'
import Home from '../../src/actions/home/home'
import HomePrompts from '../../src/actions/home/home-prompts'
import View from '../../src/actions/view/view'

describe('Home Unit Tests', () => {
  describe('mainMenu', () => {
    it('exit does not call any other prompt', async () => {
      await testHomePromptSelection(['exit'])
    })
    it('add then exit calls the configure method once then exits', async () => {
      await testHomePromptSelection(['add', 'exit'], {
        configureCalls: 1,
      })
    })
    it('view then exit calls the view method once then exits', async () => {
      await testHomePromptSelection(['view', 'exit'], {
        viewCalls: 1,
      })
    })
    it('edit then exit calls the edit method once then exits', async () => {
      await testHomePromptSelection(['edit', 'exit'], {
        editCalls: 1,
      })
    })
    it('delete then exit calls the delete method once then exits', async () => {
      await testHomePromptSelection(['remove', 'exit'], {
        deleteCalls: 1,
      })
    })
    it('add then add then exit calls the configure method twice then exits', async () => {
      await testHomePromptSelection(['add', 'add', 'exit'], {
        configureCalls: 2,
      })
    })
    it('view then view then exit calls the view method twice then exits', async () => {
      await testHomePromptSelection(['view', 'view', 'exit'], {
        viewCalls: 2,
      })
    })
    it('edit then edit then exit calls the edit method twice then exits', async () => {
      await testHomePromptSelection(['edit', 'edit', 'exit'], {
        editCalls: 2,
      })
    })
    it('delete then delete then exit calls the delete method twice then exits', async () => {
      await testHomePromptSelection(['remove', 'remove', 'exit'], {
        deleteCalls: 2,
      })
    })
    it('all options then exit calls the all methods once then exits', async () => {
      await testHomePromptSelection(['add', 'view', 'edit', 'remove', 'exit'], {
        configureCalls: 1,
        viewCalls: 1,
        editCalls: 1,
        deleteCalls: 1,
      })
    })
    it('all options in scattered order then exit calls the all methods once then exits', async () => {
      await testHomePromptSelection(['remove', 'edit', 'add', 'view', 'exit'], {
        configureCalls: 1,
        viewCalls: 1,
        editCalls: 1,
        deleteCalls: 1,
      })
    })
    it('all options twice through then exit calls the all methods twice then exits', async () => {
      await testHomePromptSelection(['add', 'view', 'edit', 'remove', 'add', 'view', 'edit', 'remove', 'exit'], {
        configureCalls: 2,
        viewCalls: 2,
        editCalls: 2,
        deleteCalls: 2,
      })
    })
  })
})

async function testHomePromptSelection(
  actions: string[],
  {
    configureCalls = 0,
    viewCalls = 0,
    editCalls = 0,
    deleteCalls = 0,
  }: {
    configureCalls?: number
    viewCalls?: number
    editCalls?: number
    deleteCalls?: number
  } = {
    configureCalls: 0,
    viewCalls: 0,
    editCalls: 0,
    deleteCalls: 0,
  }
) {
  const getActionSpy = jest.spyOn(HomePrompts, 'getAction')
  for (const action of actions) {
    getActionSpy.mockResolvedValueOnce(action)
  }
  const configureSpy = jest.spyOn(Add, 'configure').mockResolvedValue()
  const viewSpy = jest.spyOn(View, 'showVersions').mockResolvedValue()
  const editSpy = jest.spyOn(Edit, 'editConfiguration').mockResolvedValue()
  const deleteSpy = jest.spyOn(Delete, 'removeConfiguration').mockResolvedValue()
  await expect(Home.mainMenu()).resolves.toBe(undefined)
  expect(configureSpy.mock.calls.length).toBe(configureCalls)
  expect(viewSpy.mock.calls.length).toBe(viewCalls)
  expect(editSpy.mock.calls.length).toBe(editCalls)
  expect(deleteSpy.mock.calls.length).toBe(deleteCalls)
}
