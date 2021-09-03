import colors from '../../src/util/colors'

import Add, { Inputs as AddInputs } from '../../src/actions/add/add'
import AddPrompts from '../../src/actions/add/add-prompts'
import { Dynamic, Static } from '../../src/software/executable'
import * as executable from '../../src/software/executable'
import Software from '../../src/software/software'
import SoftwareList from '../../src/software/software-list'
import TestUtil, { ExpectedCalls, Response } from '../helpers/test-util'

describe('Add Unit Tests', () => {
  describe('configure', () => {
    it('does not configure latest if no installed version', async () => {
      const name = 'no installed version'
      const inputs = { name }
      await testConfigure({
        input: {
          inputs,
          getNameMocks: [{ resolve: name }],
          configureInstalledVersionMocks: [{ resolve: undefined }],
        },
        output: {
          getNameCalls: [
            [
              {
                inputs,
                existingName: undefined,
              },
            ],
          ],
          configureInstalledVersionCalls: [
            [
              {
                inputs,
                existingExecutable: undefined,
                existingArgs: undefined,
                existingShell: undefined,
                existingInstalledRegex: undefined,
              },
            ],
          ],
        },
      })
    })
    it('does not save software if no latest version', async () => {
      const name = 'no latest version'
      const command = 'spaghetti'
      const installedRegex = 'meatballs'
      const inputs = {
        name,
        executable: {
          command,
        },
        installedRegex,
      }
      await testConfigure({
        input: {
          inputs,
          getNameMocks: [{ resolve: name }],
          configureInstalledVersionMocks: [
            {
              resolve: {
                executable: {
                  command,
                },
                installedRegex,
              },
            },
          ],
          configureLatestVersionMocks: [{ resolve: undefined }],
        },
        output: {
          getNameCalls: [
            [
              {
                inputs,
                existingName: undefined,
              },
            ],
          ],
          configureInstalledVersionCalls: [
            [
              {
                inputs,
                existingExecutable: undefined,
                existingArgs: undefined,
                existingShell: undefined,
                existingInstalledRegex: undefined,
              },
            ],
          ],
          configureLatestVersionCalls: [
            [
              {
                inputs,
                existingUrl: undefined,
                existingLatestRegex: undefined,
              },
            ],
          ],
        },
      })
    })
    it('adds new software if latest version and no existing', async () => {
      const software = new Software({
        name: 'adds if latest version and no existing',
        executable: {
          command: 'puzzle',
        },
        args: 'combination',
        shell: '3d',
        installedRegex: 'white|red|blue|orange|green|yellow',
        url: 'https://3by3by3solveme.com',
        latestRegex: "Rubik's Cube",
      })
      await testConfigure({
        input: {
          inputs: software,
          getNameMocks: [{ resolve: software.name }],
          configureInstalledVersionMocks: [
            {
              resolve: {
                executable: software.executable,
                args: software.args,
                shell: software.shell,
                installedRegex: software.installedRegex,
              },
            },
          ],
          configureLatestVersionMocks: [
            {
              resolve: {
                url: software.url,
                latestRegex: software.latestRegex,
              },
            },
          ],
          addMocks: [{ resolve: [software] }],
        },
        output: {
          getNameCalls: [
            [
              {
                inputs: software,
                existingName: undefined,
              },
            ],
          ],
          configureInstalledVersionCalls: [
            [
              {
                inputs: software,
                existingExecutable: undefined,
                existingArgs: undefined,
                existingShell: undefined,
                existingInstalledRegex: undefined,
              },
            ],
          ],
          configureLatestVersionCalls: [
            [
              {
                inputs: software,
                existingUrl: undefined,
                existingLatestRegex: undefined,
              },
            ],
          ],
          addCalls: [[software]],
        },
      })
    })
    it('edits existing software if latest version', async () => {
      const software = new Software({
        name: 'edits if latest version and existing',
        executable: {
          command: 'snl',
        },
        args: 'cast',
        shell: 'movies',
        installedRegex: 'matt foley',
        url: 'https://livininavandownbytheriver.com',
        latestRegex: 'chris farley',
      })
      const existing = new Software({
        name: 'edits if latest version and existing existing',
        executable: {
          command: 'comedy',
        },
        args: 'musician',
        shell: 'movie',
        installedRegex: 'joliet jake blues',
        url: 'https://ihateillinoisnazis.com',
        latestRegex: 'john belushi',
      })
      await testConfigure({
        input: {
          inputs: software,
          existingSoftware: existing,
          getNameMocks: [{ resolve: software.name }],
          configureInstalledVersionMocks: [
            {
              resolve: {
                executable: software.executable,
                args: software.args,
                shell: software.shell,
                installedRegex: software.installedRegex,
              },
            },
          ],
          configureLatestVersionMocks: [
            {
              resolve: {
                url: software.url,
                latestRegex: software.latestRegex,
              },
            },
          ],
          editMocks: [{ resolve: [software] }],
        },
        output: {
          getNameCalls: [
            [
              {
                inputs: software,
                existingName: existing.name,
              },
            ],
          ],
          configureInstalledVersionCalls: [
            [
              {
                inputs: software,
                existingExecutable: existing.executable,
                existingArgs: existing.args,
                existingShell: existing.shell,
                existingInstalledRegex: existing.installedRegex,
              },
            ],
          ],
          configureLatestVersionCalls: [
            [
              {
                inputs: software,
                existingUrl: existing.url,
                existingLatestRegex: existing.latestRegex,
              },
            ],
          ],
          editCalls: [[existing, software]],
        },
      })
    })
  })
  describe('isNameDuplicate', () => {
    it('returns false if new name does not equal potential conflict name without existing', () => {
      expect(
        Add.isNameDuplicate({
          newName: 'foo',
          potentialConflictName: 'bar',
        })
      ).toBe(false)
    })
    it('returns false if new name does not equal potential conflict name or existing', () => {
      expect(
        Add.isNameDuplicate({
          newName: 'foo',
          potentialConflictName: 'bar',
          existingName: 'hello',
        })
      ).toBe(false)
    })
    it('returns false if new name does not equal potential conflict name but does equal existing', () => {
      expect(
        Add.isNameDuplicate({
          newName: 'foo',
          potentialConflictName: 'bar',
          existingName: 'foo',
        })
      ).toBe(false)
    })
    it('returns false if new name equals potential conflict name and existing', () => {
      expect(
        Add.isNameDuplicate({
          newName: 'foo',
          potentialConflictName: 'foo',
          existingName: 'foo',
        })
      ).toBe(false)
    })
    it('returns true if new name equals potential conflict name without existing', () => {
      expect(
        Add.isNameDuplicate({
          newName: 'foo',
          potentialConflictName: 'foo',
        })
      ).toBe(true)
    })
    it('returns true if new name equals potential conflict name with mismatching existing', () => {
      expect(
        Add.isNameDuplicate({
          newName: 'foo',
          potentialConflictName: 'foo',
          existingName: 'bar',
        })
      ).toBe(true)
    })
  })
  describe('getName', () => {
    it('returns name if name input', async () => {
      const name = 'name input'
      await testGetName({
        input: {
          inputs: {
            name,
          },
          loadSoftwareListMocks: [{ resolve: [] }],
        },
        output: {
          expected: {
            resolve: name,
          },
          loadSoftwareListCalls: [[]],
        },
      })
    })
    it('returns name if no name input and existing name', async () => {
      const name = 'no name input and existing'
      await testGetName({
        input: {
          inputs: {
            args: 'cheerios',
          },
          existingName: name,
          loadSoftwareListMocks: [{ resolve: [] }],
        },
        output: {
          expected: {
            resolve: name,
          },
          loadSoftwareListCalls: [[]],
        },
      })
    })
    it('throws error if no name input and no existing name', async () => {
      await testGetName({
        input: {
          inputs: {
            interactive: false,
          },
          loadSoftwareListMocks: [{ resolve: [] }],
        },
        output: {
          expected: {
            reject: 'Option "name" must be non-empty string',
          },
          loadSoftwareListCalls: [[]],
        },
      })
    })
    it('returns name if no name input and prompts for name', async () => {
      const name = 'no name input and prompt'
      await testGetName({
        input: {
          loadSoftwareListMocks: [{ resolve: [] }],
          getNameMocks: [{ resolve: name }],
        },
        output: {
          expected: {
            resolve: name,
          },
          loadSoftwareListCalls: [[]],
          getNameCalls: [[undefined]],
        },
      })
    })
    it('name duplicate from inputs can be reconfigured with prompts', async () => {
      const name = 'name duplicate from inputs reconfigured with prompts'
      const existingName = 'name duplicate from inputs reconfigured with prompts existing'
      const softwares = [
        new Software({
          name: existingName,
          executable: {
            command: 'juice',
          },
          installedRegex: 'orange',
          url: 'https://pulpnonfiction.com',
          latestRegex: 'vitamin c',
        }),
      ]
      await testGetName({
        input: {
          inputs: {
            name: existingName,
            interactive: true,
          },
          loadSoftwareListMocks: [
            {
              resolve: softwares,
            },
            {
              resolve: softwares,
            },
          ],
          getNameMocks: [{ resolve: name }],
          isNameDuplicateMocks: [{ value: true }, { value: false }],
        },
        output: {
          expected: {
            resolve: name,
          },
          loadSoftwareListCalls: [[], []],
          getNameCalls: [[undefined]],
          isNameDuplicateCalls: [
            [
              {
                newName: existingName,
                potentialConflictName: existingName,
                existingName: undefined,
              },
            ],
            [
              {
                newName: name,
                potentialConflictName: existingName,
                existingName: undefined,
              },
            ],
          ],
          consoleErrorCalls: [[colors.red(`Invalid name "${existingName}", already in use.`)]],
        },
      })
    })
    it('name duplicate from prompts can be reconfigured with prompts', async () => {
      const name = 'name duplicate from prompts reconfigured with prompts'
      const existingName = 'name duplicate from prompts reconfigured with prompts existing'
      const softwares = [
        new Software({
          name: existingName,
          executable: {
            command: 'gorge',
          },
          installedRegex: 'longest',
          url: 'https://coloradorivercarving.com',
          latestRegex: 'grand canyon',
        }),
      ]
      await testGetName({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: softwares,
            },
            {
              resolve: softwares,
            },
          ],
          getNameMocks: [{ resolve: existingName }, { resolve: name }],
          isNameDuplicateMocks: [{ value: true }, { value: false }],
        },
        output: {
          expected: {
            resolve: name,
          },
          loadSoftwareListCalls: [[], []],
          getNameCalls: [[undefined], [undefined]],
          isNameDuplicateCalls: [
            [
              {
                newName: existingName,
                potentialConflictName: existingName,
                existingName: undefined,
              },
            ],
            [
              {
                newName: name,
                potentialConflictName: existingName,
                existingName: undefined,
              },
            ],
          ],
          consoleErrorCalls: [[colors.red(`Invalid name "${existingName}", already in use.`)]],
        },
      })
    })
    it('throws error if duplicate name and non-interactive', async () => {
      const existingName = 'duplicate name and non-interactive'
      await testGetName({
        input: {
          inputs: {
            name: existingName,
          },
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name: existingName,
                  executable: {
                    command: '',
                  },
                  installedRegex: '',
                  url: '',
                  latestRegex: '',
                }),
              ],
            },
          ],
          isNameDuplicateMocks: [{ value: true }],
        },
        output: {
          expected: {
            reject: `Invalid name "${existingName}", already in use.`,
          },
          loadSoftwareListCalls: [[]],
          isNameDuplicateCalls: [
            [
              {
                newName: existingName,
                potentialConflictName: existingName,
                existingName: undefined,
              },
            ],
          ],
        },
      })
    })
    it('throws error if duplicate name first of multiple and non-interactive', async () => {
      const existingName = 'duplicate name first of multiple and non-interactive'
      await testGetName({
        input: {
          inputs: {
            name: existingName,
          },
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name: existingName,
                  executable: {
                    command: 'cane',
                  },
                  installedRegex: 'candy',
                  url: 'https://sugarsticks.com',
                  latestRegex: 'peppermint stick',
                }),
                new Software({
                  name: 'duplicate name first of multiple and non-interactive last',
                  executable: {
                    command: 'capital',
                  },
                  installedRegex: 'usa',
                  url: 'https://federalcity.com',
                  latestRegex: 'washington, d.c.',
                }),
              ],
            },
          ],
          isNameDuplicateMocks: [{ value: true }],
        },
        output: {
          expected: {
            reject: `Invalid name "${existingName}", already in use.`,
          },
          loadSoftwareListCalls: [[]],
          isNameDuplicateCalls: [
            [
              {
                newName: existingName,
                potentialConflictName: existingName,
                existingName: undefined,
              },
            ],
          ],
        },
      })
    })
    it('throws error if duplicate name last of multiple and non-interactive', async () => {
      const existingName = 'duplicate name last of multiple and non-interactive'
      const softwares = [
        new Software({
          name: 'duplicate name last of multiple and non-interactive first',
          executable: {
            command: 'coin',
          },
          installedRegex: 'cent',
          url: 'https://copperhead.com',
          latestRegex: 'penny',
        }),
        new Software({
          name: existingName,
          executable: {
            command: 'spice',
          },
          installedRegex: 'bark',
          url: 'https://fallaromas.com',
          latestRegex: 'cinnamon',
        }),
      ]
      await testGetName({
        input: {
          inputs: {
            name: existingName,
          },
          loadSoftwareListMocks: [
            {
              resolve: softwares,
            },
          ],
          isNameDuplicateMocks: [{ value: false }, { value: true }],
        },
        output: {
          expected: {
            reject: `Invalid name "${existingName}", already in use.`,
          },
          loadSoftwareListCalls: [[]],
          isNameDuplicateCalls: [
            [
              {
                newName: existingName,
                potentialConflictName: softwares[0].name,
                existingName: undefined,
              },
            ],
            [
              {
                newName: existingName,
                potentialConflictName: existingName,
                existingName: undefined,
              },
            ],
          ],
        },
      })
    })
  })
  describe('configureInstalledVersion', () => {
    it('returns undefined if configureExecutable returns undefined', async () => {
      await testConfigureInstalledVersion({
        input: {
          configureExecutableMocks: [{ resolve: undefined }],
        },
        output: {
          expected: {
            resolve: undefined,
          },
          configureExecutableCalls: [[{ existingExecutable: undefined, inputs: undefined }]],
        },
      })
    })
    it('returns installed version if required inputs', async () => {
      const description = 'required inputs'
      const executable = {
        command: `${description} executable`,
      }
      const installedRegex = `${description} installedRegex`
      const installedVersion = `${description} installed version`
      const inputs = {
        executable,
        installedRegex,
      }
      await testConfigureInstalledVersion({
        input: {
          inputs,
          configureExecutableMocks: [{ resolve: executable }],
          getInstalledVersionMocks: [{ resolve: installedVersion }],
        },
        output: {
          expected: {
            resolve: {
              executable,
              args: '',
              shell: '',
              installedRegex,
            },
          },
          configureExecutableCalls: [
            [
              {
                existingExecutable: undefined,
                inputs,
              },
            ],
          ],
          getInstalledVersionCalls: [[]],
          consoleLogCalls: [[`Installed version: "${installedVersion}"`]],
        },
      })
    })
    it('returns installed version if no inputs and existing required', async () => {
      const description = 'no inputs and existing required'
      const executable = {
        command: `${description} executable`,
      }
      const installedRegex = `${description} installedRegex`
      const installedVersion = `${description} installed version`
      const inputs = {
        interactive: false,
      }
      await testConfigureInstalledVersion({
        input: {
          inputs,
          existingExecutable: executable,
          existingInstalledRegex: installedRegex,
          configureExecutableMocks: [{ resolve: executable }],
          getInstalledVersionMocks: [{ resolve: installedVersion }],
        },
        output: {
          expected: {
            resolve: {
              executable,
              args: '',
              shell: '',
              installedRegex,
            },
          },
          configureExecutableCalls: [
            [
              {
                existingExecutable: executable,
                inputs,
              },
            ],
          ],
          getInstalledVersionCalls: [[]],
          consoleLogCalls: [[`Installed version: "${installedVersion}"`]],
        },
      })
    })
    it('throws error if no required inputs and no existing', async () => {
      const description = 'no required inputs and no existing'
      const executable = {
        command: `${description} executable`,
      }
      const inputs = {
        interactive: false,
      }
      await testConfigureInstalledVersion({
        input: {
          inputs,
          configureExecutableMocks: [{ resolve: executable }],
        },
        output: {
          expected: { reject: 'Option "installedRegex" must be non-empty string' },
          configureExecutableCalls: [
            [
              {
                existingExecutable: undefined,
                inputs,
              },
            ],
          ],
        },
      })
    })
    it('returns installed version if no required inputs and prompts for required inputs', async () => {
      const description = 'no required inputs and prompts required'
      const executable = {
        command: `${description} executable`,
      }
      const args = ''
      const shell = ''
      const installedRegex = `${description} installedRegex`
      const installedVersion = `${description} installed version`
      const inputs = {
        interactive: true,
      }
      await testConfigureInstalledVersion({
        input: {
          inputs,
          configureExecutableMocks: [{ resolve: executable }],
          getArgsMocks: [{ resolve: args }],
          getshellMocks: [{ resolve: shell }],
          getInstalledRegexMocks: [{ resolve: installedRegex }],
          getInstalledVersionMocks: [{ resolve: installedVersion }],
          getVersionCorrectMocks: [{ resolve: true }],
        },
        output: {
          expected: {
            resolve: {
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          configureExecutableCalls: [
            [
              {
                existingExecutable: undefined,
                inputs,
              },
            ],
          ],
          getArgsCalls: [[undefined]],
          getshellCalls: [[undefined]],
          getInstalledRegexCalls: [[undefined]],
          getInstalledVersionCalls: [[]],
          getVersionCorrectCalls: [[]],
          consoleLogCalls: [[`Installed version: "${installedVersion}"`]],
        },
      })
    })
    it('installed version incorrect from required inputs can be reconfigured with prompts', async () => {
      const description = 'installed version incorrect from required inputs reconfigured with prompts'
      const executable = {
        command: `${description} executable`,
      }
      const args = ''
      const shell = ''
      const installedRegex = `${description} installedRegex`
      const installedVersionInitial = `${description} installed version initial`
      const installedVersionReconfigured = `${description} installed version reconfigured`
      const inputs = {
        executable,
        installedRegex,
        interactive: true,
      }
      await testConfigureInstalledVersion({
        input: {
          inputs,
          configureExecutableMocks: [{ resolve: executable }, { resolve: executable }],
          getArgsMocks: [{ resolve: args }, { resolve: args }],
          getshellMocks: [{ resolve: shell }, { resolve: shell }],
          getInstalledRegexMocks: [{ resolve: installedRegex }],
          getInstalledVersionMocks: [{ resolve: installedVersionInitial }, { resolve: installedVersionReconfigured }],
          getVersionCorrectMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: {
            resolve: {
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          configureExecutableCalls: [
            [
              {
                existingExecutable: undefined,
                inputs,
              },
            ],
            [
              {
                existingExecutable: executable,
                inputs: undefined,
              },
            ],
          ],
          getArgsCalls: [[undefined], [args]],
          getshellCalls: [[undefined], [shell]],
          getInstalledRegexCalls: [[installedRegex]],
          getInstalledVersionCalls: [[], []],
          getVersionCorrectCalls: [[], []],
          consoleLogCalls: [
            [`Installed version: "${installedVersionInitial}"`],
            [`Installed version: "${installedVersionReconfigured}"`],
          ],
        },
      })
    })
    it('installed version incorrect from required prompts can be reconfigured with prompts', async () => {
      const description = 'installed version incorrect from required prompts reconfigured with prompts'
      const executable = {
        command: `${description} executable`,
      }
      const args = ''
      const shell = ''
      const installedRegex = `${description} installedRegex`
      const installedVersionInitial = `${description} installed version initial`
      const installedVersionReconfigured = `${description} installed version reconfigured`
      await testConfigureInstalledVersion({
        input: {
          configureExecutableMocks: [{ resolve: executable }, { resolve: executable }],
          getArgsMocks: [{ resolve: args }, { resolve: args }],
          getshellMocks: [{ resolve: shell }, { resolve: shell }],
          getInstalledRegexMocks: [{ resolve: installedRegex }, { resolve: installedRegex }],
          getInstalledVersionMocks: [{ resolve: installedVersionInitial }, { resolve: installedVersionReconfigured }],
          getVersionCorrectMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: {
            resolve: {
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          configureExecutableCalls: [
            [
              {
                existingExecutable: undefined,
                inputs: undefined,
              },
            ],
            [
              {
                existingExecutable: executable,
                inputs: undefined,
              },
            ],
          ],
          getArgsCalls: [[undefined], [args]],
          getshellCalls: [[undefined], [shell]],
          getInstalledRegexCalls: [[undefined], [installedRegex]],
          getInstalledVersionCalls: [[], []],
          getVersionCorrectCalls: [[], []],
          consoleLogCalls: [
            [`Installed version: "${installedVersionInitial}"`],
            [`Installed version: "${installedVersionReconfigured}"`],
          ],
        },
      })
    })
    it('installed version error from required inputs can be reconfigured with prompts', async () => {
      const description = 'installed version error from required inputs reconfigured with prompts'
      const executable = {
        command: `${description} executable`,
      }
      const args = ''
      const shell = ''
      const installedRegex = `${description} installedRegex`
      const installedError = `${description} installed error`
      const installedVersion = `${description} installed version`
      const inputs = {
        executable,
        installedRegex,
        interactive: true,
      }
      await testConfigureInstalledVersion({
        input: {
          inputs,
          configureExecutableMocks: [{ resolve: executable }, { resolve: executable }],
          getArgsMocks: [{ resolve: args }, { resolve: args }],
          getshellMocks: [{ resolve: shell }, { resolve: shell }],
          getInstalledRegexMocks: [{ resolve: installedRegex }],
          getInstalledVersionMocks: [{ reject: installedError }, { resolve: installedVersion }],
          getVersionCorrectMocks: [{ resolve: true }],
          getReattemptVersionMocks: [{ resolve: true }],
        },
        output: {
          expected: {
            resolve: {
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          configureExecutableCalls: [
            [
              {
                existingExecutable: undefined,
                inputs,
              },
            ],
            [
              {
                existingExecutable: executable,
                inputs: undefined,
              },
            ],
          ],
          getArgsCalls: [[undefined], [args]],
          getshellCalls: [[undefined], [shell]],
          getInstalledRegexCalls: [[installedRegex]],
          getInstalledVersionCalls: [[], []],
          getVersionCorrectCalls: [[]],
          getReattemptVersionCalls: [[]],
          consoleLogCalls: [[`Installed version: "${installedVersion}"`]],
          consoleErrorCalls: [[colors.red(installedError)]],
        },
      })
    })
    it('installed version error from required prompts can be reconfigured with prompts', async () => {
      const description = 'installed version error from required prompts reconfigured with prompts'
      const executable = {
        command: `${description} executable`,
      }
      const args = ''
      const shell = ''
      const installedRegex = `${description} installedRegex`
      const installedError = `${description} installed error`
      const installedVersion = `${description} installed version`
      await testConfigureInstalledVersion({
        input: {
          configureExecutableMocks: [{ resolve: executable }, { resolve: executable }],
          getArgsMocks: [{ resolve: args }, { resolve: args }],
          getshellMocks: [{ resolve: shell }, { resolve: shell }],
          getInstalledRegexMocks: [{ resolve: installedRegex }, { resolve: installedRegex }],
          getInstalledVersionMocks: [{ reject: installedError }, { resolve: installedVersion }],
          getVersionCorrectMocks: [{ resolve: true }],
          getReattemptVersionMocks: [{ resolve: true }],
        },
        output: {
          expected: {
            resolve: {
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          configureExecutableCalls: [
            [
              {
                existingExecutable: undefined,
                inputs: undefined,
              },
            ],
            [
              {
                existingExecutable: executable,
                inputs: undefined,
              },
            ],
          ],
          getArgsCalls: [[undefined], [args]],
          getshellCalls: [[undefined], [shell]],
          getInstalledRegexCalls: [[undefined], [installedRegex]],
          getInstalledVersionCalls: [[], []],
          getVersionCorrectCalls: [[]],
          getReattemptVersionCalls: [[]],
          consoleLogCalls: [[`Installed version: "${installedVersion}"`]],
          consoleErrorCalls: [[colors.red(installedError)]],
        },
      })
    })
    it('throws error if installed version error and non-interactive', async () => {
      const description = 'installed version error non-interactive'
      const executable = {
        command: `${description} executable`,
      }
      const installedRegex = `${description} installedRegex`
      const installedError = `${description} installed error`
      const inputs = {
        executable,
        installedRegex,
        interactive: false,
      }
      await testConfigureInstalledVersion({
        input: {
          inputs,
          configureExecutableMocks: [{ resolve: executable }],
          getInstalledRegexMocks: [{ resolve: installedRegex }],
          getInstalledVersionMocks: [{ reject: installedError }],
        },
        output: {
          expected: { reject: `Could not determine installed version: ${installedError}` },
          configureExecutableCalls: [
            [
              {
                existingExecutable: undefined,
                inputs,
              },
            ],
          ],
          getInstalledVersionCalls: [[]],
        },
      })
    })
    it('returns undefined if installed version error from required prompts and no reconfigure', async () => {
      const description = 'installed version error from required prompts no reconfigure'
      const executable = {
        command: `${description} executable`,
      }
      const args = ''
      const shell = ''
      const installedRegex = `${description} installedRegex`
      const installedError = `${description} installed error`
      await testConfigureInstalledVersion({
        input: {
          configureExecutableMocks: [{ resolve: executable }],
          getArgsMocks: [{ resolve: args }, { resolve: args }],
          getshellMocks: [{ resolve: shell }],
          getInstalledRegexMocks: [{ resolve: installedRegex }],
          getInstalledVersionMocks: [{ reject: installedError }],
          getReattemptVersionMocks: [{ resolve: false }],
        },
        output: {
          expected: { resolve: undefined },
          configureExecutableCalls: [
            [
              {
                existingExecutable: undefined,
                inputs: undefined,
              },
            ],
          ],
          getArgsCalls: [[undefined]],
          getshellCalls: [[undefined]],
          getInstalledRegexCalls: [[undefined]],
          getInstalledVersionCalls: [[]],
          getReattemptVersionCalls: [[]],
          consoleErrorCalls: [[colors.red(installedError)]],
        },
      })
    })
    it('returns installed version if optional inputs', async () => {
      const description = 'optional inputs'
      const executable = {
        command: `${description} executable`,
      }
      const args = `${description} args`
      const shell = `${description} shell`
      const installedRegex = `${description} installedRegex`
      const installedVersion = `${description} installed version`
      const inputs = {
        executable,
        args,
        shell,
        installedRegex,
      }
      await testConfigureInstalledVersion({
        input: {
          inputs,
          configureExecutableMocks: [{ resolve: executable }],
          getInstalledVersionMocks: [{ resolve: installedVersion }],
        },
        output: {
          expected: {
            resolve: {
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          configureExecutableCalls: [
            [
              {
                existingExecutable: undefined,
                inputs,
              },
            ],
          ],
          getInstalledVersionCalls: [[]],
          consoleLogCalls: [[`Installed version: "${installedVersion}"`]],
        },
      })
    })
    it('returns installed version if no inputs and prompts for optional inputs', async () => {
      const description = 'no inputs and prompts optional'
      const executable = {
        command: `${description} executable`,
      }
      const args = `${description} args`
      const shell = `${description} shell`
      const installedRegex = `${description} installedRegex`
      const installedVersion = `${description} installed version`
      const inputs = {
        interactive: true,
      }
      await testConfigureInstalledVersion({
        input: {
          inputs,
          configureExecutableMocks: [{ resolve: executable }],
          getArgsMocks: [{ resolve: args }],
          getshellMocks: [{ resolve: shell }],
          getInstalledRegexMocks: [{ resolve: installedRegex }],
          getInstalledVersionMocks: [{ resolve: installedVersion }],
          getVersionCorrectMocks: [{ resolve: true }],
        },
        output: {
          expected: {
            resolve: {
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          configureExecutableCalls: [
            [
              {
                existingExecutable: undefined,
                inputs,
              },
            ],
          ],
          getArgsCalls: [[undefined]],
          getshellCalls: [[undefined]],
          getInstalledRegexCalls: [[undefined]],
          getInstalledVersionCalls: [[]],
          getVersionCorrectCalls: [[]],
          consoleLogCalls: [[`Installed version: "${installedVersion}"`]],
        },
      })
    })
  })
  describe('configureExecutable', () => {
    it('calls configureStatic if static executable input', async () => {
      const staticExecutable = {
        command: 'static exectuable input',
      }
      const inputs = {
        executable: staticExecutable,
      }
      await testConfigureExecutable({
        input: {
          inputs,
          configureStaticMocks: [{ resolve: staticExecutable }],
        },
        output: {
          expected: staticExecutable,
          configureStaticCalls: [
            [
              {
                inputs,
                existingCommand: undefined,
              },
            ],
          ],
        },
      })
    })
    it('calls configureStatic if no executable input and existing static', async () => {
      const staticExecutable = {
        command: 'no exectuable input existing static',
      }
      const inputs = {
        interactive: false,
      }
      await testConfigureExecutable({
        input: {
          inputs,
          existingExecutable: staticExecutable,
          configureStaticMocks: [{ resolve: staticExecutable }],
        },
        output: {
          expected: staticExecutable,
          configureStaticCalls: [
            [
              {
                inputs,
                existingCommand: staticExecutable.command,
              },
            ],
          ],
        },
      })
    })
    it('calls configureStatic if no executable input and prompts as static', async () => {
      const staticExecutable = {
        command: 'no exectuable input and prompt static',
      }
      await testConfigureExecutable({
        input: {
          getCommandTypeMocks: [{ resolve: 'static' }],
          configureStaticMocks: [{ resolve: staticExecutable }],
        },
        output: {
          expected: staticExecutable,
          getCommandTypeCalls: [['static']],
          configureStaticCalls: [
            [
              {
                inputs: undefined,
                existingCommand: undefined,
              },
            ],
          ],
          consoleLogCalls: [...getCommandTypeDescriptions()],
        },
      })
    })
    it('calls configureStatic if no executable and existing static input and prompts as static', async () => {
      const staticExecutable = {
        command: 'no exectuable and existing static input and prompt static',
      }
      await testConfigureExecutable({
        input: {
          existingExecutable: staticExecutable,
          getCommandTypeMocks: [{ resolve: 'static' }],
          configureStaticMocks: [{ resolve: staticExecutable }],
        },
        output: {
          expected: staticExecutable,
          getCommandTypeCalls: [['static']],
          configureStaticCalls: [
            [
              {
                inputs: undefined,
                existingCommand: staticExecutable.command,
              },
            ],
          ],
          consoleLogCalls: [...getCommandTypeDescriptions()],
        },
      })
    })
    it('defaults to configureStatic if no executable input and non-interactive', async () => {
      const staticExecutable = {
        command: 'no exectuable input non-interactive',
      }
      const inputs = {
        interactive: false,
      }
      await testConfigureExecutable({
        input: {
          inputs,
          configureStaticMocks: [{ resolve: staticExecutable }],
        },
        output: {
          expected: staticExecutable,
          configureStaticCalls: [
            [
              {
                inputs,
                existingCommand: undefined,
              },
            ],
          ],
        },
      })
    })
    it('calls configureDynamic if dynamic executable input', async () => {
      const dynamicExecutable = {
        directory: 'dynamic exectuable input directory',
        regex: 'dynamic exectuable input regex',
      }
      const inputs = {
        executable: dynamicExecutable,
      }
      await testConfigureExecutable({
        input: {
          inputs,
          configureDynamicMocks: [{ resolve: dynamicExecutable }],
        },
        output: {
          expected: dynamicExecutable,
          configureDynamicCalls: [
            [
              {
                inputs,
                existingDirectory: undefined,
                existingRegex: undefined,
              },
            ],
          ],
        },
      })
    })
    it('calls configureDynamic if no executable input and existing dynamic', async () => {
      const dynamicExecutable = {
        directory: 'no exectuable input existing directory',
        regex: 'no exectuable input existing regex',
      }
      const inputs = {
        executable: dynamicExecutable,
      }
      await testConfigureExecutable({
        input: {
          inputs,
          existingExecutable: dynamicExecutable,
          configureDynamicMocks: [{ resolve: dynamicExecutable }],
        },
        output: {
          expected: dynamicExecutable,
          configureDynamicCalls: [
            [
              {
                inputs,
                existingDirectory: dynamicExecutable.directory,
                existingRegex: dynamicExecutable.regex,
              },
            ],
          ],
        },
      })
    })
    it('calls configureDynamic if no executable input and prompts as dynamic', async () => {
      const dynamicExecutable = {
        directory: 'no exectuable input and prompt directory',
        regex: 'no exectuable input and prompt regex',
      }
      await testConfigureExecutable({
        input: {
          getCommandTypeMocks: [{ resolve: 'dynamic' }],
          configureDynamicMocks: [{ resolve: dynamicExecutable }],
        },
        output: {
          expected: dynamicExecutable,
          getCommandTypeCalls: [['static']],
          configureDynamicCalls: [
            [
              {
                inputs: undefined,
                existingDirectory: undefined,
                existingRegex: undefined,
              },
            ],
          ],
          consoleLogCalls: [...getCommandTypeDescriptions()],
        },
      })
    })
    it('calls configureDynamic if no executable and existing dynamic input and prompts as dynamic', async () => {
      const dynamicExecutable = {
        directory: 'no exectuable and existing dynamic input and prompt directory',
        regex: 'no exectuable and existing dynamic input and prompt regex',
      }
      await testConfigureExecutable({
        input: {
          existingExecutable: dynamicExecutable,
          getCommandTypeMocks: [{ resolve: 'dynamic' }],
          configureDynamicMocks: [{ resolve: dynamicExecutable }],
        },
        output: {
          expected: dynamicExecutable,
          getCommandTypeCalls: [['dynamic']],
          configureDynamicCalls: [
            [
              {
                inputs: undefined,
                existingDirectory: dynamicExecutable.directory,
                existingRegex: dynamicExecutable.regex,
              },
            ],
          ],
          consoleLogCalls: [...getCommandTypeDescriptions()],
        },
      })
    })
  })
  describe('configureStatic', () => {
    it('returns static if command input', async () => {
      const staticExecutable = {
        command: 'command input',
      }
      await testConfigureStatic({
        input: {
          inputs: {
            executable: staticExecutable,
          },
        },
        output: {
          expected: { resolve: staticExecutable },
        },
      })
    })
    it('returns static if no command input and existing command', async () => {
      const staticExecutable = {
        command: 'no command input and existing',
      }
      await testConfigureStatic({
        input: {
          inputs: {
            interactive: false,
          },
          existingCommand: staticExecutable.command,
        },
        output: {
          expected: { resolve: staticExecutable },
        },
      })
    })
    it('throws error if no command input and no existing command', async () => {
      await testConfigureStatic({
        input: {
          inputs: {
            interactive: false,
          },
        },
        output: {
          expected: { reject: 'The executable type "static" requires a value passed into the "--command" option.' },
        },
      })
    })
    it('returns static if no executable input and prompts for command', async () => {
      const command = 'no command input and prompt'
      await testConfigureStatic({
        input: {
          getCommandMocks: [{ resolve: command }],
        },
        output: {
          expected: { resolve: { command } },
          getCommandCalls: [[undefined]],
        },
      })
    })
    it('returns static if no executable input but existing command and prompts for command', async () => {
      const existingCommand = 'no command input but existing'
      const command = 'no command input but existing and prompt'
      await testConfigureStatic({
        input: {
          existingCommand,
          getCommandMocks: [{ resolve: command }],
        },
        output: {
          expected: { resolve: { command } },
          getCommandCalls: [[existingCommand]],
        },
      })
    })
  })
  describe('configureDynamic', () => {
    it('returns dynamic if directory and regex input', async () => {
      const dynamicExecutable = {
        directory: 'directory and regex input directory',
        regex: 'directory and regex input regex',
      }
      const resolvedExecutable = 'directory and regex input resolved'
      const inputs = {
        executable: dynamicExecutable,
      }
      await testConfigureDynamic({
        input: {
          inputs,
          getDynamicExecutableMocks: [{ resolve: resolvedExecutable }],
        },
        output: {
          expected: { resolve: dynamicExecutable },
          getDynamicExecutableCalls: [[dynamicExecutable]],
          consoleLogCalls: [[`Resolved executable: "${resolvedExecutable}"`]],
        },
      })
    })
    it('returns dynamic if no directory or regex input and existing directory and regex', async () => {
      const dynamicExecutable = {
        directory: 'directory and regex input directory with existing',
        regex: 'directory and regex input regex with existing',
      }
      const resolvedExecutable = 'directory and regex input resolved with existing'
      await testConfigureDynamic({
        input: {
          inputs: {
            interactive: false,
          },
          existingDirectory: dynamicExecutable.directory,
          existingRegex: dynamicExecutable.regex,
          getDynamicExecutableMocks: [{ resolve: resolvedExecutable }],
        },
        output: {
          expected: { resolve: dynamicExecutable },
          getDynamicExecutableCalls: [[dynamicExecutable]],
          consoleLogCalls: [[`Resolved executable: "${resolvedExecutable}"`]],
        },
      })
    })
    it('throws error if no directory input and no existing directory', async () => {
      await testConfigureDynamic({
        input: {
          inputs: {
            interactive: false,
          },
        },
        output: {
          expected: { reject: 'The executable type "dynamic" requires a value passed into the "--directory" option.' },
        },
      })
    })
    it('throws error if no regex input and no existing regex', async () => {
      await testConfigureDynamic({
        input: {
          inputs: {
            interactive: false,
          },
          existingDirectory: 'no regex input directory',
        },
        output: {
          expected: { reject: 'The executable type "dynamic" requires a value passed into the "--regex" option.' },
        },
      })
    })
    it('returns dynamic if no executable input and prompts for directory and regex', async () => {
      const dynamicExecutable = {
        directory: 'no executable input prompt directory',
        regex: 'no executable input prompt regex',
      }
      const resolvedExecutable = 'no executable input prompt resolved'
      await testConfigureDynamic({
        input: {
          getDirectoryMocks: [{ resolve: dynamicExecutable.directory }],
          getRegexMocks: [{ resolve: dynamicExecutable.regex }],
          getDynamicExecutableMocks: [{ resolve: resolvedExecutable }],
          getExecutableCorrectMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: dynamicExecutable },
          getDirectoryCalls: [[undefined]],
          getRegexCalls: [[undefined]],
          getDynamicExecutableCalls: [[dynamicExecutable]],
          getExecutableCorrectCalls: [[]],
          consoleLogCalls: [[`Resolved executable: "${resolvedExecutable}"`]],
        },
      })
    })
    it('dynamic executable incorrect from inputs can be reconfigured with prompts', async () => {
      const initialDynamicExecutable = {
        directory: 'incorrect from inputs reconfigured with prompts directory',
        regex: 'incorrect from inputs reconfigured with prompts regex',
      }
      const reconfiguredDynamicExecutable = {
        directory: 'incorrect from inputs reconfigured with prompts directory reconfigured',
        regex: 'incorrect from inputs reconfigured with prompts regex reconfigured',
      }
      const initialResolvedExecutable = 'incorrect from inputs reconfigured with prompts resolved initial'
      const reconfiguredResolvedExecutable = 'incorrect from inputs reconfigured with prompts resolved reconfigured'
      await testConfigureDynamic({
        input: {
          inputs: {
            executable: initialDynamicExecutable,
            interactive: true,
          },
          getDirectoryMocks: [{ resolve: reconfiguredDynamicExecutable.directory }],
          getRegexMocks: [{ resolve: reconfiguredDynamicExecutable.regex }],
          getDynamicExecutableMocks: [
            { resolve: initialResolvedExecutable },
            { resolve: reconfiguredResolvedExecutable },
          ],
          getExecutableCorrectMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: { resolve: reconfiguredDynamicExecutable },
          getDirectoryCalls: [[initialDynamicExecutable.directory]],
          getRegexCalls: [[initialDynamicExecutable.regex]],
          getDynamicExecutableCalls: [[initialDynamicExecutable], [reconfiguredDynamicExecutable]],
          getExecutableCorrectCalls: [[], []],
          consoleLogCalls: [
            [`Resolved executable: "${initialResolvedExecutable}"`],
            [`Resolved executable: "${reconfiguredResolvedExecutable}"`],
          ],
        },
      })
    })
    it('dynamic executable incorrect from prompts can be reconfigured with prompts', async () => {
      const initialDynamicExecutable = {
        directory: 'incorrect from prompts reconfigured with prompts directory',
        regex: 'incorrect from prompts reconfigured with prompts regex',
      }
      const reconfiguredDynamicExecutable = {
        directory: 'incorrect from prompts reconfigured with prompts directory reconfigured',
        regex: 'incorrect from prompts reconfigured with prompts regex reconfigured',
      }
      const initialResolvedExecutable = 'incorrect from prompts reconfigured with prompts initial'
      const reconfiguredResolvedExecutable = 'incorrect from prompts reconfigured with prompts reconfigured'
      await testConfigureDynamic({
        input: {
          getDirectoryMocks: [
            { resolve: initialDynamicExecutable.directory },
            { resolve: reconfiguredDynamicExecutable.directory },
          ],
          getRegexMocks: [
            { resolve: initialDynamicExecutable.regex },
            { resolve: reconfiguredDynamicExecutable.regex },
          ],
          getDynamicExecutableMocks: [
            { resolve: initialResolvedExecutable },
            { resolve: reconfiguredResolvedExecutable },
          ],
          getExecutableCorrectMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: { resolve: reconfiguredDynamicExecutable },
          getDirectoryCalls: [[undefined], [initialDynamicExecutable.directory]],
          getRegexCalls: [[undefined], [initialDynamicExecutable.regex]],
          getDynamicExecutableCalls: [[initialDynamicExecutable], [reconfiguredDynamicExecutable]],
          getExecutableCorrectCalls: [[], []],
          consoleLogCalls: [
            [`Resolved executable: "${initialResolvedExecutable}"`],
            [`Resolved executable: "${reconfiguredResolvedExecutable}"`],
          ],
        },
      })
    })
    it('throws getDynamicExecutable error if non-interactive', async () => {
      const dynamicExecutable = {
        directory: 'getDynamicExecutable error non-interactive directory',
        regex: 'getDynamicExecutable error non-interactive regex',
      }
      const getDynamicExecutableError = 'getDynamicExecutable error non-interactive'
      await testConfigureDynamic({
        input: {
          inputs: {
            executable: dynamicExecutable,
          },
          getDynamicExecutableMocks: [{ reject: getDynamicExecutableError }],
        },
        output: {
          expected: { reject: getDynamicExecutableError },
          getDynamicExecutableCalls: [[dynamicExecutable]],
        },
      })
    })
    it('getDynamicExecutable error from inputs can be reconfigured with prompts', async () => {
      const initialDynamicExecutable = {
        directory: 'error from inputs reconfigured with prompts directory',
        regex: 'error from inputs reconfigured with prompts regex',
      }
      const reconfiguredDynamicExecutable = {
        directory: 'error from inputs reconfigured with prompts directory reconfigured',
        regex: 'error from inputs reconfigured with prompts regex reconfigured',
      }
      const resolvedExecutableError = 'error from inputs reconfigured with prompts error'
      const reconfiguredResolvedExecutable = 'error from inputs reconfigured with prompts reconfigured'
      await testConfigureDynamic({
        input: {
          inputs: {
            executable: initialDynamicExecutable,
            interactive: true,
          },
          getDirectoryMocks: [{ resolve: reconfiguredDynamicExecutable.directory }],
          getRegexMocks: [{ resolve: reconfiguredDynamicExecutable.regex }],
          getDynamicExecutableMocks: [{ reject: resolvedExecutableError }, { resolve: reconfiguredResolvedExecutable }],
          getExecutableCorrectMocks: [{ resolve: true }],
          getReattemptDynamicMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: reconfiguredDynamicExecutable },
          getDirectoryCalls: [[initialDynamicExecutable.directory]],
          getRegexCalls: [[initialDynamicExecutable.regex]],
          getDynamicExecutableCalls: [[initialDynamicExecutable], [reconfiguredDynamicExecutable]],
          getExecutableCorrectCalls: [[]],
          getReattemptDynamicCalls: [[]],
          consoleLogCalls: [[`Resolved executable: "${reconfiguredResolvedExecutable}"`]],
          consoleErrorCalls: [[colors.red(resolvedExecutableError)]],
        },
      })
    })
    it('getDynamicExecutable error from prompts can be reconfigured with prompts', async () => {
      const initialDynamicExecutable = {
        directory: 'error from prompts reconfigured with prompts directory',
        regex: 'error from prompts reconfigured with prompts regex',
      }
      const reconfiguredDynamicExecutable = {
        directory: 'error from prompts reconfigured with prompts directory reconfigured',
        regex: 'error from prompts reconfigured with prompts regex reconfigured',
      }
      const resolvedExecutableError = 'error from prompts reconfigured with prompts error'
      const reconfiguredResolvedExecutable = 'error from prompts reconfigured with prompts reconfigured'
      await testConfigureDynamic({
        input: {
          getDirectoryMocks: [
            { resolve: initialDynamicExecutable.directory },
            { resolve: reconfiguredDynamicExecutable.directory },
          ],
          getRegexMocks: [
            { resolve: initialDynamicExecutable.regex },
            { resolve: reconfiguredDynamicExecutable.regex },
          ],
          getDynamicExecutableMocks: [{ reject: resolvedExecutableError }, { resolve: reconfiguredResolvedExecutable }],
          getExecutableCorrectMocks: [{ resolve: true }],
          getReattemptDynamicMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: reconfiguredDynamicExecutable },
          getDirectoryCalls: [[undefined], [initialDynamicExecutable.directory]],
          getRegexCalls: [[undefined], [initialDynamicExecutable.regex]],
          getDynamicExecutableCalls: [[initialDynamicExecutable], [reconfiguredDynamicExecutable]],
          getExecutableCorrectCalls: [[]],
          getReattemptDynamicCalls: [[]],
          consoleLogCalls: [[`Resolved executable: "${reconfiguredResolvedExecutable}"`]],
          consoleErrorCalls: [[colors.red(resolvedExecutableError)]],
        },
      })
    })
    it('getDynamicExecutable error from inputs without reattempt returns undefined', async () => {
      const dynamicExecutable = {
        directory: 'error from inputs without reattempt directory',
        regex: 'error from inputs without reattempt regex',
      }
      const resolvedExecutableError = 'error from inputs without reattempt error'
      await testConfigureDynamic({
        input: {
          inputs: {
            executable: dynamicExecutable,
            interactive: true,
          },
          getDynamicExecutableMocks: [{ reject: resolvedExecutableError }],
          getReattemptDynamicMocks: [{ resolve: false }],
        },
        output: {
          expected: { resolve: undefined },
          getDynamicExecutableCalls: [[dynamicExecutable]],
          getReattemptDynamicCalls: [[]],
          consoleErrorCalls: [[colors.red(resolvedExecutableError)]],
        },
      })
    })
    it('getDynamicExecutable error from prompts without reattempt returns undefined', async () => {
      const dynamicExecutable = {
        directory: 'error from prompts without reattempt directory',
        regex: 'error from prompts without reattempt regex',
      }
      const resolvedExecutableError = 'error from prompts reconfigured with prompts error'
      await testConfigureDynamic({
        input: {
          getDirectoryMocks: [{ resolve: dynamicExecutable.directory }],
          getRegexMocks: [{ resolve: dynamicExecutable.regex }],
          getDynamicExecutableMocks: [{ reject: resolvedExecutableError }],
          getReattemptDynamicMocks: [{ resolve: false }],
        },
        output: {
          expected: { resolve: undefined },
          getDirectoryCalls: [[undefined]],
          getRegexCalls: [[undefined]],
          getDynamicExecutableCalls: [[dynamicExecutable]],
          getReattemptDynamicCalls: [[]],
          consoleErrorCalls: [[colors.red(resolvedExecutableError)]],
        },
      })
    })
  })
  describe('configureLatestVersion', () => {
    it('returns latest version if required inputs', async () => {
      const description = 'required inputs'
      const url = `${description} url`
      const latestRegex = `${description} latestRegex`
      const latestVersion = `${description} latest version`
      const inputs = {
        url,
        latestRegex,
      }
      await testConfigureLatestVersion({
        input: {
          inputs,
          getLatestVersionMocks: [{ resolve: latestVersion }],
        },
        output: {
          expected: {
            resolve: {
              url,
              latestRegex,
            },
          },
          getLatestVersionCalls: [[]],
          consoleLogCalls: [[`Latest version: "${latestVersion}"`]],
        },
      })
    })
    it('returns latest version if no inputs and existing required', async () => {
      const description = 'no inputs and existing required'
      const url = `${description} url`
      const latestRegex = `${description} latestRegex`
      const latestVersion = `${description} latest version`
      const inputs = {
        interactive: false,
      }
      await testConfigureLatestVersion({
        input: {
          inputs,
          existingUrl: url,
          existingLatestRegex: latestRegex,
          getLatestVersionMocks: [{ resolve: latestVersion }],
        },
        output: {
          expected: {
            resolve: {
              url,
              latestRegex,
            },
          },
          getLatestVersionCalls: [[]],
          consoleLogCalls: [[`Latest version: "${latestVersion}"`]],
        },
      })
    })
    it('throws error if no url input and no existing', async () => {
      const desription = 'no url and no existing'
      const latestRegex = `${desription} latestRegex`
      await testConfigureLatestVersion({
        input: {
          inputs: {
            latestRegex,
            interactive: false,
          },
        },
        output: {
          expected: { reject: 'Option "url" must be non-empty string' },
        },
      })
    })
    it('throws error if no latestRegex input and no existing', async () => {
      const desription = 'no latestRegex and no existing'
      const url = `${desription} url`
      await testConfigureLatestVersion({
        input: {
          inputs: {
            url,
            interactive: false,
          },
        },
        output: {
          expected: { reject: 'Option "latestRegex" must be non-empty string' },
        },
      })
    })
    it('returns latest version if no required inputs and prompts for required inputs', async () => {
      const description = 'no required inputs and prompts required'
      const url = `${description} url`
      const latestRegex = `${description} latestRegex`
      const latestVersion = `${description} latest version`
      await testConfigureLatestVersion({
        input: {
          getUrlMocks: [{ resolve: url }],
          getLatestRegexMocks: [{ resolve: latestRegex }],
          getLatestVersionMocks: [{ resolve: latestVersion }],
          getVersionCorrectMocks: [{ resolve: true }],
        },
        output: {
          expected: {
            resolve: {
              url,
              latestRegex,
            },
          },
          getUrlCalls: [[undefined]],
          getLatestRegexCalls: [[undefined]],
          getLatestVersionCalls: [[]],
          getVersionCorrectCalls: [[]],
          consoleLogCalls: [[`Latest version: "${latestVersion}"`]],
        },
      })
    })
    it('latest version incorrect from required inputs can be reconfigured with prompts', async () => {
      const description = 'latest version incorrect from required inputs reconfigured with prompts'
      const urlInitial = `${description} url initial`
      const latestRegexInitial = `${description} latestRegex initial`
      const urlReconfigured = `${description} url reconfigured`
      const latestRegexReconfigured = `${description} latestRegex reconfigured`
      const latestVersionInitial = `${description} latest version initial`
      const latestVersionReconfigured = `${description} latest version reconfigured`
      const inputs = {
        url: urlInitial,
        latestRegex: latestRegexInitial,
        interactive: true,
      }
      await testConfigureLatestVersion({
        input: {
          inputs,
          getUrlMocks: [{ resolve: urlReconfigured }],
          getLatestRegexMocks: [{ resolve: latestRegexReconfigured }],
          getLatestVersionMocks: [{ resolve: latestVersionInitial }, { resolve: latestVersionReconfigured }],
          getVersionCorrectMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: {
            resolve: {
              url: urlReconfigured,
              latestRegex: latestRegexReconfigured,
            },
          },
          getUrlCalls: [[urlInitial]],
          getLatestRegexCalls: [[latestRegexInitial]],
          getLatestVersionCalls: [[], []],
          getVersionCorrectCalls: [[], []],
          consoleLogCalls: [
            [`Latest version: "${latestVersionInitial}"`],
            [`Latest version: "${latestVersionReconfigured}"`],
          ],
        },
      })
    })
    it('latest version incorrect from required prompts can be reconfigured with prompts', async () => {
      const description = 'latest version incorrect from required prompts reconfigured with prompts'
      const urlInitial = `${description} url initial`
      const latestRegexInitial = `${description} latestRegex initial`
      const urlReconfigured = `${description} url reconfigured`
      const latestRegexReconfigured = `${description} latestRegex reconfigured`
      const latestVersionInitial = `${description} latest version initial`
      const latestVersionReconfigured = `${description} latest version reconfigured`
      const inputs = {
        interactive: true,
      }
      await testConfigureLatestVersion({
        input: {
          inputs,
          getUrlMocks: [{ resolve: urlInitial }, { resolve: urlReconfigured }],
          getLatestRegexMocks: [{ resolve: latestRegexInitial }, { resolve: latestRegexReconfigured }],
          getLatestVersionMocks: [{ resolve: latestVersionInitial }, { resolve: latestVersionReconfigured }],
          getVersionCorrectMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: {
            resolve: {
              url: urlReconfigured,
              latestRegex: latestRegexReconfigured,
            },
          },
          getUrlCalls: [[undefined], [urlInitial]],
          getLatestRegexCalls: [[undefined], [latestRegexInitial]],
          getLatestVersionCalls: [[], []],
          getVersionCorrectCalls: [[], []],
          consoleLogCalls: [
            [`Latest version: "${latestVersionInitial}"`],
            [`Latest version: "${latestVersionReconfigured}"`],
          ],
        },
      })
    })
    it('latest version error from required inputs can be reconfigured with prompts', async () => {
      const description = 'latest version error from required inputs reconfigured with prompts'
      const urlInitial = `${description} url initial`
      const latestRegexInitial = `${description} latestRegex initial`
      const urlReconfigured = `${description} url reconfigured`
      const latestRegexReconfigured = `${description} latestRegex reconfigured`
      const latestVersionError = `${description} latest version error`
      const latestVersionReconfigured = `${description} latest version reconfigured`
      const inputs = {
        interactive: true,
        url: urlInitial,
        latestRegex: latestRegexInitial,
      }
      await testConfigureLatestVersion({
        input: {
          inputs,
          getUrlMocks: [{ resolve: urlReconfigured }],
          getLatestRegexMocks: [{ resolve: latestRegexReconfigured }],
          getLatestVersionMocks: [{ reject: latestVersionError }, { resolve: latestVersionReconfigured }],
          getVersionCorrectMocks: [{ resolve: true }],
          getReattemptVersionMocks: [{ resolve: true }],
        },
        output: {
          expected: {
            resolve: {
              url: urlReconfigured,
              latestRegex: latestRegexReconfigured,
            },
          },
          getUrlCalls: [[urlInitial]],
          getLatestRegexCalls: [[latestRegexInitial]],
          getLatestVersionCalls: [[], []],
          getVersionCorrectCalls: [[]],
          getReattemptVersionCalls: [[]],
          consoleLogCalls: [[`Latest version: "${latestVersionReconfigured}"`]],
          consoleErrorCalls: [[colors.red(latestVersionError)]],
        },
      })
    })
    it('latest version error from required prompts can be reconfigured with prompts', async () => {
      const description = 'latest version error from required prompts reconfigured with prompts'
      const urlInitial = `${description} url initial`
      const latestRegexInitial = `${description} latestRegex initial`
      const urlReconfigured = `${description} url reconfigured`
      const latestRegexReconfigured = `${description} latestRegex reconfigured`
      const latestVersionError = `${description} latest version error`
      const latestVersionReconfigured = `${description} latest version reconfigured`
      await testConfigureLatestVersion({
        input: {
          getUrlMocks: [{ resolve: urlInitial }, { resolve: urlReconfigured }],
          getLatestRegexMocks: [{ resolve: latestRegexInitial }, { resolve: latestRegexReconfigured }],
          getLatestVersionMocks: [{ reject: latestVersionError }, { resolve: latestVersionReconfigured }],
          getVersionCorrectMocks: [{ resolve: true }],
          getReattemptVersionMocks: [{ resolve: true }],
        },
        output: {
          expected: {
            resolve: {
              url: urlReconfigured,
              latestRegex: latestRegexReconfigured,
            },
          },
          getUrlCalls: [[undefined], [urlInitial]],
          getLatestRegexCalls: [[undefined], [latestRegexInitial]],
          getLatestVersionCalls: [[], []],
          getVersionCorrectCalls: [[]],
          getReattemptVersionCalls: [[]],
          consoleLogCalls: [[`Latest version: "${latestVersionReconfigured}"`]],
          consoleErrorCalls: [[colors.red(latestVersionError)]],
        },
      })
    })
    it('throws error if latest version error and non-interactive', async () => {
      const desription = 'latest version error non-interactive'
      const url = `${desription} url`
      const latestRegex = `${desription} regex`
      const error = `${desription} error`
      await testConfigureLatestVersion({
        input: {
          inputs: {
            url,
            latestRegex,
            interactive: false,
          },
          getLatestVersionMocks: [{ reject: error }],
        },
        output: {
          expected: { reject: error },
          getLatestVersionCalls: [[]],
        },
      })
    })
    it('returns undefined if latest version error from required prompts and no reconfigure', async () => {
      const desription = 'latest version error from required prompts no reconfigure'
      const url = `${desription} url`
      const latestRegex = `${desription} regex`
      const error = `${desription} error`
      await testConfigureLatestVersion({
        input: {
          inputs: {
            url,
            latestRegex,
            interactive: true,
          },
          getLatestVersionMocks: [{ reject: error }],
          getReattemptVersionMocks: [{ resolve: false }],
        },
        output: {
          expected: { resolve: undefined },
          getLatestVersionCalls: [[]],
          getReattemptVersionCalls: [[]],
          consoleErrorCalls: [[colors.red(error)]],
        },
      })
    })
  })
})

function getCommandTypeDescriptions(): string[][] {
  return [
    ['Command types:'],
    [
      'Static - Software executable defined by a fixed, non-changing path (eg executable on $PATH or absolute path to executable file).',
    ],
    [
      'Dynamic - Software executable has changing, evolving name requiring regex patterns to determine (eg executable name includes version, which changes between releases).',
    ],
  ]
}

interface TestConfigureInput {
  inputs?: AddInputs
  existingSoftware?: Software
  getNameMocks?: Response[]
  configureInstalledVersionMocks?: Response[]
  configureLatestVersionMocks?: Response[]
  editMocks?: Response[]
  addMocks?: Response[]
}

interface TestConfigureOutput {
  getNameCalls?: ExpectedCalls[][]
  configureInstalledVersionCalls?: ExpectedCalls[][]
  configureLatestVersionCalls?: ExpectedCalls[][]
  editCalls?: ExpectedCalls[][]
  addCalls?: ExpectedCalls[][]
}

async function testConfigure({
  input,
  output,
}: {
  input: TestConfigureInput
  output: TestConfigureOutput
}): Promise<void> {
  const methodParams: any = {}
  if (input.inputs) {
    methodParams.inputs = input.inputs
  }
  if (input.existingSoftware) {
    methodParams.existingSoftware = input.existingSoftware
  }
  const getNameSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Add, 'getName'),
    responses: input.getNameMocks,
  })
  const configureInstalledVersionSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Add, 'configureInstalledVersion'),
    responses: input.configureInstalledVersionMocks,
  })
  const configureLatestVersionSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Add, 'configureLatestVersion'),
    responses: input.configureLatestVersionMocks,
  })
  const editSpy = TestUtil.mockResponses({
    spy: jest.spyOn(SoftwareList, 'edit'),
    responses: input.editMocks,
  })
  const addSpy = TestUtil.mockResponses({
    spy: jest.spyOn(SoftwareList, 'add'),
    responses: input.addMocks,
  })
  await expect(Add.configure(methodParams)).resolves.toBe(undefined)
  expect(getNameSpy.mock.calls).toEqual(output.getNameCalls || [])
  expect(configureInstalledVersionSpy.mock.calls).toEqual(output.configureInstalledVersionCalls || [])
  expect(configureLatestVersionSpy.mock.calls).toEqual(output.configureLatestVersionCalls || [])
  expect(editSpy.mock.calls).toEqual(output.editCalls || [])
  expect(addSpy.mock.calls).toEqual(output.addCalls || [])
}

