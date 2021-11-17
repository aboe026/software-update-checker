import Add from '../../src/actions/add/add'
import colors from '../../src/util/colors'
import { CommandType } from '../../src/software/executable'
import Edit, { Inputs as EditInputs } from '../../src/actions/edit/edit'
import Software from '../../src/software/software'
import SoftwareList from '../../src/software/software-list'
import TestUtil, { ExpectedCalls, Response } from '../helpers/test-util'

describe('Edit Unit Tests', () => {
  describe('editConfiguration', () => {
    it('no softwares prints message to add software to edit', async () => {
      await testEditConfiguration({
        input: {
          loadSoftwareListMocks: [{ resolve: [] }],
        },
        output: {
          expected: { resolve: undefined },
          loadSoftwareListCalls: [[]],
          consoleWarnCalls: [[colors.yellow('No softwares to edit. Please add a software to have something to edit.')]],
        },
      })
    })
    it('throws error if getExistingSoftware throws error about no name specified', async () => {
      const name = 'throws error about no name specified edit'
      const software = new Software({
        name,
        shell: 'french',
        executable: {
          command: 'tart',
        },
        args: 'pastry-crust',
        installedRegex: 'eggs',
        url: 'https://breakthefast.com',
        latestRegex: 'quiche',
      })
      const error = 'Must specify existing name when non-interactive'
      await testEditConfiguration({
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
                softwares: [software],
                interactive: false,
              },
            ],
          ],
        },
      })
    })
    it('throws error if getExistingSoftware throws error about name specified not existing', async () => {
      const name = 'throws error about name specified not existing edit'
      const software = new Software({
        name,
        executable: {
          command: 'timespan',
        },
        args: 'years',
        installedRegex: 'bi-centennial',
        url: 'https://50yearslater.com',
        latestRegex: 'jubilee',
      })
      const error = `Invalid existing software "${name}", does not exist.`
      await testEditConfiguration({
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
                softwares: [software],
                interactive: false,
              },
            ],
          ],
        },
      })
    })
    it('throws error if editing dynamic and supply command option without changing type', async () => {
      const name = 'throws error dynamic command option without type'
      const software = new Software({
        name,
        shell: 'dessert',
        directory: 'baked',
        executable: {
          regex: 'cookie',
        },
        args: 'drop',
        installedRegex: 'chocolate chip',
        url: 'https://sidneymonsterdonations.com',
        latestRegex: 'semi sweet morsels',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            executable: {
              command: 'cookie',
            },
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { reject: 'The "--command" option is not compatible with a "dynamic" executable' },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name,
                softwares: [software],
                interactive: false,
              },
            ],
          ],
        },
      })
    })
    it('throws error if editing dynamic and supply command option with dynamic type', async () => {
      const name = 'throws error dynamic command option with dynamic type'
      const software = new Software({
        name,
        shell: 'authors',
        directory: 'genre',
        executable: {
          regex: 'fantasy',
        },
        args: 'high',
        installedRegex: 'Beren',
        url: 'https://fatherofmodernfantasy.com',
        latestRegex: 'John Ronald Reuel Tolkien',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            type: CommandType.Dynamic,
            executable: {
              command: 'fantasy',
            },
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { reject: 'The "--command" option is not compatible with a "dynamic" executable' },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name,
                softwares: [software],
                interactive: false,
              },
            ],
          ],
        },
      })
    })
    it('throws error if editing static and supply regex option without changing type', async () => {
      const name = 'throws error static regex option without type'
      const software = new Software({
        name,
        shell: 'symphony',
        executable: {
          command: 'beethoven',
        },
        args: 'd minor',
        installedRegex: 'no 9',
        url: 'https://befreetosing.com',
        latestRegex: 'ode to joy',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            directory: '',
            executable: {
              regex: 'ludwig van',
            },
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { reject: 'The "--regex" option is not compatible with a "static" executable' },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name,
                softwares: [software],
                interactive: false,
              },
            ],
          ],
        },
      })
    })
    it('throws error if editing static and supply regex option with static type', async () => {
      const name = 'throws error static regex option with static type'
      const software = new Software({
        name,
        shell: 'body',
        executable: {
          command: 'water',
        },
        args: 'salt',
        installedRegex: 'largest',
        url: 'https://peacefulsea.com',
        latestRegex: 'pacific ocean',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            type: CommandType.Static,
            directory: '',
            executable: {
              regex: 'h20',
            },
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { reject: 'The "--regex" option is not compatible with a "static" executable' },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name,
                softwares: [software],
                interactive: false,
              },
            ],
          ],
        },
      })
    })
    it('throws error if changing to static and do not supply command option', async () => {
      const name = 'throws error changing to static without command'
      const software = new Software({
        name,
        shell: 'fictional',
        directory: 'planets',
        executable: {
          regex: 'habited',
        },
        args: 'desert',
        installedRegex: 'dune',
        url: 'https://thespicesmustflow.com',
        latestRegex: 'arrakis',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            type: CommandType.Static,
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { reject: 'The "static" executable type requires a "--command" option to be specified.' },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name,
                softwares: [software],
                interactive: false,
              },
            ],
          ],
        },
      })
    })
    it('throws error if changing to dynamic and do not supply regex option', async () => {
      const name = 'throws error changing to dynamic without regex'
      const software = new Software({
        name,
        shell: 'maritime',
        executable: {
          command: 'fish',
        },
        args: 'male-pregnancy',
        installedRegex: 'seahorse',
        url: 'https://slowandsteadywinstherace.com',
        latestRegex: 'hippocampus',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            type: CommandType.Dynamic,
            directory: 'aquatic',
            executable: {
              regex: '',
            },
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { reject: 'The "dynamic" executable type requires a "--regex" option to be specified.' },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name,
                softwares: [software],
                interactive: false,
              },
            ],
          ],
        },
      })
    })
    it('throws error if changing to dynamic and do not supply executable', async () => {
      const name = 'throws error changing to dynamic without executable'
      const software = new Software({
        name,
        shell: 'hogwarts',
        executable: {
          command: 'wizards',
        },
        args: 'slytherin',
        installedRegex: 'half-blood prince',
        url: 'https://always.com',
        latestRegex: 'Severus Snape',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            type: CommandType.Dynamic,
            directory: 'professor',
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { reject: 'The "dynamic" executable type requires a "--regex" option to be specified.' },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name,
                softwares: [software],
                interactive: false,
              },
            ],
          ],
        },
      })
    })
    it('calls configure with existing software if no inputs and prompt', async () => {
      const name = 'calls configure with existing if not inputs and prompt'
      const software = new Software({
        name,
        shell: 'pastry',
        executable: {
          command: 'donut',
        },
        args: 'cake',
        installedRegex: 'cracks',
        url: 'https://doh.com',
        latestRegex: 'old fashioned',
      })
      await testEditConfiguration({
        input: {
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { resolve: undefined },
          loadSoftwareListCalls: [[]],
          getExistingSoftwareCalls: [
            [
              {
                name: undefined,
                softwares: [software],
                interactive: true,
              },
            ],
          ],
          configureCalls: [
            [
              {
                inputs: undefined,
                existingSoftware: software,
              },
            ],
          ],
        },
      })
    })
    it('can change to static if command option specified', async () => {
      const name = 'change dynamic to static with command'
      const software = new Software({
        name,
        shell: 'aircraft',
        directory: 'reconnaissance',
        executable: {
          regex: 'strategic',
        },
        args: 'lockheed',
        installedRegex: 'blackbird',
        url: 'https://speedcheck.com',
        latestRegex: 'sr-71',
      })
      const inputs = {
        existing: name,
        type: CommandType.Static,
        executable: {
          command: 'sr',
        },
      }
      await testEditConfiguration({
        input: {
          inputs,
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
                softwares: [software],
                interactive: false,
              },
            ],
          ],
          configureCalls: [
            [
              {
                inputs,
                existingSoftware: software,
              },
            ],
          ],
        },
      })
    })
    it('can change to dynamic if regex option specified', async () => {
      const name = 'change static to dynamic with regex'
      const software = new Software({
        name,
        shell: 'star-trek',
        executable: {
          command: 'starship',
        },
        args: 'starfleet',
        installedRegex: 'USS Enterprise',
        url: 'https://toboldlygo.com',
        latestRegex: 'NCC-1701',
      })
      const inputs = {
        existing: name,
        type: CommandType.Dynamic,
        executable: {
          regex: 'interstellar',
        },
      }
      await testEditConfiguration({
        input: {
          inputs,
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
                softwares: [software],
                interactive: false,
              },
            ],
          ],
          configureCalls: [
            [
              {
                inputs,
                existingSoftware: software,
              },
            ],
          ],
        },
      })
    })
    it('all options passed to configure if all specified changing to dynamic', async () => {
      const name = 'all options passed static'
      const software = new Software({
        name,
        shell: 'cocktail',
        executable: {
          command: 'liquer',
        },
        args: 'cream',
        installedRegex: 'caucasian',
        url: 'https://thedudeabides.com',
        latestRegex: 'white russian',
      })
      const inputs = {
        existing: name,
        name: 'all changing dynamic name',
        shell: 'all changing dynamic shell',
        directory: 'coffee',
        type: CommandType.Dynamic,
        executable: {
          regex: 'vodka',
        },
        args: 'all changing dynamic args',
        installedRegex: 'all changing dynamic installedRegex',
        url: 'all changing dynamic url',
        latestRegex: 'all changing dynamic latestRegex',
        interactive: true,
      }
      await testEditConfiguration({
        input: {
          inputs,
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
                softwares: [software],
                interactive: true,
              },
            ],
          ],
          configureCalls: [
            [
              {
                inputs,
                existingSoftware: software,
              },
            ],
          ],
        },
      })
    })
    it('all options passed to configure if all specified changing to static', async () => {
      const name = 'all options passed dynamic'
      const software = new Software({
        name,
        shell: 'children',
        directory: 'film',
        executable: {
          regex: 'hollywood',
        },
        args: 'coming-of-age',
        installedRegex: 'baseball',
        url: 'https://legendsneverdie.com',
        latestRegex: 'the sandlot',
      })
      const inputs = {
        existing: name,
        name: 'all changing static name',
        shell: 'all changing static shell',
        directory: 'all changing static directory',
        type: CommandType.Static,
        executable: {
          command: 'all changing static command',
        },
        args: 'all changing static args',
        installedRegex: 'all changing static installedRegex',
        url: 'all changing static url',
        latestRegex: 'all changing static latestRegex',
        interactive: true,
      }
      await testEditConfiguration({
        input: {
          inputs,
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
                softwares: [software],
                interactive: true,
              },
            ],
          ],
          configureCalls: [
            [
              {
                inputs,
                existingSoftware: software,
              },
            ],
          ],
        },
      })
    })
  })
})

