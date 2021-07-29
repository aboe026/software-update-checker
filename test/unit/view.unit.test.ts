import colors from '../../src/colors'
import Software from '../../src/software'
import SoftwareList from '../../src/software-list'
import TestUtil, { ExpectedCalls, Response } from '../helpers/test-util'
import View from '../../src/view/view'

describe('View Unit Tests', () => {
  describe('showVersions', () => {
    it('no softwares prints message to add software to view', async () => {
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [{ resolve: [] }],
        },
        output: {
          loadSoftwareListCalls: [[]],
          consoleWarnCalls: [[colors.yellow('No softwares to view. Please add a software to have something to view.')]],
        },
      })
    })
    it('single valid software without update prints out table', async () => {
      const name = 'single valid view without update'
      const version = '1490'
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name,
                  executable: {
                    command: 'art',
                  },
                  args: 'drawings',
                  installedRegex: 'vitruvian man',
                  url: 'https://leonardonottheninjaturtle.com',
                  latestRegex: 'Le proporzioni del corpo umano secondo Vitruvio',
                }),
              ],
            },
          ],
          getInstalledVersionMocks: [{ resolve: version }],
          getLatestVersionMocks: [{ resolve: version }],
        },
        output: {
          expected: [
            {
              name,
              installedVersion: version,
              latestVersion: version,
              color: colors.white,
            },
          ],
          loadSoftwareListCalls: [[]],
          getInstalledVersionCalls: [[]],
          getLatestVersionCalls: [[]],
        },
      })
    })
    it('single valid software with update prints out table', async () => {
      const name = 'single valid view with update'
      const installedVersion = 'bifocal'
      const latestVersion = 'progressive'
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name,
                  executable: {
                    command: 'unis',
                  },
                  args: 'eyepiece',
                  installedRegex: 'monocle',
                  url: 'https://universe.com',
                  latestRegex: 'rich uncle pennybags',
                }),
              ],
            },
          ],
          getInstalledVersionMocks: [{ resolve: installedVersion }],
          getLatestVersionMocks: [{ resolve: latestVersion }],
        },
        output: {
          expected: [
            {
              name,
              installedVersion,
              latestVersion,
              color: colors.green,
            },
          ],
          loadSoftwareListCalls: [[]],
          getInstalledVersionCalls: [[]],
          getLatestVersionCalls: [[]],
        },
      })
    })
    it('multiple valid softwares without updates prints out table', async () => {
      const nameOne = 'multiple valid view without update first'
      const nameTwo = 'multiple valid view without update last'
      const installedVersionOne = '1'
      const latestVersionOne = '1'
      const installedVersionTwo = '2'
      const latestVersionTwo = '2'
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name: nameOne,
                  executable: {
                    command: 'jedi',
                  },
                  args: 'master',
                  installedRegex: 'windu',
                  url: 'https://theycalledmemrjedi.com',
                  latestRegex: 'General Mace Windu of the Jedi Order',
                }),
                new Software({
                  name: nameTwo,
                  executable: {
                    command: 'sith',
                  },
                  args: 'apprentice',
                  installedRegex: 'dooku',
                  url: 'https://anewdarksideisrising.com',
                  latestRegex: 'Darth Tyranus',
                }),
              ],
            },
          ],
          getInstalledVersionMocks: [{ resolve: installedVersionOne }, { resolve: installedVersionTwo }],
          getLatestVersionMocks: [{ resolve: latestVersionOne }, { resolve: latestVersionTwo }],
        },
        output: {
          expected: [
            {
              name: nameOne,
              installedVersion: installedVersionOne,
              latestVersion: latestVersionOne,
              color: colors.white,
            },
            {
              name: nameTwo,
              installedVersion: installedVersionTwo,
              latestVersion: latestVersionTwo,
              color: colors.white,
            },
          ],
          loadSoftwareListCalls: [[]],
          getInstalledVersionCalls: [[], []],
          getLatestVersionCalls: [[], []],
        },
      })
    })
    it('multiple valid softwares with updates prints out table', async () => {
      const nameOne = 'multiple valid view with update first'
      const nameTwo = 'multiple valid view with update last'
      const installedVersionOne = '7'
      const latestVersionOne = '10'
      const installedVersionTwo = '10.10'
      const latestVersionTwo = '11'
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name: nameOne,
                  executable: {
                    command: 'os',
                  },
                  args: 'windows',
                  installedRegex: 'os name',
                  url: 'https://microsoftware.com',
                  latestRegex: 'osaas',
                }),
                new Software({
                  name: nameTwo,
                  executable: {
                    command: 'operating-system',
                  },
                  args: 'mac',
                  installedRegex: 'amd64',
                  url: 'https://appleaday.com',
                  latestRegex: 'arm64',
                }),
              ],
            },
          ],
          getInstalledVersionMocks: [{ resolve: installedVersionOne }, { resolve: installedVersionTwo }],
          getLatestVersionMocks: [{ resolve: latestVersionOne }, { resolve: latestVersionTwo }],
        },
        output: {
          expected: [
            {
              name: nameOne,
              installedVersion: installedVersionOne,
              latestVersion: latestVersionOne,
              color: colors.green,
            },
            {
              name: nameTwo,
              installedVersion: installedVersionTwo,
              latestVersion: latestVersionTwo,
              color: colors.green,
            },
          ],
          loadSoftwareListCalls: [[]],
          getInstalledVersionCalls: [[], []],
          getLatestVersionCalls: [[], []],
        },
      })
    })
    it('multiple valid softwares with and without updates prints out table', async () => {
      const nameOne = 'multiple valid with and without update first'
      const nameTwo = 'multiple valid with and without update middle'
      const nameThree = 'multiple valid with and without update last'
      const installedVersionOne = 'schooner'
      const latestVersionOne = 'pint'
      const installedVersionTwo = 'dessert glass'
      const latestVersionTwo = 'dessert glass'
      const installedVersionThree = 'one finger'
      const latestVersionThree = 'two fingers'
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name: nameOne,
                  executable: {
                    command: 'booze',
                  },
                  args: 'beer',
                  installedRegex: 'irish red',
                  url: 'https://whokilledkenny.com',
                  latestRegex: 'kilkenny',
                }),
                new Software({
                  name: nameTwo,
                  executable: {
                    command: 'wine',
                  },
                  args: 'port',
                  installedRegex: 'coffee',
                  url: 'https://portly.com',
                  latestRegex: 'homemade',
                }),
                new Software({
                  name: nameThree,
                  executable: {
                    command: 'alcohol',
                  },
                  args: 'whiskey',
                  installedRegex: 'bearproof',
                  url: 'https://hucklemyberry.com',
                  latestRegex: 'glacier',
                }),
              ],
            },
          ],
          getInstalledVersionMocks: [
            { resolve: installedVersionOne },
            { resolve: installedVersionTwo },
            { resolve: installedVersionThree },
          ],
          getLatestVersionMocks: [
            { resolve: latestVersionOne },
            { resolve: latestVersionTwo },
            { resolve: latestVersionThree },
          ],
        },
        output: {
          expected: [
            {
              name: nameOne,
              installedVersion: installedVersionOne,
              latestVersion: latestVersionOne,
              color: colors.green,
            },
            {
              name: nameTwo,
              installedVersion: installedVersionTwo,
              latestVersion: latestVersionTwo,
              color: colors.white,
            },
            {
              name: nameThree,
              installedVersion: installedVersionThree,
              latestVersion: latestVersionThree,
              color: colors.green,
            },
          ],
          loadSoftwareListCalls: [[]],
          getInstalledVersionCalls: [[], [], []],
          getLatestVersionCalls: [[], [], []],
        },
      })
    })
    it('single with no installed or latest version prints out table with red row', async () => {
      const name = 'single with no installed or latest'
      const installedVersion = ''
      const latestVersion = ''
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name,
                  executable: {
                    command: 'practice',
                  },
                  args: 'spiritual',
                  installedRegex: 'silence',
                  url: 'https://shh.com',
                  latestRegex: 'monastic silence',
                }),
              ],
            },
          ],
          getInstalledVersionMocks: [{ resolve: installedVersion }],
          getLatestVersionMocks: [{ resolve: latestVersion }],
        },
        output: {
          expected: [
            {
              name,
              installedVersion: installedVersion,
              latestVersion: latestVersion,
              color: colors.red,
            },
          ],
          loadSoftwareListCalls: [[]],
          getInstalledVersionCalls: [[]],
          getLatestVersionCalls: [[]],
        },
      })
    })
    it('single with installed error prints out table with red row', async () => {
      const name = 'single with installed error'
      const installedError = 'Cannot predict the future as easily as the past'
      const latestVersion = '2020'
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name,
                  executable: {
                    command: 'park',
                  },
                  args: 'national',
                  installedRegex: 'original',
                  url: 'https://oldfaithful.com',
                  latestRegex: 'yellowstone national park',
                }),
              ],
            },
          ],
          getInstalledVersionMocks: [{ reject: installedError }],
          getLatestVersionMocks: [{ resolve: latestVersion }],
        },
        output: {
          expected: [
            {
              name,
              installedVersion: 'Error',
              latestVersion: latestVersion,
              color: colors.red,
            },
          ],
          loadSoftwareListCalls: [[]],
          getInstalledVersionCalls: [[]],
          getLatestVersionCalls: [[]],
        },
      })
    })
    it('single with latest error prints out table with red row', async () => {
      const name = 'single with latest error'
      const installedVersion = 'minas tirith'
      const latestError = 'could not find city. did you mean minas tirith?'
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name,
                  executable: {
                    command: 'middle-earth',
                  },
                  args: 'towers',
                  installedRegex: 'minas anor',
                  url: 'https://whereinmiddleearthami.com',
                  latestRegex: 'capital of gondor',
                }),
              ],
            },
          ],
          getInstalledVersionMocks: [{ resolve: installedVersion }],
          getLatestVersionMocks: [{ reject: latestError }],
        },
        output: {
          expected: [
            {
              name,
              installedVersion: installedVersion,
              latestVersion: 'Error',
              color: colors.red,
            },
          ],
          loadSoftwareListCalls: [[]],
          getInstalledVersionCalls: [[]],
          getLatestVersionCalls: [[]],
        },
      })
    })
    it('single with installed and latest error prints out table with red row', async () => {
      const name = 'single with installed and latest error'
      const installedError = 'Your record is broken'
      const latestError = 'Your record is brokener'
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name,
                  executable: {
                    command: 'audio',
                  },
                  args: 'vinyl',
                  installedRegex: 'album',
                  url: 'https://soundofabrokenrecord.com',
                  latestRegex: 'record',
                }),
              ],
            },
          ],
          getInstalledVersionMocks: [{ reject: installedError }],
          getLatestVersionMocks: [{ reject: latestError }],
        },
        output: {
          expected: [
            {
              name,
              installedVersion: 'Error',
              latestVersion: 'Error',
              color: colors.red,
            },
          ],
          loadSoftwareListCalls: [[]],
          getInstalledVersionCalls: [[]],
          getLatestVersionCalls: [[]],
        },
      })
    })
    it('multiple errors with one installed and one latest prints out table with red rows', async () => {
      const nameFirst = 'multiple errors with one installed and one latest first'
      const nameLast = 'multiple errors with one installed and one latest last'
      const installedError = 'mudcrab'
      const latestVersion = '0009B2B2'
      const installedVersion = '69'
      const latestError = 'white hood'
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name: nameFirst,
                  executable: {
                    command: 'artifacts',
                  },
                  args: 'daedric',
                  installedRegex: 'mind of madness',
                  url: 'https://sheogorathschicanery.com',
                  latestRegex: 'wabbajack',
                }),
                new Software({
                  name: nameLast,
                  executable: {
                    command: 'armor',
                  },
                  args: 'light',
                  installedRegex: 'nocturnal',
                  url: 'https://trinityrestored.com',
                  latestRegex: 'Nightingale Armor',
                }),
              ],
            },
          ],
          getInstalledVersionMocks: [{ reject: installedError }, { resolve: installedVersion }],
          getLatestVersionMocks: [{ resolve: latestVersion }, { reject: latestError }],
        },
        output: {
          expected: [
            {
              name: nameFirst,
              installedVersion: 'Error',
              latestVersion: latestVersion,
              color: colors.red,
            },
            {
              name: nameLast,
              installedVersion: installedVersion,
              latestVersion: 'Error',
              color: colors.red,
            },
          ],
          loadSoftwareListCalls: [[]],
          getInstalledVersionCalls: [[], []],
          getLatestVersionCalls: [[], []],
        },
      })
    })
    it('multiple softwares with and without updates and error prints out table', async () => {
      const nameOne = 'multiple valid without update first'
      const nameTwo = 'multiple error middle'
      const nameThree = 'multiple valid with update last'
      const installedVersionOne = '1889'
      const latestVersionOne = '1889'
      const installedErrorTwo = 'obi-wan error'
      const latestErrorTwo = 'azimuthal error'
      const installedVersionThree = 'indicative'
      const latestVersionThree = 'subjunctive'
      await testShowVersions({
        input: {
          loadSoftwareListMocks: [
            {
              resolve: [
                new Software({
                  name: nameOne,
                  executable: {
                    command: 'balls',
                  },
                  args: 'billiards',
                  installedRegex: 'stripe',
                  url: 'https://behindtheeightball.com',
                  latestRegex: 'nine',
                }),
                new Software({
                  name: nameTwo,
                  executable: {
                    command: 'mistake',
                  },
                  args: 'mixup',
                  installedRegex: 'miscue',
                  url: 'https://failure.com',
                  latestRegex: 'glitch',
                }),
                new Software({
                  name: nameThree,
                  executable: {
                    command: 'grammer',
                  },
                  args: 'tense',
                  installedRegex: '^((?!past|future).)*$',
                  url: 'https://notimelikethegift.com',
                  latestRegex: 'indicative|subjunctive',
                }),
              ],
            },
          ],
          getInstalledVersionMocks: [
            { resolve: installedVersionOne },
            { reject: installedErrorTwo },
            { resolve: installedVersionThree },
          ],
          getLatestVersionMocks: [
            { resolve: latestVersionOne },
            { reject: latestErrorTwo },
            { resolve: latestVersionThree },
          ],
        },
        output: {
          expected: [
            {
              name: nameOne,
              installedVersion: installedVersionOne,
              latestVersion: latestVersionOne,
              color: colors.white,
            },
            {
              name: nameTwo,
              installedVersion: 'Error',
              latestVersion: 'Error',
              color: colors.red,
            },
            {
              name: nameThree,
              installedVersion: installedVersionThree,
              latestVersion: latestVersionThree,
              color: colors.green,
            },
          ],
          loadSoftwareListCalls: [[]],
          getInstalledVersionCalls: [[], [], []],
          getLatestVersionCalls: [[], [], []],
        },
      })
    })
  })
})