interface TestGetNameInput {
  inputs?: AddInputs
  existingName?: string
  loadSoftwareListMocks?: Response[]
  getNameMocks?: Response[]
  isNameDuplicateMocks?: Response[]
}

interface TestGetNameOutput {
  expected: Response
  loadSoftwareListCalls?: ExpectedCalls[][]
  getNameCalls?: ExpectedCalls[][]
  isNameDuplicateCalls?: ExpectedCalls[][]
  consoleErrorCalls?: (string[] | undefined)[]
}

async function testGetName({ input, output }: { input: TestGetNameInput; output: TestGetNameOutput }): Promise<void> {
  const methodParams: any = {}
  if (input.inputs) {
    methodParams.inputs = input.inputs
  }
  if (input.existingName) {
    methodParams.existingName = input.existingName
  }
  const loadSoftareListSpy = TestUtil.mockResponses({
    spy: jest.spyOn(SoftwareList, 'load'),
    responses: input.loadSoftwareListMocks || [],
  })
  const getNameSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getName'),
    responses: input.getNameMocks,
  })
  const isNameDuplicateSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Add, 'isNameDuplicate'),
    responses: input.isNameDuplicateMocks,
  })
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  if (output.expected.reject) {
    await expect(Add.getName(methodParams)).rejects.toThrow(output.expected.reject)
  } else {
    await expect(Add.getName(methodParams)).resolves.toBe(output.expected.resolve)
  }
  expect(loadSoftareListSpy.mock.calls).toEqual(output.loadSoftwareListCalls || [])
  expect(getNameSpy.mock.calls).toEqual(output.getNameCalls || [])
  expect(isNameDuplicateSpy.mock.calls).toEqual(output.isNameDuplicateCalls || [])
  expect(JSON.stringify(consoleErrorSpy.mock.calls, null, 2)).toBe(
    JSON.stringify(output.consoleErrorCalls || [], null, 2)
  )
}

