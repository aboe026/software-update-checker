import Delete, { Inputs as DeleteInputs } from '../../src/delete/delete'
import DeletePrompts from '../../src/delete/delete-prompts'
import colors from '../../src/colors'
import Software from '../../src/software'
import SoftwareList from '../../src/software-list'
import TestUtil, { ExpectedCalls, Response } from '../helpers/test-util'

describe('Delete Unit Tests', () => {
  describe('removeConfiguration', () => {
    it('no softwares prints message to add software to delete', async () => {
      await testRemoveConfiguration({
        input: {
          loadSoftwareListMocks: [{ resolve: [] }],
        },
        output: {
          expected: { resolve: undefined },
          loadSoftwareListCalls: [[]],
          consoleWarnCalls: [
            [colors.yellow('No softwares to delete. Please add a software to have something to delete.')],
          ],
        },
      })
    })
    it('calls delete with existing and input', async () => {
      const name = 'delete existing input'
      const software = new Software({
        name,
        executable: {
          command: 'justices',
        },
        args: 'scotus',
        installedRegex: 'Notorious R.B.G.',
        url: 'https://onthebasisofsex.com',
        latestRegex: 'Ruth Bader Ginsburg',
      })
      await testRemoveConfiguration({
        input: {
          inputs: {
            existing: name,
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { resolve: undefined },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name,
                prompt: DeletePrompts.getExisting,
                softwares: [software],
                interactive: false,
              },
            ],
          ],
          deleteSoftwareListCalls: [[name]],
        },
      })
    })
    it('calls delete with existing and prompt', async () => {
      const name = 'delete existing prompt'
      const software = new Software({
        name,
        executable: {
          command: 'cyborg',
        },
        args: 'assassin',
        installedRegex: 'terminator',
        url: 'https://skynet.com',
        latestRegex: 'Cyberdyne Systems Model 101 Series 800',
      })
      await testRemoveConfiguration({
        input: {
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
          getDeleteConfirmedMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: undefined },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name: undefined,
                prompt: DeletePrompts.getExisting,
                softwares: [software],
                interactive: true,
              },
            ],
          ],
          getDeleteConfirmedCalls: [[name]],
          deleteSoftwareListCalls: [[name]],
        },
      })
    })
    it('throws error if getExistingSoftware throws error about no name specified', async () => {
      const name = 'throws error about no name specified delete'
      const software = new Software({
        name,
        executable: {
          command: 'candy',
        },
        args: 'hershey',
        shellOverride: 'confection',
        installedRegex: 'caramel',
        url: 'https://failedroundcandies.com',
        latestRegex: 'milk duds',
      })
      const error = 'Must specify existing name when non-interactive'
      await testRemoveConfiguration({
        input: {
          inputs: {
            interactive: false,
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ throw: error }],
        },
        output: {
          expected: { reject: error },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name: undefined,
                prompt: DeletePrompts.getExisting,
                softwares: [software],
                interactive: false,
              },
            ],
          ],
        },
      })
    })
    it('throws error if getExistingSoftware throws error about name specified not existing', async () => {
      const name = 'throws error about name specified not existing delete'
      const software = new Software({
        name,
        executable: {
          command: 'trophy',
        },
        args: 'nfl',
        shellOverride: 'athletic',
        installedRegex: 'superbowl',
        url: 'https://winningistheonlything.com',
        latestRegex: 'Vince Lombardi Trophy',
      })
      const error = `Invalid existing software "${name}", does not exist.`
      await testRemoveConfiguration({
        input: {
          inputs: {
            interactive: false,
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ throw: error }],
        },
        output: {
          expected: { reject: error },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name: undefined,
                prompt: DeletePrompts.getExisting,
                softwares: [software],
                interactive: false,
              },
            ],
          ],
        },
      })
    })
    it('does not call delete if input interactive and deny confirmation', async () => {
      const name = 'no delete existing input interactive deny confirmation'
      const software = new Software({
        name,
        executable: {
          command: 'ball',
        },
        args: 'football',
        shellOverride: 'american',
        installedRegex: 'nfl',
        url: 'https://passthepigskin.com',
        latestRegex: 'the duke',
      })
      await testRemoveConfiguration({
        input: {
          inputs: {
            existing: name,
            interactive: true,
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
          getDeleteConfirmedMocks: [{ resolve: false }],
        },
        output: {
          expected: { resolve: undefined },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name,
                prompt: DeletePrompts.getExisting,
                softwares: [software],
                interactive: true,
              },
            ],
          ],
          getDeleteConfirmedCalls: [[name]],
        },
      })
    })
    it('does not call delete if prompt and deny confirmation', async () => {
      const name = 'no delete existing prompt deny confirmation'
      const software = new Software({
        name,
        executable: {
          command: 'telescope',
        },
        args: 'space',
        installedRegex: 'hst',
        url: 'https://eyeintothecosmos.com',
        latestRegex: 'Hubble Space Telescope',
      })
      await testRemoveConfiguration({
        input: {
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
          getDeleteConfirmedMocks: [{ resolve: false }],
        },
        output: {
          expected: { resolve: undefined },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name: undefined,
                prompt: DeletePrompts.getExisting,
                softwares: [software],
                interactive: true,
              },
            ],
          ],
          getDeleteConfirmedCalls: [[name]],
        },
      })
    })
  })
})

