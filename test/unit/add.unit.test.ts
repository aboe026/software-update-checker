import colors from '../../src/util/colors'
import fs from 'fs-extra'

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
                existingDirectory: undefined,
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
                existingDirectory: undefined,
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
        directory: 'toy',
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
                directory: software.directory,
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
                existingDirectory: undefined,
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
        directory: 'live',
        executable: {
          command: 'snl',
        },
        args: 'cast',
        shell: 'tv',
        installedRegex: 'matt foley',
        url: 'https://livininavandownbytheriver.com',
        latestRegex: 'chris farley',
      })
      const existing = new Software({
        name: 'edits if latest version and existing existing',
        directory: 'recorded',
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
                directory: software.directory,
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
                existingDirectory: existing.directory,
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
  describe('getDirectory', () => {
    it('throws error if non-interactive and invalid directory', async () => {
      const directory = '/the/chosen/one'
      await testGetDirectory({
        input: {
          inputs: {
            directory,
          },
          doesOptionalPathExistMocks: [{ resolve: false }],
        },
        output: {
          expected: { reject: `Invalid directory "${directory}", does not exist.` },
          doesOptionalPathExistCalls: [[{ directory }]],
        },
      })
    })
    it('re-prompts if no inputs interactive and invalid directory', async () => {
      const invalidDir = '/copypasta'
      const directory = '/take/me/to/your/leader'
      await testGetDirectory({
        input: {
          getDirectoryMocks: [{ resolve: invalidDir }, { resolve: directory }],
          doesOptionalPathExistMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: { resolve: directory },
          getDirectoryCalls: [[undefined], [undefined]],
          doesOptionalPathExistCalls: [[{ directory: invalidDir }], [{ directory }]],
          consoleErrorCalls: [[colors.red(`Invalid directory "${invalidDir}", does not exist.`)]],
        },
      })
    })
    it('re-prompts if inputs directory invalid and interactive', async () => {
      const invalidDir = '/dark/side/of/the/moon'
      const directory = '/aint/he/keen'
      await testGetDirectory({
        input: {
          inputs: {
            directory: invalidDir,
            interactive: true,
          },
          getDirectoryMocks: [{ resolve: directory }],
          doesOptionalPathExistMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: { resolve: directory },
          getDirectoryCalls: [[undefined]],
          doesOptionalPathExistCalls: [[{ directory: invalidDir }], [{ directory }]],
          consoleErrorCalls: [[colors.red(`Invalid directory "${invalidDir}", does not exist.`)]],
        },
      })
    })
    it('returns empty string if empty string passed in non-interactive', async () => {
      const directory = ''
      await testGetDirectory({
        input: {
          inputs: {
            directory,
          },
          doesOptionalPathExistMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: directory },
          doesOptionalPathExistCalls: [[{ directory }]],
        },
      })
    })
    it('returns existing directory if specified and undefined directory passed in non-interactive', async () => {
      const directory = '/in/case/of/fire/use/stairs'
      await testGetDirectory({
        input: {
          existingDirectory: directory,
          inputs: {
            directory: undefined,
          },
          doesOptionalPathExistMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: directory },
          doesOptionalPathExistCalls: [[{ directory }]],
        },
      })
    })
    it('returns undefined if existing directory not specified and undefined directory passed in non-interactive', async () => {
      const directory = undefined
      await testGetDirectory({
        input: {
          inputs: {
            directory,
          },
          doesOptionalPathExistMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: directory },
          doesOptionalPathExistCalls: [[{ directory }]],
        },
      })
    })
    it('existing directory can be overwritted if invalid first time interactive', async () => {
      const invalidDir = ''
      const directory = '/how/now/brown/cow'
      await testGetDirectory({
        input: {
          existingDirectory: invalidDir,
          getDirectoryMocks: [{ resolve: invalidDir }, { resolve: directory }],
          doesOptionalPathExistMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: { resolve: directory },
          getDirectoryCalls: [[invalidDir], [invalidDir]],
          doesOptionalPathExistCalls: [[{ directory: invalidDir }], [{ directory }]],
          consoleErrorCalls: [[colors.red(`Invalid directory "${invalidDir}", does not exist.`)]],
        },
      })
    })
    it('returns directory if valid non-interactive', async () => {
      const directory = '/tell/me/more'
      await testGetDirectory({
        input: {
          inputs: {
            directory,
          },
          doesOptionalPathExistMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: directory },
          doesOptionalPathExistCalls: [[{ directory }]],
        },
      })
    })
    it('returns directory if valid interactive', async () => {
      const directory = '/its/headed/right/for/us'
      await testGetDirectory({
        input: {
          getDirectoryMocks: [{ resolve: directory }],
          doesOptionalPathExistMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: directory },
          getDirectoryCalls: [[undefined]],
          doesOptionalPathExistCalls: [[{ directory }]],
        },
      })
    })
  })
  describe('doesOptionalPathExist', () => {
    it('returns true if directory undefined', async () => {
      await testDoesOptionalPathExist({
        input: {
          directory: undefined,
        },
        output: {
          expected: { resolve: true },
        },
      })
    })
    it('returns true if directory empty string', async () => {
      await testDoesOptionalPathExist({
        input: {
          directory: '',
        },
        output: {
          expected: { resolve: true },
        },
      })
    })
    it('returns false if path does not exist', async () => {
      const directory = '/yellow/brick/road'
      await testDoesOptionalPathExist({
        input: {
          directory,
          pathExistsMocks: [{ resolve: false }],
        },
        output: {
          expected: { resolve: false },
          pathExistsCalls: [[directory]],
        },
      })
    })
    it('returns true if path exists', async () => {
      const directory = '/the/road/goes/ever/on/and/on'
      await testDoesOptionalPathExist({
        input: {
          directory,
          pathExistsMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: true },
          pathExistsCalls: [[directory]],
        },
      })
    })
  })
  describe('configureInstalledVersion', () => {
    it('returns undefined if configureExecutable returns undefined', async () => {
      const directory = ''
      await testConfigureInstalledVersion({
        input: {
          getDirectoryMocks: [{ resolve: directory }],
          configureExecutableMocks: [{ resolve: undefined }],
        },
        output: {
          expected: {
            resolve: undefined,
          },
          getDirectoryCalls: [[{ existingDirectory: undefined, inputs: undefined }]],
          configureExecutableCalls: [[{ existingExecutable: undefined, directory, inputs: undefined }]],
        },
      })
    })
    it('returns installed version if required inputs', async () => {
      const description = 'required inputs'
      const directory = ''
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
          getDirectoryMocks: [{ resolve: directory }],
          configureExecutableMocks: [{ resolve: executable }],
          getInstalledVersionMocks: [{ resolve: installedVersion }],
        },
        output: {
          expected: {
            resolve: {
              directory,
              executable,
              args: '',
              shell: '',
              installedRegex,
            },
          },
          getDirectoryCalls: [[{ existingDirectory: undefined, inputs }]],
          configureExecutableCalls: [
            [
              {
                directory,
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
      const directory = ''
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
          getDirectoryMocks: [{ resolve: directory }],
          configureExecutableMocks: [{ resolve: executable }],
          getInstalledVersionMocks: [{ resolve: installedVersion }],
        },
        output: {
          expected: {
            resolve: {
              directory,
              executable,
              args: '',
              shell: '',
              installedRegex,
            },
          },
          getDirectoryCalls: [[{ existingDirectory: undefined, inputs }]],
          configureExecutableCalls: [
            [
              {
                directory,
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
          getDirectoryMocks: [{ resolve: undefined }],
          configureExecutableMocks: [{ resolve: executable }],
        },
        output: {
          expected: { reject: 'Option "installedRegex" must be non-empty string' },
          getDirectoryCalls: [[{ existingDirectory: undefined, inputs }]],
          configureExecutableCalls: [
            [
              {
                directory: undefined,
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
      const directory = ''
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
          getDirectoryMocks: [{ resolve: directory }],
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
              directory,
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          getDirectoryCalls: [[{ existingDirectory: undefined, inputs }]],
          configureExecutableCalls: [
            [
              {
                directory,
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
      const directory = ''
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
          getDirectoryMocks: [{ resolve: directory }, { resolve: directory }],
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
              directory,
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          getDirectoryCalls: [
            [{ existingDirectory: undefined, inputs }],
            [{ existingDirectory: directory, inputs: undefined }],
          ],
          configureExecutableCalls: [
            [
              {
                directory,
                existingExecutable: undefined,
                inputs,
              },
            ],
            [
              {
                directory,
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
      const directory = ''
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
          getDirectoryMocks: [{ resolve: directory }, { resolve: directory }],
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
              directory,
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          getDirectoryCalls: [
            [{ existingDirectory: undefined, inputs: undefined }],
            [{ existingDirectory: directory, inputs: undefined }],
          ],
          configureExecutableCalls: [
            [
              {
                directory,
                existingExecutable: undefined,
                inputs: undefined,
              },
            ],
            [
              {
                directory,
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
      const directory = ''
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
          getDirectoryMocks: [{ resolve: directory }, { resolve: directory }],
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
              directory,
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          getDirectoryCalls: [
            [{ existingDirectory: undefined, inputs }],
            [{ existingDirectory: directory, inputs: undefined }],
          ],
          configureExecutableCalls: [
            [
              {
                directory,
                existingExecutable: undefined,
                inputs,
              },
            ],
            [
              {
                directory,
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
      const directory = ''
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
          getDirectoryMocks: [{ resolve: directory }, { resolve: directory }],
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
              directory,
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          getDirectoryCalls: [
            [{ existingDirectory: undefined, inputs: undefined }],
            [{ existingDirectory: directory, inputs: undefined }],
          ],
          configureExecutableCalls: [
            [
              {
                directory,
                existingExecutable: undefined,
                inputs: undefined,
              },
            ],
            [
              {
                directory,
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
      const directory = ''
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
          getDirectoryMocks: [{ resolve: directory }],
          configureExecutableMocks: [{ resolve: executable }],
          getInstalledRegexMocks: [{ resolve: installedRegex }],
          getInstalledVersionMocks: [{ reject: installedError }],
        },
        output: {
          expected: { reject: `Could not determine installed version: ${installedError}` },
          getDirectoryCalls: [[{ existingDirectory: undefined, inputs }]],
          configureExecutableCalls: [
            [
              {
                directory,
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
      const directory = ''
      const executable = {
        command: `${description} executable`,
      }
      const args = ''
      const shell = ''
      const installedRegex = `${description} installedRegex`
      const installedError = `${description} installed error`
      await testConfigureInstalledVersion({
        input: {
          getDirectoryMocks: [{ resolve: directory }],
          configureExecutableMocks: [{ resolve: executable }],
          getArgsMocks: [{ resolve: args }, { resolve: args }],
          getshellMocks: [{ resolve: shell }],
          getInstalledRegexMocks: [{ resolve: installedRegex }],
          getInstalledVersionMocks: [{ reject: installedError }],
          getReattemptVersionMocks: [{ resolve: false }],
        },
        output: {
          expected: { resolve: undefined },
          getDirectoryCalls: [[{ existingDirectory: undefined, inputs: undefined }]],
          configureExecutableCalls: [
            [
              {
                directory,
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
      const directory = `${description} directory`
      const executable = {
        command: `${description} executable`,
      }
      const args = `${description} args`
      const shell = `${description} shell`
      const installedRegex = `${description} installedRegex`
      const installedVersion = `${description} installed version`
      const inputs = {
        directory,
        executable,
        args,
        shell,
        installedRegex,
      }
      await testConfigureInstalledVersion({
        input: {
          inputs,
          getDirectoryMocks: [{ resolve: directory }],
          configureExecutableMocks: [{ resolve: executable }],
          getInstalledVersionMocks: [{ resolve: installedVersion }],
        },
        output: {
          expected: {
            resolve: {
              directory,
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          getDirectoryCalls: [[{ existingDirectory: undefined, inputs }]],
          configureExecutableCalls: [
            [
              {
                directory,
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
      const directory = `${description} directory`
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
          getDirectoryMocks: [{ resolve: directory }],
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
              directory,
              executable,
              args,
              shell,
              installedRegex,
            },
          },
          getDirectoryCalls: [[{ existingDirectory: undefined, inputs }]],
          configureExecutableCalls: [
            [
              {
                directory,
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
    it('calls configureStatic if static executable input no directory', async () => {
      const staticExecutable = {
        command: 'static exectuable input no directory',
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
    it('calls configureStatic if static executable input with undefined directory', async () => {
      const staticExecutable = {
        command: 'static exectuable input undefined directory',
      }
      const inputs = {
        executable: staticExecutable,
      }
      await testConfigureExecutable({
        input: {
          inputs,
          directory: undefined,
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
    it('calls configureStatic if static executable input with empty string directory', async () => {
      const staticExecutable = {
        command: 'static exectuable input empty string directory',
      }
      const inputs = {
        executable: staticExecutable,
      }
      await testConfigureExecutable({
        input: {
          inputs,
          directory: '',
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
    it('calls configureStatic if static executable input with non-empty string directory', async () => {
      const staticExecutable = {
        command: 'static exectuable input non-empty string directory',
      }
      const inputs = {
        executable: staticExecutable,
      }
      await testConfigureExecutable({
        input: {
          inputs,
          directory: '/tic/tac/toe',
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
    it('calls configureDynamic if dynamic executable input without directory', async () => {
      const regex = 'dynamic exectuable input no directory regex'
      const inputs = {
        executable: { regex },
      }
      await testConfigureExecutable({
        input: {
          inputs,
          configureDynamicMocks: [{ resolve: { regex } }],
        },
        output: {
          expected: { regex },
          configureDynamicCalls: [
            [
              {
                inputs,
                directory: undefined,
                existingRegex: undefined,
              },
            ],
          ],
        },
      })
    })
    it('calls configureDynamic if dynamic executable input with undefined directory', async () => {
      const regex = 'dynamic exectuable input undefined directory regex'
      const directory = undefined
      const inputs = {
        executable: { regex },
      }
      await testConfigureExecutable({
        input: {
          inputs,
          directory,
          configureDynamicMocks: [{ resolve: { regex } }],
        },
        output: {
          expected: { regex },
          configureDynamicCalls: [
            [
              {
                inputs,
                directory,
                existingRegex: undefined,
              },
            ],
          ],
        },
      })
    })
    it('calls configureDynamic if dynamic executable input with empty string directory', async () => {
      const regex = 'dynamic exectuable input empty string directory regex'
      const directory = ''
      const inputs = {
        executable: { regex },
      }
      await testConfigureExecutable({
        input: {
          inputs,
          directory,
          configureDynamicMocks: [{ resolve: { regex } }],
        },
        output: {
          expected: { regex },
          configureDynamicCalls: [
            [
              {
                inputs,
                directory,
                existingRegex: undefined,
              },
            ],
          ],
        },
      })
    })
    it('calls configureDynamic if no executable input and existing dynamic', async () => {
      const regex = 'no exectuable input existing regex'
      const inputs = {
        executable: { regex },
      }
      await testConfigureExecutable({
        input: {
          inputs,
          existingExecutable: { regex },
          configureDynamicMocks: [{ resolve: { regex } }],
        },
        output: {
          expected: { regex },
          configureDynamicCalls: [
            [
              {
                inputs,
                directory: undefined,
                existingRegex: regex,
              },
            ],
          ],
        },
      })
    })
    it('calls configureDynamic if no executable input and prompts as dynamic', async () => {
      const regex = 'no exectuable input and prompt regex'
      await testConfigureExecutable({
        input: {
          getCommandTypeMocks: [{ resolve: 'dynamic' }],
          configureDynamicMocks: [{ resolve: { regex } }],
        },
        output: {
          expected: { regex },
          getCommandTypeCalls: [['static']],
          configureDynamicCalls: [
            [
              {
                inputs: undefined,
                directory: undefined,
                existingRegex: undefined,
              },
            ],
          ],
          consoleLogCalls: [...getCommandTypeDescriptions()],
        },
      })
    })
    it('calls configureDynamic if no executable and existing dynamic input and prompts as dynamic', async () => {
      const regex = 'no exectuable and existing dynamic input and prompt regex'
      await testConfigureExecutable({
        input: {
          existingExecutable: { regex },
          getCommandTypeMocks: [{ resolve: 'dynamic' }],
          configureDynamicMocks: [{ resolve: { regex } }],
        },
        output: {
          expected: { regex },
          getCommandTypeCalls: [['dynamic']],
          configureDynamicCalls: [
            [
              {
                inputs: undefined,
                directory: undefined,
                existingRegex: regex,
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
    it('returns dynamic if regex input without directory', async () => {
      const regex = 'regex input no directory'
      const resolvedExecutable = 'regex input no directory resolved'
      const inputs = {
        executable: { regex },
      }
      await testConfigureDynamic({
        input: {
          inputs,
          getDynamicExecutableMocks: [{ resolve: resolvedExecutable }],
        },
        output: {
          expected: { resolve: { regex } },
          getDynamicExecutableCalls: [
            [
              {
                directory: undefined,
                regex,
              },
            ],
          ],
          consoleLogCalls: [[`Resolved executable file: "${resolvedExecutable}"`]],
        },
      })
    })
    it('returns dynamic if regex input with undefined directory', async () => {
      const regex = 'regex input undefined directory'
      const directory = undefined
      const resolvedExecutable = 'regex input undefined directory resolved'
      const inputs = {
        executable: { regex },
      }
      await testConfigureDynamic({
        input: {
          inputs,
          directory,
          getDynamicExecutableMocks: [{ resolve: resolvedExecutable }],
        },
        output: {
          expected: { resolve: { regex } },
          getDynamicExecutableCalls: [
            [
              {
                directory,
                regex,
              },
            ],
          ],
          consoleLogCalls: [[`Resolved executable file: "${resolvedExecutable}"`]],
        },
      })
    })
    it('returns dynamic if regex input with empty string directory', async () => {
      const regex = 'regex input empty directory'
      const directory = ''
      const resolvedExecutable = 'regex input empty directory resolved'
      const inputs = {
        executable: { regex },
      }
      await testConfigureDynamic({
        input: {
          inputs,
          directory,
          getDynamicExecutableMocks: [{ resolve: resolvedExecutable }],
        },
        output: {
          expected: { resolve: { regex } },
          getDynamicExecutableCalls: [
            [
              {
                directory,
                regex,
              },
            ],
          ],
          consoleLogCalls: [[`Resolved executable file: "${resolvedExecutable}"`]],
        },
      })
    })
    it('returns dynamic if regex input with non-empty string directory', async () => {
      const regex = 'regex non-empty directory input'
      const directory = '/eyes/on/target'
      const resolvedExecutable = 'regex input non-empty directory resolved'
      const inputs = {
        executable: { regex },
      }
      await testConfigureDynamic({
        input: {
          inputs,
          directory,
          getDynamicExecutableMocks: [{ resolve: resolvedExecutable }],
        },
        output: {
          expected: { resolve: { regex } },
          getDynamicExecutableCalls: [
            [
              {
                directory,
                regex,
              },
            ],
          ],
          consoleLogCalls: [[`Resolved executable file: "${resolvedExecutable}"`]],
        },
      })
    })
    it('returns dynamic if no regex input and existing regex', async () => {
      const regex = 'input regex with existing'
      const resolvedExecutable = 'regex input resolved with existing'
      await testConfigureDynamic({
        input: {
          inputs: {
            interactive: false,
          },
          existingRegex: regex,
          getDynamicExecutableMocks: [{ resolve: resolvedExecutable }],
        },
        output: {
          expected: { resolve: { regex } },
          getDynamicExecutableCalls: [
            [
              {
                directory: undefined,
                regex,
              },
            ],
          ],
          consoleLogCalls: [[`Resolved executable file: "${resolvedExecutable}"`]],
        },
      })
    })
    it('throws error if no regex input and no existing regex', async () => {
      await testConfigureDynamic({
        input: {
          inputs: {
            interactive: false,
          },
        },
        output: {
          expected: { reject: 'The executable type "dynamic" requires a value passed into the "--regex" option.' },
        },
      })
    })
    it('returns dynamic if no executable input and prompts for regex', async () => {
      const regex = 'no executable input prompt regex'
      const resolvedExecutable = 'no executable input prompt resolved'
      await testConfigureDynamic({
        input: {
          getRegexMocks: [{ resolve: regex }],
          getDynamicExecutableMocks: [{ resolve: resolvedExecutable }],
          getExecutableCorrectMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: { regex } },
          getRegexCalls: [
            [
              {
                directory: undefined,
                existingRegex: undefined,
              },
            ],
          ],
          getDynamicExecutableCalls: [
            [
              {
                directory: undefined,
                regex,
              },
            ],
          ],
          getExecutableCorrectCalls: [[]],
          consoleLogCalls: [[`Resolved executable file: "${resolvedExecutable}"`]],
        },
      })
    })
    it('dynamic executable incorrect from inputs can be reconfigured with prompts no directory', async () => {
      const initialRegex = 'incorrect from inputs reconfigured with prompts no directory regex'
      const reconfiguredRegex = 'incorrect from inputs reconfigured with prompts no directory regex reconfigured'
      const initialResolvedExecutable = 'incorrect from inputs reconfigured with prompts no directory resolved initial'
      const reconfiguredResolvedExecutable =
        'incorrect from inputs reconfigured with prompts no directory resolved reconfigured'
      await testConfigureDynamic({
        input: {
          inputs: {
            executable: { regex: initialRegex },
            interactive: true,
          },
          getRegexMocks: [{ resolve: reconfiguredRegex }],
          getDynamicExecutableMocks: [
            { resolve: initialResolvedExecutable },
            { resolve: reconfiguredResolvedExecutable },
          ],
          getExecutableCorrectMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: { resolve: { regex: reconfiguredRegex } },
          getRegexCalls: [
            [
              {
                directory: undefined,
                existingRegex: initialRegex,
              },
            ],
          ],
          getDynamicExecutableCalls: [
            [
              {
                directory: undefined,
                regex: initialRegex,
              },
            ],
            [
              {
                directory: undefined,
                regex: reconfiguredRegex,
              },
            ],
          ],
          getExecutableCorrectCalls: [[], []],
          consoleLogCalls: [
            [`Resolved executable file: "${initialResolvedExecutable}"`],
            [`Resolved executable file: "${reconfiguredResolvedExecutable}"`],
          ],
        },
      })
    })
    it('dynamic executable incorrect from inputs can be reconfigured with prompts and directory', async () => {
      const initialRegex = 'incorrect from inputs reconfigured with prompts and directory regex'
      const reconfiguredRegex = 'incorrect from inputs reconfigured with prompts and directory regex reconfigured'
      const directory = '/sugar/were/going/down/swinging'
      const initialResolvedExecutable = 'incorrect from inputs reconfigured with prompts and directory resolved initial'
      const reconfiguredResolvedExecutable =
        'incorrect from inputs reconfigured with prompts and directory resolved reconfigured'
      await testConfigureDynamic({
        input: {
          inputs: {
            executable: { regex: initialRegex },
            interactive: true,
          },
          directory,
          getRegexMocks: [{ resolve: reconfiguredRegex }],
          getDynamicExecutableMocks: [
            { resolve: initialResolvedExecutable },
            { resolve: reconfiguredResolvedExecutable },
          ],
          getExecutableCorrectMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: { resolve: { regex: reconfiguredRegex } },
          getRegexCalls: [
            [
              {
                directory,
                existingRegex: initialRegex,
              },
            ],
          ],
          getDynamicExecutableCalls: [
            [
              {
                directory,
                regex: initialRegex,
              },
            ],
            [
              {
                directory,
                regex: reconfiguredRegex,
              },
            ],
          ],
          getExecutableCorrectCalls: [[], []],
          consoleLogCalls: [
            [`Resolved executable file: "${initialResolvedExecutable}"`],
            [`Resolved executable file: "${reconfiguredResolvedExecutable}"`],
          ],
        },
      })
    })
    it('dynamic executable incorrect from prompts can be reconfigured with prompts', async () => {
      const initialRegex = 'incorrect from prompts reconfigured with prompts regex'
      const reconfiguredRegex = 'incorrect from prompts reconfigured with prompts regex reconfigured'
      const initialResolvedExecutable = 'incorrect from prompts reconfigured with prompts initial'
      const reconfiguredResolvedExecutable = 'incorrect from prompts reconfigured with prompts reconfigured'
      await testConfigureDynamic({
        input: {
          getRegexMocks: [{ resolve: initialRegex }, { resolve: reconfiguredRegex }],
          getDynamicExecutableMocks: [
            { resolve: initialResolvedExecutable },
            { resolve: reconfiguredResolvedExecutable },
          ],
          getExecutableCorrectMocks: [{ resolve: false }, { resolve: true }],
        },
        output: {
          expected: { resolve: { regex: reconfiguredRegex } },
          getRegexCalls: [
            [
              {
                directory: undefined,
                existingRegex: undefined,
              },
            ],
            [
              {
                directory: undefined,
                existingRegex: initialRegex,
              },
            ],
          ],
          getDynamicExecutableCalls: [
            [
              {
                directory: undefined,
                regex: initialRegex,
              },
            ],
            [
              {
                directory: undefined,
                regex: reconfiguredRegex,
              },
            ],
          ],
          getExecutableCorrectCalls: [[], []],
          consoleLogCalls: [
            [`Resolved executable file: "${initialResolvedExecutable}"`],
            [`Resolved executable file: "${reconfiguredResolvedExecutable}"`],
          ],
        },
      })
    })
    it('throws getDynamicExecutable error if non-interactive', async () => {
      const regex = 'getDynamicExecutable error non-interactive regex'
      const getDynamicExecutableError = 'getDynamicExecutable error non-interactive'
      await testConfigureDynamic({
        input: {
          inputs: {
            executable: { regex },
          },
          getDynamicExecutableMocks: [{ reject: getDynamicExecutableError }],
        },
        output: {
          expected: { reject: getDynamicExecutableError },
          getDynamicExecutableCalls: [
            [
              {
                directory: undefined,
                regex,
              },
            ],
          ],
        },
      })
    })
    it('get dynamic executable error from inputs can be reconfigured with prompts', async () => {
      const initialRegex = 'error from inputs reconfigured with prompts regex'
      const reconfiguredRegex = 'error from inputs reconfigured with prompts regex reconfigured'
      const resolvedExecutableError = 'error from inputs reconfigured with prompts error'
      const reconfiguredResolvedExecutable = 'error from inputs reconfigured with prompts reconfigured'
      await testConfigureDynamic({
        input: {
          inputs: {
            executable: { regex: initialRegex },
            interactive: true,
          },
          getRegexMocks: [{ resolve: reconfiguredRegex }],
          getDynamicExecutableMocks: [{ reject: resolvedExecutableError }, { resolve: reconfiguredResolvedExecutable }],
          getExecutableCorrectMocks: [{ resolve: true }],
          getReattemptDynamicMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: { regex: reconfiguredRegex } },
          getRegexCalls: [
            [
              {
                directory: undefined,
                existingRegex: initialRegex,
              },
            ],
          ],
          getDynamicExecutableCalls: [
            [
              {
                directory: undefined,
                regex: initialRegex,
              },
            ],
            [
              {
                directory: undefined,
                regex: reconfiguredRegex,
              },
            ],
          ],
          getExecutableCorrectCalls: [[]],
          getReattemptDynamicCalls: [[]],
          consoleLogCalls: [[`Resolved executable file: "${reconfiguredResolvedExecutable}"`]],
          consoleErrorCalls: [[colors.red(resolvedExecutableError)]],
        },
      })
    })
    it('get dynamic executable error from prompts can be reconfigured with prompts', async () => {
      const initialRegex = 'error from prompts reconfigured with prompts regex'
      const reconfiguredRegex = 'error from prompts reconfigured with prompts regex reconfigured'
      const resolvedExecutableError = 'error from prompts reconfigured with prompts error'
      const reconfiguredResolvedExecutable = 'error from prompts reconfigured with prompts reconfigured'
      await testConfigureDynamic({
        input: {
          getRegexMocks: [{ resolve: initialRegex }, { resolve: reconfiguredRegex }],
          getDynamicExecutableMocks: [{ reject: resolvedExecutableError }, { resolve: reconfiguredResolvedExecutable }],
          getExecutableCorrectMocks: [{ resolve: true }],
          getReattemptDynamicMocks: [{ resolve: true }],
        },
        output: {
          expected: { resolve: { regex: reconfiguredRegex } },
          getRegexCalls: [
            [
              {
                directory: undefined,
                existingRegex: undefined,
              },
            ],
            [
              {
                directory: undefined,
                existingRegex: initialRegex,
              },
            ],
          ],
          getDynamicExecutableCalls: [
            [
              {
                directory: undefined,
                regex: initialRegex,
              },
            ],
            [
              {
                directory: undefined,
                regex: reconfiguredRegex,
              },
            ],
          ],
          getExecutableCorrectCalls: [[]],
          getReattemptDynamicCalls: [[]],
          consoleLogCalls: [[`Resolved executable file: "${reconfiguredResolvedExecutable}"`]],
          consoleErrorCalls: [[colors.red(resolvedExecutableError)]],
        },
      })
    })
    it('get dynamic executable error from inputs without reattempt returns undefined', async () => {
      const regex = 'error from inputs without reattempt regex'
      const resolvedExecutableError = 'error from inputs without reattempt error'
      await testConfigureDynamic({
        input: {
          inputs: {
            executable: { regex },
            interactive: true,
          },
          getDynamicExecutableMocks: [{ reject: resolvedExecutableError }],
          getReattemptDynamicMocks: [{ resolve: false }],
        },
        output: {
          expected: { resolve: undefined },
          getDynamicExecutableCalls: [
            [
              {
                directory: undefined,
                regex,
              },
            ],
          ],
          getReattemptDynamicCalls: [[]],
          consoleErrorCalls: [[colors.red(resolvedExecutableError)]],
        },
      })
    })
    it('get dynamic executable error from prompts without reattempt returns undefined', async () => {
      const regex = 'error from prompts without reattempt regex'
      const resolvedExecutableError = 'error from prompts reconfigured with prompts error'
      await testConfigureDynamic({
        input: {
          getRegexMocks: [{ resolve: regex }],
          getDynamicExecutableMocks: [{ reject: resolvedExecutableError }],
          getReattemptDynamicMocks: [{ resolve: false }],
        },
        output: {
          expected: { resolve: undefined },
          getRegexCalls: [
            [
              {
                directory: undefined,
                existingRegex: undefined,
              },
            ],
          ],
          getDynamicExecutableCalls: [
            [
              {
                directory: undefined,
                regex,
              },
            ],
          ],
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

interface TestGetDirectoryInput {
  inputs?: AddInputs
  existingDirectory?: string | undefined
  getDirectoryMocks?: Response[]
  doesOptionalPathExistMocks?: Response[]
}

interface TestGetDirectoryOutput {
  expected: Response
  getDirectoryCalls?: ExpectedCalls[][]
  doesOptionalPathExistCalls?: ExpectedCalls[][]
  consoleErrorCalls?: (string[] | undefined)[]
}

async function testGetDirectory({
  input,
  output,
}: {
  input: TestGetDirectoryInput
  output: TestGetDirectoryOutput
}): Promise<void> {
  const methodParams: any = {}
  if (input.inputs) {
    methodParams.inputs = input.inputs
  }
  if (Object.keys(input).includes('existingDirectory')) {
    methodParams.existingDirectory = input.existingDirectory
  }
  const getDirectorySpy = TestUtil.mockResponses({
    spy: jest.spyOn(AddPrompts, 'getDirectory'),
    responses: input.getDirectoryMocks || [],
  })
  const doesOptionalPathExistSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Add, 'doesOptionalPathExist'),
    responses: input.doesOptionalPathExistMocks || [],
  })
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  if (output.expected.reject) {
    await expect(Add.getDirectory(methodParams)).rejects.toThrow(output.expected.reject)
  } else {
    await expect(Add.getDirectory(methodParams)).resolves.toBe(output.expected.resolve)
  }
  expect(getDirectorySpy.mock.calls).toEqual(output.getDirectoryCalls || [])
  expect(doesOptionalPathExistSpy.mock.calls).toEqual(output.doesOptionalPathExistCalls || [])
  expect(JSON.stringify(consoleErrorSpy.mock.calls, null, 2)).toBe(
    JSON.stringify(output.consoleErrorCalls || [], null, 2)
  )
}

interface TestDoesOptionalPathExistInput {
  directory: string | undefined
  pathExistsMocks?: Response[]
}

interface TestDoesOptionalPathExistOutput {
  expected: Response
  pathExistsCalls?: ExpectedCalls[][]
}

async function testDoesOptionalPathExist({
  input,
  output,
}: {
  input: TestDoesOptionalPathExistInput
  output: TestDoesOptionalPathExistOutput
}): Promise<void> {
  const pathExistsSpy = jest.spyOn(fs, 'pathExists')
  if (input.pathExistsMocks) {
    for (const pathExistsMock of input.pathExistsMocks) {
      pathExistsSpy.mockImplementationOnce(() => {
        return new Promise((resolve) => {
          resolve(pathExistsMock.resolve)
        })
      })
    }
  }
  await expect(
    Add.doesOptionalPathExist({
      directory: input.directory,
    })
  ).resolves.toBe(output.expected.resolve)
  expect(pathExistsSpy.mock.calls).toEqual(output.pathExistsCalls || [])
}

interface TestConfigureInstalledVersionInput {
  inputs?: AddInputs
  existingDirectory?: string
  existingExecutable?: Static | Dynamic
  existingArgs?: string
  existingShell?: string
  existingInstalledRegex?: string
  installedVersion?: string
  installedError?: string
  getDirectoryMocks?: Response[]
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
  getDirectoryCalls?: ExpectedCalls[][]
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
  if (Object.keys(input).includes('existingDirectory')) {
    methodParams.existingDirectory = input.existingDirectory
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
  const getDirectorySpy = TestUtil.mockResponses({
    spy: jest.spyOn(Add, 'getDirectory'),
    responses: input.getDirectoryMocks,
  })
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
  expect(getDirectorySpy.mock.calls).toEqual(output.getDirectoryCalls || [])
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
  directory?: string
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
  if (Object.keys(input).includes('directory')) {
    methodParams.directory = input.directory
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
  directory?: string
  existingRegex?: string
  getRegexMocks?: Response[]
  getDynamicExecutableMocks?: Response[]
  getExecutableCorrectMocks?: Response[]
  getReattemptDynamicMocks?: Response[]
}

interface TestConfigureDynamicOutput {
  expected: Response
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
  if (Object.keys(input).includes('directory')) {
    methodParams.directory = input.directory
  }
  if (input.existingRegex) {
    methodParams.existingRegex = input.existingRegex
  }
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