interface TestConfigureInstalledVersionInput {
  inputs?: AddInputs
  existingExecutable?: Static | Dynamic
  existingArgs?: string
  existingShell?: string
  existingInstalledRegex?: string
  installedVersion?: string
  installedError?: string
  configureExecutableMocks?: Response[]
  getArgsMocks?: Response[]
  getshellMocks?: Response[]
  getInstalledRegexMocks?: Response[]
  getInstalledVersionMocks?: Response[]
  getVersionCorrectMocks?: Response[]
  getReattemptVersionMocks?: Response[]
}

interface TestConfigureInstalledVersionOutput {
  expected: Response
  configureExecutableCalls?: ExpectedCalls[][]
  getArgsCalls?: ExpectedCalls[][]
  getshellCalls?: ExpectedCalls[][]
  getInstalledRegexCalls?: ExpectedCalls[][]
  getInstalledVersionCalls?: ExpectedCalls[][]
  getVersionCorrectCalls?: ExpectedCalls[][]
  getReattemptVersionCalls?: ExpectedCalls[][]
  consoleLogCalls?: (string[] | undefined)[]
  consoleErrorCalls?: (string[] | undefined)[]
}

async function testConfigureInstalledVersion({
  input,
  output,
}: {
  input: TestConfigureInstalledVersionInput
  output: TestConfigureInstalledVersionOutput
}): Promise<void> {
  const methodParams: any = {}
  if (input.inputs) {
    methodParams.inputs = input.inputs
  }
  if (input.existingExecutable) {
    methodParams.existingExecutable = input.existingExecutable
  }
  if (input.existingArgs) {
    methodParams.existingArgs = input.existingArgs
  }
  if (input.existingShell) {
    methodParams.existingShell = input.existingShell
  }
  if (input.existingInstalledRegex) {
    methodParams.existingInstalledRegex = input.existingInstalledRegex
  }
  const configureExecutableSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Add, 'configureExecutable'),
    responses: input.configureExecutableMocks,
  })
  const getArgsSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getArgs'),
    responses: input.getArgsMocks,
  })
  const getshellSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getShell'),
    responses: input.getshellMocks,
  })
  const getInstalledRegexSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getInstalledRegex'),
    responses: input.getInstalledRegexMocks,
  })
  const getInstalledVersionSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Software.prototype, 'getInstalledVersion'),
    responses: input.getInstalledVersionMocks,
  })
  const getVersionCorrectSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getVersionCorrect'),
    responses: input.getVersionCorrectMocks,
  })
  const getReattemptVersionSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getReattemptVersion'),
    responses: input.getReattemptVersionMocks,
  })
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  if (output.expected.reject) {
    await expect(Add.configureInstalledVersion(methodParams)).rejects.toThrow(output.expected.reject)
  } else {
    await expect(Add.configureInstalledVersion(methodParams)).resolves.toStrictEqual(output.expected.resolve)
  }
  expect(configureExecutableSpy.mock.calls).toEqual(output.configureExecutableCalls || [])
  expect(getArgsSpy.mock.calls).toEqual(output.getArgsCalls || [])
  expect(getshellSpy.mock.calls).toEqual(output.getshellCalls || [])
  expect(getInstalledRegexSpy.mock.calls).toEqual(output.getInstalledRegexCalls || [])
  expect(getInstalledVersionSpy.mock.calls).toEqual(output.getInstalledVersionCalls || [])
  expect(getVersionCorrectSpy.mock.calls).toEqual(output.getVersionCorrectCalls || [])
  expect(getReattemptVersionSpy.mock.calls).toEqual(output.getReattemptVersionCalls || [])
  expect(JSON.stringify(consoleLogSpy.mock.calls, null, 2)).toBe(JSON.stringify(output.consoleLogCalls || [], null, 2))
  expect(JSON.stringify(consoleErrorSpy.mock.calls, null, 2)).toBe(
    JSON.stringify(output.consoleErrorCalls || [], null, 2)
  )
}

