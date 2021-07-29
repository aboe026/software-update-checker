import Add from '../../src/add/add'
import colors from '../../src/colors'
import { CommandType } from '../../src/executable'
import Edit, { Inputs as EditInputs } from '../../src/edit/edit'
import Software from '../../src/software'
import SoftwareList from '../../src/software-list'
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
        executable: {
          command: 'tart',
        },
        args: 'pastry-crust',
        shellOverride: 'french',
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
        executable: {
          directory: 'baked',
          regex: 'cookie',
        },
        args: 'drop',
        shellOverride: 'dessert',
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
        executable: {
          directory: 'genre',
          regex: 'fantasy',
        },
        args: 'high',
        shellOverride: 'authors',
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
    it('throws error if editing static and supply directory option without changing type', async () => {
      const name = 'throws error static directory option without type'
      const software = new Software({
        name,
        executable: {
          command: 'inventor',
        },
        args: 'male',
        shellOverride: 'swedish',
        installedRegex: 'dynamite',
        url: 'https://redifinedlegacy.com',
        latestRegex: 'Alfred Bernhard Nobel',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            executable: {
              directory: 'scientist',
              regex: '',
            },
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { reject: 'The "--directory" option is not compatible with a "static" executable' },
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
    it('throws error if editing static and supply directory option with static type', async () => {
      const name = 'throws error static directory option with static type'
      const software = new Software({
        name,
        executable: {
          command: 'wizards',
        },
        args: 'slytherin',
        shellOverride: 'hogwarts',
        installedRegex: 'half-blood prince',
        url: 'https://always.com',
        latestRegex: 'Severus Snape',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            type: CommandType.Static,
            executable: {
              directory: 'non-muggles',
              regex: '',
            },
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { reject: 'The "--directory" option is not compatible with a "static" executable' },
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
        executable: {
          command: 'beethoven',
        },
        args: 'd minor',
        shellOverride: 'symphony',
        installedRegex: 'no 9',
        url: 'https://befreetosing.com',
        latestRegex: 'ode to joy',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            executable: {
              directory: '',
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
        executable: {
          command: 'water',
        },
        args: 'salt',
        shellOverride: 'body',
        installedRegex: 'largest',
        url: 'https://peacefulsea.com',
        latestRegex: 'pacific ocean',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            type: CommandType.Static,
            executable: {
              directory: '',
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
        executable: {
          directory: 'planets',
          regex: 'habited',
        },
        args: 'desert',
        shellOverride: 'fictional',
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
    it('throws error if changing to dynamic and do not supply directory option', async () => {
      const name = 'throws error changing to dynamic without directory'
      const software = new Software({
        name,
        executable: {
          command: 'bread',
        },
        args: 'flat',
        shellOverride: 'grain',
        installedRegex: 'potatoes',
        url: 'https://norwegiantortilla.com',
        latestRegex: 'lefse',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            type: CommandType.Dynamic,
          },
          loadSoftwareListMocks: [{ resolve: [software] }],
          getExistingSoftwareMocks: [{ resolve: software }],
        },
        output: {
          expected: { reject: 'The "dynamic" executable type requires a "--directory" option to be specified.' },
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
        executable: {
          command: 'fish',
        },
        args: 'male-pregnancy',
        shellOverride: 'maritime',
        installedRegex: 'seahorse',
        url: 'https://slowandsteadywinstherace.com',
        latestRegex: 'hippocampus',
      })
      await testEditConfiguration({
        input: {
          inputs: {
            existing: name,
            type: CommandType.Dynamic,
            executable: {
              directory: 'aquatic',
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
    it('calls configure with existing software if no inputs and prompt', async () => {
      const name = 'calls configure with existing if not inputs and prompt'
      const software = new Software({
        name,
        executable: {
          command: 'donut',
        },
        args: 'cake',
        shellOverride: 'pastry',
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
        executable: {
          directory: 'reconnaissance',
          regex: 'strategic',
        },
        args: 'lockheed',
        shellOverride: 'aircraft',
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
    it('can change to dynamic if directory and regex options specified', async () => {
      const name = 'change static to dynamic with directory and regex'
      const software = new Software({
        name,
        executable: {
          command: 'starship',
        },
        args: 'starfleet',
        shellOverride: 'star-trek',
        installedRegex: 'USS Enterprise',
        url: 'https://toboldlygo.com',
        latestRegex: 'NCC-1701',
      })
      const inputs = {
        existing: name,
        type: CommandType.Dynamic,
        executable: {
          directory: 'vehicle',
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
        executable: {
          command: 'liquer',
        },
        args: 'cream',
        shellOverride: 'cocktail',
        installedRegex: 'caucasian',
        url: 'https://thedudeabides.com',
        latestRegex: 'white russian',
      })
      const inputs = {
        existing: name,
        type: CommandType.Dynamic,
        executable: {
          directory: 'coffee',
          regex: 'vodka',
        },
        name: 'all changing dynamic name',
        args: 'all changing dynamic args',
        shellOverride: 'all changing dynamic shellOverride',
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
        executable: {
          directory: 'film',
          regex: 'hollywood',
        },
        args: 'coming-of-age',
        shellOverride: 'children',
        installedRegex: 'baseball',
        url: 'https://legendsneverdie.com',
        latestRegex: 'the sandlot',
      })
      const inputs = {
        existing: name,
        type: CommandType.Static,
        executable: {
          command: 'all changing static command',
        },
        name: 'all changing static name',
        args: 'all changing static args',
        shellOverride: 'all changing static shellOverride',
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
  getExistingSoftwareCalls?: ExpectedCalls[][] // TODO: see if other instances of ExpectedCalls[] should have double array instead...
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
  const methodParams: any = {} // eslint-disable-line @typescript-eslint/no-explicit-any
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