interface ExpectedTableRow {
  name: string
  installedVersion: string
  latestVersion: string
  color: colors.Color
}

interface TestShowVersionsInput {
  loadSoftwareListMocks?: Response[]
  getInstalledVersionMocks?: Response[]
  getLatestVersionMocks?: Response[]
}

interface TestShowVersionsOutput {
  expected?: ExpectedTableRow[]
  loadSoftwareListCalls?: ExpectedCalls[][]
  getInstalledVersionCalls?: ExpectedCalls[][]
  getLatestVersionCalls?: ExpectedCalls[]
  consoleWarnCalls?: (string[] | undefined)[]
}

async function testShowVersions({
  input,
  output,
}: {
  input: TestShowVersionsInput
  output: TestShowVersionsOutput
}): Promise<void> {
  const loadSoftwareListSpy = TestUtil.mockResponses({
    spy: jest.spyOn(SoftwareList, 'load'),
    responses: input.loadSoftwareListMocks,
  })
  const getInstalledVersionSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Software.prototype, 'getInstalledVersion'),
    responses: input.getInstalledVersionMocks,
  })
  const getLatestVersionSpy = TestUtil.mockResponses({
    spy: jest.spyOn(Software.prototype, 'getLatestVersion'),
    responses: input.getLatestVersionMocks,
  })
  const consoleTableSpy = jest.spyOn(console, 'table').mockImplementation()
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  await expect(View.showVersions()).resolves.toBe(undefined)
  expect(loadSoftwareListSpy.mock.calls).toEqual(output.loadSoftwareListCalls || [])
  expect(getInstalledVersionSpy.mock.calls).toEqual(output.getInstalledVersionCalls || [])
  expect(getLatestVersionSpy.mock.calls).toEqual(output.getLatestVersionCalls || [])
  expect(JSON.stringify(consoleWarnSpy.mock.calls, null, 2)).toBe(
    JSON.stringify(output.consoleWarnCalls || [], null, 2)
  )
  if (output.expected) {
    TestUtil.validateTablePrintout(JSON.stringify(consoleTableSpy.mock.calls[0][0], null, 2), output.expected)
  }
}