interface TestConfigureExecutableInput {
  inputs?: AddInputs
  existingExecutable?: Static | Dynamic
  getCommandTypeMocks?: Response[]
  configureStaticMocks?: Response[]
  configureDynamicMocks?: Response[]
}

interface TestConfigureExecutableOutput {
  expected: Static | Dynamic
  getCommandTypeCalls?: ExpectedCalls[][]
  configureStaticCalls?: ExpectedCalls[][]
  configureDynamicCalls?: ExpectedCalls[][]
  consoleLogCalls?: (string[] | undefined)[]
}

async function testConfigureExecutable({
  input,
  output,
}: {
  input: TestConfigureExecutableInput
  output: TestConfigureExecutableOutput
}): Promise<void> {
  const methodParams: any = {}
  if (input.inputs) {
    methodParams.inputs = input.inputs
  }
  if (input.existingExecutable) {
    methodParams.existingExecutable = input.existingExecutable
  }
  const getCommandTypeSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getCommandType'),
    responses: input.getCommandTypeMocks,
  })
  const configureStaticSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Add, 'configureStatic'),
    responses: input.configureStaticMocks,
  })
  const configureDynamicSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Add, 'configureDynamic'),
    responses: input.configureDynamicMocks,
  })
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
  await expect(Add.configureExecutable(methodParams)).resolves.toEqual(output.expected)
  expect(getCommandTypeSpy.mock.calls).toEqual(output.getCommandTypeCalls || [])
  expect(configureStaticSpy.mock.calls).toEqual(output.configureStaticCalls || [])
  expect(configureDynamicSpy.mock.calls).toEqual(output.configureDynamicCalls || [])
  expect(JSON.stringify(consoleLogSpy.mock.calls, null, 2)).toBe(JSON.stringify(output.consoleLogCalls || [], null, 2))
}