interface TestRemoveConfigurationInput {
  inputs?: EditInputs
  loadSoftwareListMocks?: Response[]
  getExistingSoftwareMocks?: Response[]
}

interface TestRemoveConfigurationOutput {
  expected: Response
  loadSoftwareListCalls?: ExpectedCalls[][]
  getExistingSoftwareCalls?: ExpectedCalls[][]
  configureCalls?: ExpectedCalls[][]
  consoleWarnCalls?: (string[] | undefined)[]
}

async function testEditConfiguration({
  input,
  output,
}: {
  input: TestRemoveConfigurationInput
  output: TestRemoveConfigurationOutput
}): Promise<void> {
  const methodParams: any = {}
  if (input.inputs) {
    methodParams.inputs = input.inputs
  }
  const loadSoftwareListSpy = TestUtil.mockResponses({
    spy: jest.spyOn(SoftwareList, 'load'),
    responses: input.loadSoftwareListMocks,
  })
  const getExistingSoftwareSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Edit, 'getExistingSoftware'),
    responses: input.getExistingSoftwareMocks,
  })
  const configureSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Add, 'configure'),
    responses: [{ resolve: undefined }],
  })
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  if (output.expected.reject) {
    await expect(Edit.editConfiguration(methodParams)).rejects.toThrow(output.expected.reject)
  } else {
    await expect(Edit.editConfiguration(methodParams)).resolves.toEqual(output.expected.resolve)
  }
  expect(loadSoftwareListSpy.mock.calls).toEqual(output.loadSoftwareListCalls || [])
  TestUtil.validateGetExistingSoftwareCalls({
    getExistingSoftwareSpy,
    getExistingSoftwareCalls: output.getExistingSoftwareCalls,
  })
  expect(configureSpy.mock.calls).toEqual(output.configureCalls || [])
  expect(JSON.stringify(consoleWarnSpy.mock.calls, null, 2)).toBe(
    JSON.stringify(output.consoleWarnCalls || [], null, 2)
  )
}