interface TestRemoveConfigurationInput {
  inputs?: DeleteInputs
  loadSoftwareListMocks?: Response[]
  getExistingSoftwareMocks?: Response[]
  getDeleteConfirmedMocks?: Response[]
}

interface TestRemoveConfigurationOutput {
  expected: Response
  loadSoftwareListCalls?: ExpectedCalls[][]
  getExistingSoftwareCalls?: ExpectedCalls[][]
  getDeleteConfirmedCalls?: ExpectedCalls[][]
  deleteSoftwareListCalls?: ExpectedCalls[][]
  consoleWarnCalls?: (string[] | undefined)[]
}

async function testRemoveConfiguration({
  input,
  output,
}: {
  input: TestRemoveConfigurationInput
  output: TestRemoveConfigurationOutput
}): Promise<void> {
  const methodParams: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any
  if (input.inputs) {
    methodParams.inputs = input.inputs
  }
  const loadSoftwareListSpy = TestUtil.mockResponses({
    spy: jest.spyOn(SoftwareList, 'load'),
    responses: input.loadSoftwareListMocks,
  })
  const getExistingSoftwareSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Delete, 'getExistingSoftware'),
    responses: input.getExistingSoftwareMocks,
  })
  const getDeleteConfirmedListSpy = TestUtil.mockResponses({
    spy: jest.spyOn(DeletePrompts, 'getDeleteConfirmed'),
    responses: input.getDeleteConfirmedMocks,
  })
  const deleteSoftwareListSpy = TestUtil.mockResponses({
    spy: jest.spyOn(SoftwareList, 'delete'),
    responses: [{ resolve: undefined }],
  })
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  if (output.expected.reject) {
    await expect(Delete.removeConfiguration(methodParams)).rejects.toThrow(output.expected.reject)
  } else {
    await expect(Delete.removeConfiguration(methodParams)).resolves.toEqual(output.expected.resolve)
  }
  expect(loadSoftwareListSpy.mock.calls).toEqual(output.loadSoftwareListCalls || [])
  TestUtil.validateGetExistingSoftwareCalls({
    getExistingSoftwareSpy,
    getExistingSoftwareCalls: output.getExistingSoftwareCalls,
  })
  expect(getDeleteConfirmedListSpy.mock.calls).toEqual(output.getDeleteConfirmedCalls || [])
  expect(deleteSoftwareListSpy.mock.calls).toEqual(output.deleteSoftwareListCalls || [])
  expect(JSON.stringify(consoleWarnSpy.mock.calls, null, 2)).toBe(
    JSON.stringify(output.consoleWarnCalls || [], null, 2)
  )
}