interface TestConfigureStaticInput {
  inputs?: AddInputs
  existingCommand?: string
  getCommandMocks?: Response[]
}

interface TestConfigureStaticOutput {
  expected: Response
  getCommandCalls?: ExpectedCalls[][]
  consoleErrorCalls?: (string[] | undefined)[]
}

async function testConfigureStatic({
  input,
  output,
}: {
  input: TestConfigureStaticInput
  output: TestConfigureStaticOutput
}): Promise<void> {
  const methodParams: any = {}
  if (input.inputs) {
    methodParams.inputs = input.inputs
  }
  if (input.existingCommand) {
    methodParams.existingCommand = input.existingCommand
  }
  const getCommandSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getCommand'),
    responses: input.getCommandMocks,
  })
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  if (output.expected.reject) {
    await expect(Add.configureStatic(methodParams)).rejects.toThrow(output.expected.reject)
  } else {
    await expect(Add.configureStatic(methodParams)).resolves.toEqual(output.expected.resolve)
  }
  expect(getCommandSpy.mock.calls).toEqual(output.getCommandCalls || [])
  expect(JSON.stringify(consoleErrorSpy.mock.calls, null, 2)).toBe(
    JSON.stringify(output.consoleErrorCalls || [], null, 2)
  )
}

interface TestConfigureDynamicInput {
  inputs?: AddInputs
  existingDirectory?: string
  existingRegex?: string
  getDirectoryMocks?: Response[]
  getRegexMocks?: Response[]
  getDynamicExecutableMocks?: Response[]
  getExecutableCorrectMocks?: Response[]
  getReattemptDynamicMocks?: Response[]
}

interface TestConfigureDynamicOutput {
  expected: Response
  getDirectoryCalls?: ExpectedCalls[][]
  getRegexCalls?: ExpectedCalls[][]
  getDynamicExecutableCalls?: ExpectedCalls[][]
  getExecutableCorrectCalls?: ExpectedCalls[][]
  getReattemptDynamicCalls?: ExpectedCalls[][]
  consoleLogCalls?: (string[] | undefined)[]
  consoleErrorCalls?: (string[] | undefined)[]
}

async function testConfigureDynamic({
  input,
  output,
}: {
  input: TestConfigureDynamicInput
  output: TestConfigureDynamicOutput
}): Promise<void> {
  const methodParams: any = {}
  if (input.inputs) {
    methodParams.inputs = input.inputs
  }
  if (input.existingDirectory) {
    methodParams.existingDirectory = input.existingDirectory
  }
  if (input.existingRegex) {
    methodParams.existingRegex = input.existingRegex
  }
  const getDirectorySpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getDirectory'),
    responses: input.getDirectoryMocks,
  })
  const getRegexSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getRegex'),
    responses: input.getRegexMocks,
  })
  const getDynamicExecutableSpy = TestUtil.mockResponses({
    spy: jest.spyOn(executable, 'getDynamicExecutable'),
    responses: input.getDynamicExecutableMocks,
  })
  const getExecutableCorrectSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getExecutableCorrect'),
    responses: input.getExecutableCorrectMocks,
  })
  const getReattemptDynamicSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getReattemptDynamic'),
    responses: input.getReattemptDynamicMocks,
  })
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  if (output.expected.reject) {
    await expect(Add.configureDynamic(methodParams)).rejects.toThrow(output.expected.reject)
  } else {
    await expect(Add.configureDynamic(methodParams)).resolves.toEqual(output.expected.resolve)
  }
  expect(getDirectorySpy.mock.calls).toEqual(output.getDirectoryCalls || [])
  expect(getRegexSpy.mock.calls).toEqual(output.getRegexCalls || [])
  expect(getDynamicExecutableSpy.mock.calls).toEqual(output.getDynamicExecutableCalls || [])
  expect(getExecutableCorrectSpy.mock.calls).toEqual(output.getExecutableCorrectCalls || [])
  expect(getReattemptDynamicSpy.mock.calls).toEqual(output.getReattemptDynamicCalls || [])
  expect(JSON.stringify(consoleLogSpy.mock.calls, null, 2)).toBe(JSON.stringify(output.consoleLogCalls || [], null, 2))
  expect(JSON.stringify(consoleErrorSpy.mock.calls, null, 2)).toBe(
    JSON.stringify(output.consoleErrorCalls || [], null, 2)
  )
}

interface TestConfigureLatestVersionInput {
  inputs?: AddInputs
  existingUrl?: string
  existingLatestRegex?: string
  getUrlMocks?: Response[]
  getLatestRegexMocks?: Response[]
  getLatestVersionMocks?: Response[]
  getVersionCorrectMocks?: Response[]
  getReattemptVersionMocks?: Response[]
}

interface TestConfigureLatestVersionOutput {
  expected: Response
  getUrlCalls?: ExpectedCalls[][]
  getLatestRegexCalls?: ExpectedCalls[][]
  getLatestVersionCalls?: ExpectedCalls[][]
  getVersionCorrectCalls?: ExpectedCalls[][]
  getReattemptVersionCalls?: ExpectedCalls[][]
  consoleLogCalls?: (string[] | undefined)[]
  consoleErrorCalls?: (string[] | undefined)[]
}

async function testConfigureLatestVersion({
  input,
  output,
}: {
  input: TestConfigureLatestVersionInput
  output: TestConfigureLatestVersionOutput
}): Promise<void> {
  const methodParams: any = {}
  if (input.inputs) {
    methodParams.inputs = input.inputs
  }
  if (input.existingUrl) {
    methodParams.existingUrl = input.existingUrl
  }
  if (input.existingLatestRegex) {
    methodParams.existingLatestRegex = input.existingLatestRegex
  }
  const getUrlSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getUrl'),
    responses: input.getUrlMocks,
  })
  const getLatestRegexSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getLatestRegex'),
    responses: input.getLatestRegexMocks,
  })
  const getLatestVersionSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Software.prototype, 'getLatestVersion'),
    responses: input.getLatestVersionMocks,
  })
  const getVersionCorrectSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getVersionCorrect'),
    responses: input.getVersionCorrectMocks,
  })
  const getReattemptVersionSpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getReattemptVersion'),
    responses: input.getReattemptVersionMocks,
  })
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  if (output.expected.reject) {
    await expect(Add.configureLatestVersion(methodParams)).rejects.toThrow(output.expected.reject)
  } else {
    await expect(Add.configureLatestVersion(methodParams)).resolves.toEqual(output.expected.resolve)
  }
  expect(getUrlSpy.mock.calls).toEqual(output.getUrlCalls || [])
  expect(getLatestRegexSpy.mock.calls).toEqual(output.getLatestRegexCalls || [])
  expect(getLatestVersionSpy.mock.calls).toEqual(output.getLatestVersionCalls || [])
  expect(getVersionCorrectSpy.mock.calls).toEqual(output.getVersionCorrectCalls || [])
  expect(getReattemptVersionSpy.mock.calls).toEqual(output.getReattemptVersionCalls || [])
  expect(JSON.stringify(consoleLogSpy.mock.calls, null, 2)).toBe(JSON.stringify(output.consoleLogCalls || [], null, 2))
  expect(JSON.stringify(consoleErrorSpy.mock.calls, null, 2)).toBe(
    JSON.stringify(output.consoleErrorCalls || [], null, 2)
  )
}
