import colors from 'colors'
import inquirer, { Answers, DistinctQuestion, Question, QuestionCollection } from 'inquirer'

import * as executable from '../../src/executable'
import Prompts from '../../src/prompts'
import Software from '../../src/software'
import SoftwareList from '../../src/software-list'
import TestUtil from '../helpers/test-util'

jest.mock('inquirer')
const mockedInquirer = inquirer as jest.Mocked<typeof inquirer>

describe('Prompts Unit Tests', () => {
  describe('home', () => {
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
      await testHomePromptSelection(['delete', 'exit'], {
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
      await testHomePromptSelection(['delete', 'delete', 'exit'], {
        deleteCalls: 2,
      })
    })
    it('all options then exit calls the all methods once then exits', async () => {
      await testHomePromptSelection(['add', 'view', 'edit', 'delete', 'exit'], {
        configureCalls: 1,
        viewCalls: 1,
        editCalls: 1,
        deleteCalls: 1,
      })
    })
    it('all options in scattered order then exit calls the all methods once then exits', async () => {
      await testHomePromptSelection(['delete', 'edit', 'add', 'view', 'exit'], {
        configureCalls: 1,
        viewCalls: 1,
        editCalls: 1,
        deleteCalls: 1,
      })
    })
    it('all options twice through then exit calls the all methods twice then exits', async () => {
      await testHomePromptSelection(['add', 'view', 'edit', 'delete', 'add', 'view', 'edit', 'delete', 'exit'], {
        configureCalls: 2,
        viewCalls: 2,
        editCalls: 2,
        deleteCalls: 2,
      })
    })
  })
  describe('configure', () => {
    it('add new with valid configuration', async () => {
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([])
      const addSpy = jest.spyOn(SoftwareList, 'add').mockResolvedValue([])
      const editSpy = jest.spyOn(SoftwareList, 'edit').mockResolvedValue([])
      const software = new Software({
        name: 'Glamdring',
        executable: {
          command: 'swords',
        },
        args: 'elvish',
        installedRegex: 'foe-hammer',
        shellOverride: '',
        url: 'https://lotr-swords.com',
        latestRegex: 'beater',
      })
      mockedInquirer.prompt.mockResolvedValueOnce({ name: software.name })
      jest.spyOn(Prompts, 'configureInstalledVersion').mockResolvedValue({
        executable: software.executable,
        args: software.args,
        installedRegex: software.installedRegex,
      })
      jest.spyOn(Prompts, 'configureLatestVersion').mockResolvedValue({
        url: software.url,
        latestRegex: software.latestRegex,
      })
      await expect(Prompts.configure()).resolves.toStrictEqual(undefined)
      expect(JSON.stringify(addSpy.mock.calls, null, 2)).toStrictEqual(JSON.stringify([[software]], null, 2))
      expect(editSpy.mock.calls.length).toBe(0)
    })
    it('add new with initial taken name requires re-prompt', async () => {
      const existingSoftware = new Software({
        name: 'spoooky',
        executable: {
          command: 'calendar',
        },
        args: 'months',
        installedRegex: 'october',
        shellOverride: '',
        url: 'https://months.com',
        latestRegex: 'halloween',
      })
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([existingSoftware])
      const addSpy = jest.spyOn(SoftwareList, 'add').mockResolvedValue([])
      const editSpy = jest.spyOn(SoftwareList, 'edit').mockResolvedValue([])
      const software = new Software({
        name: 'tissue?',
        executable: {
          command: 'snowwhite',
        },
        args: 'dwarves',
        installedRegex: 'hay fever',
        shellOverride: '',
        url: 'https://dwarfshortlist.com',
        latestRegex: 'sneezy',
      })
      const consolemock = jest.spyOn(console, 'error').mockImplementation()
      const promptMocks = mockedInquirer.prompt
        .mockResolvedValueOnce({ name: existingSoftware.name })
        .mockResolvedValueOnce({ name: software.name })
      jest.spyOn(Prompts, 'configureInstalledVersion').mockResolvedValue({
        executable: software.executable,
        args: software.args,
        installedRegex: software.installedRegex,
      })
      jest.spyOn(Prompts, 'configureLatestVersion').mockResolvedValue({
        url: software.url,
        latestRegex: software.latestRegex,
      })
      await expect(Prompts.configure()).resolves.toStrictEqual(undefined)
      expect(promptMocks.mock.calls.length).toBe(2)
      expect(JSON.stringify(consolemock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Invalid name '${existingSoftware.name}', already in use.`.red]], null, 2)
      )
      expect(JSON.stringify(addSpy.mock.calls, null, 2)).toBe(JSON.stringify([[software]], null, 2))
      expect(editSpy.mock.calls.length).toBe(0)
    })
    it('edit existing with different name saves', async () => {
      const existingSoftware = new Software({
        name: 'you could be drinking whole if you wanted to',
        executable: {
          command: 'milks',
        },
        args: 'percentages',
        installedRegex: '1',
        shellOverride: '',
        url: 'https://milkbythenumbers.com',
        latestRegex: '1%',
      })
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([existingSoftware])
      const addSpy = jest.spyOn(SoftwareList, 'add').mockResolvedValue([])
      const editSpy = jest.spyOn(SoftwareList, 'edit').mockResolvedValue([])
      const software = new Software({
        name: 'mirage',
        executable: {
          command: 'deserts',
        },
        args: 'african',
        installedRegex: 'the great one',
        shellOverride: '',
        url: 'https://desertcourse.com',
        latestRegex: 'sahara',
      })
      mockedInquirer.prompt.mockResolvedValueOnce({ name: software.name })
      jest.spyOn(Prompts, 'configureInstalledVersion').mockResolvedValue({
        executable: software.executable,
        args: software.args,
        installedRegex: software.installedRegex,
      })
      jest.spyOn(Prompts, 'configureLatestVersion').mockResolvedValue({
        url: software.url,
        latestRegex: software.latestRegex,
      })
      await expect(Prompts.configure(existingSoftware)).resolves.toStrictEqual(undefined)
      expect(addSpy.mock.calls.length).toBe(0)
      expect(JSON.stringify(editSpy.mock.calls, null, 2)).toBe(JSON.stringify([[existingSoftware, software]], null, 2))
    })
    it('edit existing with same name saves', async () => {
      const name = 'color me surprised'
      const existingSoftware = new Software({
        name,
        executable: {
          command: 'colors',
        },
        args: 'green',
        installedRegex: 'baja blast',
        shellOverride: '',
        url: 'https://colorwheel.com',
        latestRegex: '#63FFE0',
      })
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([existingSoftware])
      const addSpy = jest.spyOn(SoftwareList, 'add').mockResolvedValue([])
      const editSpy = jest.spyOn(SoftwareList, 'edit').mockResolvedValue([])
      const software = new Software({
        name,
        executable: {
          command: 'palette',
        },
        args: 'licorice',
        installedRegex: 'red',
        shellOverride: '',
        url: 'https://candycolors.com',
        latestRegex: '#af3c4d',
      })
      mockedInquirer.prompt.mockResolvedValueOnce({ name })
      jest.spyOn(Prompts, 'configureInstalledVersion').mockResolvedValue({
        executable: software.executable,
        args: software.args,
        installedRegex: software.installedRegex,
      })
      jest.spyOn(Prompts, 'configureLatestVersion').mockResolvedValue({
        url: software.url,
        latestRegex: software.latestRegex,
      })
      await expect(Prompts.configure(existingSoftware)).resolves.toStrictEqual(undefined)
      expect(addSpy.mock.calls.length).toBe(0)
      expect(JSON.stringify(editSpy.mock.calls, null, 2)).toBe(JSON.stringify([[existingSoftware, software]], null, 2))
    })
    it('edit existing with initial taken name requires re-prompt', async () => {
      const existingSoftware = new Software({
        name: 'winters delight',
        executable: {
          command: 'weather',
        },
        args: 'precipitation',
        installedRegex: 'snow',
        shellOverride: '',
        url: 'https://atmosphericeffects.com',
        latestRegex: 'crystalline',
      })
      const software = new Software({
        name: 'frankfurter phenomenon',
        executable: {
          command: 'illusions',
        },
        args: 'optical',
        installedRegex: 'sun dog',
        shellOverride: '',
        url: 'https://eyellusions.com',
        latestRegex: 'parhelion',
      })
      const editedSoftware = new Software({
        name: software.name,
        executable: {
          command: 'meteorology',
        },
        args: 'optical-phenomenon',
        installedRegex: 'parhelion',
        shellOverride: '',
        url: 'https://sunnydoglight.com',
        latestRegex: 'mock sun',
      })
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([existingSoftware, software])
      const addSpy = jest.spyOn(SoftwareList, 'add').mockResolvedValue([])
      const editSpy = jest.spyOn(SoftwareList, 'edit').mockResolvedValue([])
      const consolemock = jest.spyOn(console, 'error').mockImplementation()
      const promptMocks = mockedInquirer.prompt
        .mockResolvedValueOnce({ name: existingSoftware.name })
        .mockResolvedValueOnce({ name: editedSoftware.name })
      jest.spyOn(Prompts, 'configureInstalledVersion').mockResolvedValue({
        executable: editedSoftware.executable,
        args: editedSoftware.args,
        installedRegex: editedSoftware.installedRegex,
      })
      jest.spyOn(Prompts, 'configureLatestVersion').mockResolvedValue({
        url: editedSoftware.url,
        latestRegex: editedSoftware.latestRegex,
      })
      await expect(Prompts.configure(software)).resolves.toStrictEqual(undefined)
      expect(promptMocks.mock.calls.length).toBe(2)
      expect(JSON.stringify(consolemock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Invalid name '${existingSoftware.name}', already in use.`.red]], null, 2)
      )
      expect(addSpy.mock.calls.length).toBe(0)
      expect(JSON.stringify(editSpy.mock.calls, null, 2)).toBe(JSON.stringify([[software, editedSoftware]], null, 2))
    })
    it('no configure installed version does not configure latest or call add or edit', async () => {
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([])
      const addSpy = jest.spyOn(SoftwareList, 'add').mockResolvedValue([])
      const editSpy = jest.spyOn(SoftwareList, 'edit').mockResolvedValue([])
      const software = new Software({
        name: 'sic semper tyrannis',
        executable: {
          command: 'dinosaurs',
        },
        args: 'theropods',
        installedRegex: 't-rex',
        url: 'https://dinocylopedia.com',
        latestRegex: 'tyrannosaurus rex',
      })
      mockedInquirer.prompt.mockResolvedValueOnce({ name: software.name })
      jest.spyOn(Prompts, 'configureInstalledVersion').mockResolvedValue(undefined)
      const configureLatestMock = jest.spyOn(Prompts, 'configureLatestVersion').mockResolvedValue({
        url: 'https://dinomite.org',
        latestRegex: 'tyrannosaurus',
      })
      await expect(Prompts.configure()).resolves.toStrictEqual(undefined)
      expect(addSpy.mock.calls.length).toBe(0)
      expect(editSpy.mock.calls.length).toBe(0)
      expect(configureLatestMock.mock.calls.length).toBe(0)
    })
    it('no configure latest version does not call add or edit', async () => {
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([])
      const addSpy = jest.spyOn(SoftwareList, 'add').mockResolvedValue([])
      const editSpy = jest.spyOn(SoftwareList, 'edit').mockResolvedValue([])
      const software = new Software({
        name: 'music to my ears',
        executable: {
          command: 'psychophysiological',
        },
        args: 'response',
        installedRegex: 'musical chills',
        url: 'https://comeonfeelthenoise.com',
        latestRegex: 'frisson',
      })
      mockedInquirer.prompt.mockResolvedValueOnce({ name: software.name })
      jest.spyOn(Prompts, 'configureInstalledVersion').mockResolvedValue({
        executable: {
          command: 'tracks',
        },
        args: 'lord of the rings',
        installedRegex: 'into the west',
      })
      jest.spyOn(Prompts, 'configureLatestVersion').mockResolvedValue(undefined)
      await expect(Prompts.configure()).resolves.toStrictEqual(undefined)
      expect(addSpy.mock.calls.length).toBe(0)
      expect(editSpy.mock.calls.length).toBe(0)
    })
  })
  describe('configureExecutable', () => {
    it('static returns proper static object', async () => {
      const command = '/path/to/executable'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ type: 'static' })
        .mockResolvedValueOnce({ command })
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      await expect(Prompts.configureExecutable()).resolves.toStrictEqual({
        command,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe('static')
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(undefined)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('static respects existing command as default static input', async () => {
      const existingCommand = '/path/to/existing/executable'
      const command = '/path/to/new/executable'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ type: 'static' })
        .mockResolvedValueOnce({ command })
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      await expect(
        Prompts.configureExecutable({
          command: existingCommand,
        })
      ).resolves.toStrictEqual({
        command,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe('static')
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(existingCommand)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('dynamic with valid inputs returns proper dynamic object', async () => {
      const directory = '/path/to/directory'
      const regex = 'executable-(.*).exe'
      const mockResolvedCommand = 'executable-1.0.exe'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ type: 'dynamic' })
        .mockResolvedValueOnce({ directory, regex })
        .mockResolvedValueOnce({ executableCorrect: true })
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      jest.spyOn(executable, 'getDynamicExecutable').mockResolvedValue(mockResolvedCommand)
      await expect(Prompts.configureExecutable()).resolves.toStrictEqual({
        directory,
        regex,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe('static')
      expect(getPromptDefault(promptMock.mock.calls[1][0], 0)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0], 1)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[2][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Resolved executable: '${mockResolvedCommand}'`]], null, 2)
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('dynamic with error from getDynamicExecutable prompts to reconfigure then returns undefined', async () => {
      const directory = '/path/to/getDynamicExecutable/error/dir'
      const regex = 'getDynamicExecutable-error-(.*).exe'
      const mockError = 'woops got an error'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ type: 'dynamic' })
        .mockResolvedValueOnce({ directory, regex })
        .mockResolvedValueOnce({ reattempt: false })
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      jest.spyOn(executable, 'getDynamicExecutable').mockRejectedValue(mockError)
      await expect(Prompts.configureExecutable()).resolves.toStrictEqual(undefined)
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe('static')
      expect(getPromptDefault(promptMock.mock.calls[1][0], 0)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0], 1)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[2][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([[mockError.red]], null, 2))
    })
    it('dynamic with error from getDynamicExecutable prompts to reconfigure and can be reconfigured as dynamic', async () => {
      const initialDirectory = '/path/to/getDynamicExecutable/error/to/be/reconfigured/as/dynamic/dir'
      const initialRegex = 'getDynamicExecutable-error-to-be-reconfigured-as-dynamic-(.*).exe'
      const mockError = 'woops got an error but we will reconfigure as dynamic'
      const reconfiguredDirectory = '/path/to/getDynamicExecutable/error/reconfigure/as/dynamic/dir'
      const reconfiguredRegex = 'getDynamicExecutable-error-reconfigure-dynamic-(.*).exe'
      const mockResolvedCommand = 'executable-error-reconfigured-as-dynamic-1.0.exe'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ type: 'dynamic' })
        .mockResolvedValueOnce({ directory: initialDirectory, regex: initialRegex })
        .mockResolvedValueOnce({ reattempt: true })
        .mockResolvedValueOnce({ type: 'dynamic' })
        .mockResolvedValueOnce({ directory: reconfiguredDirectory, regex: reconfiguredRegex })
        .mockResolvedValueOnce({ executableCorrect: true })
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      jest
        .spyOn(executable, 'getDynamicExecutable')
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResolvedCommand)
      await expect(Prompts.configureExecutable()).resolves.toStrictEqual({
        directory: reconfiguredDirectory,
        regex: reconfiguredRegex,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe('static')
      expect(getPromptDefault(promptMock.mock.calls[1][0], 0)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0], 1)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[2][0])).toBe(true)
      expect(getPromptDefault(promptMock.mock.calls[3][0])).toBe('dynamic')
      expect(getPromptDefault(promptMock.mock.calls[4][0], 0)).toBe(initialDirectory)
      expect(getPromptDefault(promptMock.mock.calls[4][0], 1)).toBe(initialRegex)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Resolved executable: '${mockResolvedCommand}'`]], null, 2)
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([[mockError.red]], null, 2))
    })
    it('dynamic with error from getDynamicExecutable prompts to reconfigure and can be reconfigured as static', async () => {
      const directory = '/path/to/getDynamicExecutable/error/reconfigure/as/static/dir'
      const regex = 'getDynamicExecutable-error-reconfigure-static-(.*).exe'
      const command = 'reconfigured command'
      const mockError = 'woops got an error but we will reconfigure as static'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ type: 'dynamic' })
        .mockResolvedValueOnce({ directory, regex })
        .mockResolvedValueOnce({ reattempt: true })
        .mockResolvedValueOnce({ type: 'static' })
        .mockResolvedValueOnce({ command })
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      jest.spyOn(executable, 'getDynamicExecutable').mockRejectedValue(mockError)
      await expect(Prompts.configureExecutable()).resolves.toStrictEqual({ command })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe('static')
      expect(getPromptDefault(promptMock.mock.calls[1][0], 0)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0], 1)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[2][0])).toBe(true)
      expect(getPromptDefault(promptMock.mock.calls[3][0])).toBe('dynamic')
      expect(getPromptDefault(promptMock.mock.calls[4][0])).toBe(undefined)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([[mockError.red]], null, 2))
    })
    it('dynamic decide incorrect reconfigure as dynamic', async () => {
      const initialDirectory = '/path/to/getDynamicExecutable/incorrect/to/be/reconfigured/as/dynamic/dir'
      const initialRegex = 'getDynamicExecutable-incorrect-to-be-reconfigured-as-dynamic-(.*).exe'
      const mockInitialCommand = 'executable-incorrect-to-be-reconfigured-as-dynamic-1.0.exe'
      const reconfiguredDirectory = '/path/to/getDynamicExecutable/incorrect/reconfigure/as/dynamic/dir'
      const reconfiguredRegex = 'getDynamicExecutable-incorrect-reconfigure-dynamic-(.*).exe'
      const mockReconfiguredCommand = 'executable-incorrect-reconfigured-as-dynamic-1.0.exe'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ type: 'dynamic' })
        .mockResolvedValueOnce({ directory: initialDirectory, regex: initialRegex })
        .mockResolvedValueOnce({ executableCorrect: false })
        .mockResolvedValueOnce({ type: 'dynamic' })
        .mockResolvedValueOnce({ directory: reconfiguredDirectory, regex: reconfiguredRegex })
        .mockResolvedValueOnce({ executableCorrect: true })
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      jest
        .spyOn(executable, 'getDynamicExecutable')
        .mockResolvedValueOnce(mockInitialCommand)
        .mockResolvedValueOnce(mockReconfiguredCommand)
      await expect(Prompts.configureExecutable()).resolves.toStrictEqual({
        directory: reconfiguredDirectory,
        regex: reconfiguredRegex,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe('static')
      expect(getPromptDefault(promptMock.mock.calls[1][0], 0)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0], 1)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[2][0])).toBe(true)
      expect(getPromptDefault(promptMock.mock.calls[3][0])).toBe('dynamic')
      expect(getPromptDefault(promptMock.mock.calls[4][0], 0)).toBe(initialDirectory)
      expect(getPromptDefault(promptMock.mock.calls[4][0], 1)).toBe(initialRegex)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify(
          [[`Resolved executable: '${mockInitialCommand}'`], [`Resolved executable: '${mockReconfiguredCommand}'`]],
          null,
          2
        )
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('dynamic decide incorrect reconfigure as static', async () => {
      const directory = '/path/to/getDynamicExecutable/incorrect/reconfigure/as/static/dir'
      const regex = 'getDynamicExecutable-incorrect-reconfigure-static-(.*).exe'
      const mockResolvedCommand = 'incorrect command'
      const command = 'incorrect reconfigured command'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ type: 'dynamic' })
        .mockResolvedValueOnce({ directory, regex })
        .mockResolvedValueOnce({ executableCorrect: false })
        .mockResolvedValueOnce({ type: 'static' })
        .mockResolvedValueOnce({ command })
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      jest.spyOn(executable, 'getDynamicExecutable').mockResolvedValue(mockResolvedCommand)
      await expect(Prompts.configureExecutable()).resolves.toStrictEqual({ command })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe('static')
      expect(getPromptDefault(promptMock.mock.calls[1][0], 0)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0], 1)).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[2][0])).toBe(true)
      expect(getPromptDefault(promptMock.mock.calls[3][0])).toBe('dynamic')
      expect(getPromptDefault(promptMock.mock.calls[4][0])).toBe(undefined)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Resolved executable: '${mockResolvedCommand}'`]], null, 2)
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
  })
  describe('configureInstalledVersion', () => {
    it('returns undefined if configureExecutable returns undefined', async () => {
      jest.spyOn(Prompts, 'configureExecutable').mockResolvedValue(undefined)
      await expect(Prompts.configureInstalledVersion({})).resolves.toBe(undefined)
    })
    it('version correct returns configured installed version', async () => {
      const executable = {
        command: 'version correct',
      }
      jest.spyOn(Prompts, 'configureExecutable').mockResolvedValue(executable)
      const args = 'marco'
      const installedRegex = 'polo'
      const mockInstalledVersion = '1254'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ args, installedRegex })
        .mockResolvedValueOnce({ versionCorrect: true })
      jest.spyOn(Software.prototype, 'getInstalledVersion').mockResolvedValue(mockInstalledVersion)
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(Prompts.configureInstalledVersion({})).resolves.toStrictEqual({
        executable,
        args,
        installedRegex,
        shellOverride: undefined,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Installed version: '${mockInstalledVersion}'`]], null, 2)
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('version correct without args returns configured installed version', async () => {
      const executable = {
        command: 'version correct without args',
      }
      jest.spyOn(Prompts, 'configureExecutable').mockResolvedValue(executable)
      const installedRegex = 'be excellent to each other'
      const mockInstalledVersion = 'party on dudes'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ installedRegex })
        .mockResolvedValueOnce({ versionCorrect: true })
      jest.spyOn(Software.prototype, 'getInstalledVersion').mockResolvedValue(mockInstalledVersion)
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(Prompts.configureInstalledVersion({})).resolves.toStrictEqual({
        executable,
        args: undefined,
        installedRegex,
        shellOverride: undefined,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Installed version: '${mockInstalledVersion}'`]], null, 2)
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('version correct with shell override returns configured installed version', async () => {
      const executable = {
        command: 'version correct with shell override',
      }
      jest.spyOn(Prompts, 'configureExecutable').mockResolvedValue(executable)
      const args = 'pets'
      const installedRegex = 'snail'
      const shellOverride = 'spongebob'
      const mockInstalledVersion = 'Garold "Gary" Wilson, Jr.'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ args, installedRegex, shellOverride })
        .mockResolvedValueOnce({ versionCorrect: true })
      jest.spyOn(Software.prototype, 'getInstalledVersion').mockResolvedValue(mockInstalledVersion)
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(Prompts.configureInstalledVersion({})).resolves.toStrictEqual({
        executable,
        args,
        installedRegex,
        shellOverride,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Installed version: '${mockInstalledVersion}'`]], null, 2)
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('version correct with existing values uses them as defaults then returns configured installed version', async () => {
      const executable = {
        command: 'version correct with existing values',
      }
      jest.spyOn(Prompts, 'configureExecutable').mockResolvedValue(executable)
      const existingArgs = 'dogma'
      const existingInstalledRegex = 'transmigration'
      const existingShellOverride = 'philosophy'
      const args = 'belief'
      const installedRegex = 'rebirth'
      const shellOverride = 'religion'
      const mockInstalledVersion = 'reincarnation'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ args, installedRegex, shellOverride })
        .mockResolvedValueOnce({ versionCorrect: true })
      jest.spyOn(Software.prototype, 'getInstalledVersion').mockResolvedValue(mockInstalledVersion)
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(
        Prompts.configureInstalledVersion({
          existingArgs,
          existingInstalledRegex,
          existingShellOverride,
        })
      ).resolves.toStrictEqual({
        executable,
        args,
        installedRegex,
        shellOverride,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0], 0)).toBe(existingArgs)
      expect(getPromptDefault(promptMock.mock.calls[0][0], 1)).toBe(existingInstalledRegex)
      expect(getPromptDefault(promptMock.mock.calls[0][0], 2)).toBe(existingShellOverride)
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Installed version: '${mockInstalledVersion}'`]], null, 2)
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('error from getInstalledVersion prompts to reconfigure then returns undefined', async () => {
      const executable = {
        command: 'explorers',
      }
      jest.spyOn(Prompts, 'configureExecutable').mockResolvedValue(executable)
      const args = 'marco'
      const installedRegex = 'polo'
      const mockError = 'oh no error getting installed version'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ args, installedRegex })
        .mockResolvedValueOnce({ reattempt: false })
      jest.spyOn(Software.prototype, 'getInstalledVersion').mockRejectedValue(mockError)
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(Prompts.configureInstalledVersion({})).resolves.toStrictEqual(undefined)
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([[mockError.red]], null, 2))
    })
    it('error from getInstalledVersion prompts to reconfigure then returns configured installed version', async () => {
      const executable = {
        command: 'desserts',
      }
      jest.spyOn(Prompts, 'configureExecutable').mockResolvedValue(executable)
      const initialArgs = 'blizzard'
      const initialInstalledRegex = 'oreo'
      const mockError = 'oh no error getting installed version before reconfiguration'
      const reconfiguredArgs = 'pie'
      const reconfiguredInstalledRegex = 'pecan'
      const mockInstalledVersion = '12'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ args: initialArgs, installedRegex: initialInstalledRegex })
        .mockResolvedValueOnce({ reattempt: true })
        .mockResolvedValueOnce({ args: reconfiguredArgs, installedRegex: reconfiguredInstalledRegex })
        .mockResolvedValueOnce({ versionCorrect: true })
      jest
        .spyOn(Software.prototype, 'getInstalledVersion')
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockInstalledVersion)
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(Prompts.configureInstalledVersion({})).resolves.toStrictEqual({
        executable,
        args: reconfiguredArgs,
        installedRegex: reconfiguredInstalledRegex,
        shellOverride: undefined,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(true)
      expect(getPromptDefault(promptMock.mock.calls[2][0], 0)).toBe(initialArgs)
      expect(getPromptDefault(promptMock.mock.calls[2][0], 1)).toBe(initialInstalledRegex)
      expect(getPromptDefault(promptMock.mock.calls[3][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Installed version: '${mockInstalledVersion}'`]], null, 2)
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([[mockError.red]], null, 2))
    })
    it('version incorrect reconfigure then returns configured installed version', async () => {
      const executable = {
        command: 'geography',
      }
      jest.spyOn(Prompts, 'configureExecutable').mockResolvedValue(executable)
      const initialArgs = 'oceans'
      const initialInstalledRegex = 'Pacific'
      const initialInstalledVersion = '1'
      const reconfiguredArgs = 'island'
      const reconfiguredInstalledRegex = 'New Guinea'
      const reconfiguredInstalledVersion = '2'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ args: initialArgs, installedRegex: initialInstalledRegex })
        .mockResolvedValueOnce({ versionCorrect: false })
        .mockResolvedValueOnce({ args: reconfiguredArgs, installedRegex: reconfiguredInstalledRegex })
        .mockResolvedValueOnce({ versionCorrect: true })
      jest
        .spyOn(Software.prototype, 'getInstalledVersion')
        .mockResolvedValueOnce(initialInstalledVersion)
        .mockResolvedValueOnce(reconfiguredInstalledVersion)
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(Prompts.configureInstalledVersion({})).resolves.toStrictEqual({
        executable,
        args: reconfiguredArgs,
        installedRegex: reconfiguredInstalledRegex,
        shellOverride: undefined,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(true)
      expect(getPromptDefault(promptMock.mock.calls[2][0], 0)).toBe(initialArgs)
      expect(getPromptDefault(promptMock.mock.calls[2][0], 1)).toBe(initialInstalledRegex)
      expect(getPromptDefault(promptMock.mock.calls[3][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify(
          [
            [`Installed version: '${initialInstalledVersion}'`],
            [`Installed version: '${reconfiguredInstalledVersion}'`],
          ],
          null,
          2
        )
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
  })
  describe('configureLatestVersion', () => {
    it('version correct returns configured latest version', async () => {
      const url = 'https://l8est.com'
      const latestRegex = 'most recent'
      const mockLatestVersion = '789'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ url, latestRegex })
        .mockResolvedValueOnce({ versionCorrect: true })
      jest.spyOn(Software.prototype, 'getLatestVersion').mockResolvedValue(mockLatestVersion)
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(Prompts.configureLatestVersion({})).resolves.toStrictEqual({
        url,
        latestRegex,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Latest version: '${mockLatestVersion}'`]], null, 2)
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('error from getLatestVersion prompts to reconfigure then returns undefined', async () => {
      const url = 'https://errorinthematrix.com'
      const latestRegex = 'black cat'
      const mockError = 'deja vu'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ url, latestRegex })
        .mockResolvedValueOnce({ reattempt: false })
      jest.spyOn(Software.prototype, 'getLatestVersion').mockRejectedValue(mockError)
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(Prompts.configureLatestVersion({})).resolves.toStrictEqual(undefined)
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([[mockError.red]], null, 2))
    })
    it('error from getLatestVersion prompts to reconfigure then returns undefined', async () => {
      const initialUrl = 'https://definitelynotanerror.com'
      const initialLatestRegex = 'error schmerror'
      const initialLatestVersionError = 'rats there was a problem'
      const reconfiguredUrl = 'https://errorfixedforreal.com'
      const reconfiguredLatestRegex = 'see no error now'
      const reconfiguredLatestVersion = 'perfection'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ url: initialUrl, latestRegex: initialLatestRegex })
        .mockResolvedValueOnce({ reattempt: true })
        .mockResolvedValueOnce({ url: reconfiguredUrl, latestRegex: reconfiguredLatestRegex })
        .mockResolvedValueOnce({ versionCorrect: true })
      jest
        .spyOn(Software.prototype, 'getLatestVersion')
        .mockRejectedValueOnce(initialLatestVersionError)
        .mockResolvedValueOnce(reconfiguredLatestVersion)
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(Prompts.configureLatestVersion({})).resolves.toStrictEqual({
        url: reconfiguredUrl,
        latestRegex: reconfiguredLatestRegex,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(true)
      expect(getPromptDefault(promptMock.mock.calls[2][0], 0)).toBe(initialUrl)
      expect(getPromptDefault(promptMock.mock.calls[2][0], 1)).toBe(initialLatestRegex)
      expect(getPromptDefault(promptMock.mock.calls[3][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify([[`Latest version: '${reconfiguredLatestVersion}'`]], null, 2)
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(
        JSON.stringify([[initialLatestVersionError.red]], null, 2)
      )
    })
    it('version incorrect reconfigure then returns configured latest version', async () => {
      const initialUrl = 'https://gutreaction.com'
      const initialLatestRegex = 'heartburn'
      const initialLatestVersion = 'spicy'
      const reconfiguredUrl = 'https://logicalchoice.com'
      const reconfiguredLatestRegex = 'true and false'
      const reconfiguredLatestVersion = 'false'
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ url: initialUrl, latestRegex: initialLatestRegex })
        .mockResolvedValueOnce({ versionCorrect: false })
        .mockResolvedValueOnce({ url: reconfiguredUrl, latestRegex: reconfiguredLatestRegex })
        .mockResolvedValueOnce({ versionCorrect: true })
      jest
        .spyOn(Software.prototype, 'getLatestVersion')
        .mockResolvedValueOnce(initialLatestVersion)
        .mockResolvedValueOnce(reconfiguredLatestVersion)
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(Prompts.configureLatestVersion({})).resolves.toStrictEqual({
        url: reconfiguredUrl,
        latestRegex: reconfiguredLatestRegex,
      })
      expect(getPromptDefault(promptMock.mock.calls[0][0])).toBe(undefined)
      expect(getPromptDefault(promptMock.mock.calls[1][0])).toBe(true)
      expect(getPromptDefault(promptMock.mock.calls[2][0], 0)).toBe(initialUrl)
      expect(getPromptDefault(promptMock.mock.calls[2][0], 1)).toBe(initialLatestRegex)
      expect(getPromptDefault(promptMock.mock.calls[3][0])).toBe(true)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(
        JSON.stringify(
          [[`Latest version: '${initialLatestVersion}'`], [`Latest version: '${reconfiguredLatestVersion}'`]],
          null,
          2
        )
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
  })
  describe('view', () => {
    it('no softwares prints message to add software to view', async () => {
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([])
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
      await expect(Prompts.view()).resolves.toBe(undefined)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
      expect(JSON.stringify(consoleWarnMock.mock.calls, null, 2)).toBe(
        JSON.stringify([['No softwares to view. Please add a software to have something to view.'.yellow]], null, 2)
      )
      expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('single valid software without update prints out table', async () => {
      const name = 'single valid view without update'
      const version = '1490'
      await testViewTable({
        softwares: [
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
        installedVersions: [{ value: version }],
        latestVersions: [{ value: version }],
        expectedRows: [
          {
            name,
            installedVersion: version,
            latestVersion: version,
            color: colors.white,
          },
        ],
      })
    })
    it('single valid software with update prints out table', async () => {
      const name = 'single valid view with update'
      const installedVersion = 'bifocal'
      const latestVersion = 'progressive'
      await testViewTable({
        softwares: [
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
        installedVersions: [{ value: installedVersion }],
        latestVersions: [{ value: latestVersion }],
        expectedRows: [
          {
            name,
            installedVersion,
            latestVersion,
            color: colors.green,
          },
        ],
      })
    })
    it('multiple valid softwares without updates prints out table', async () => {
      const nameOne = 'multiple valid view without update first'
      const nameTwo = 'multiple valid view without update last'
      const installedVersionOne = '1'
      const latestVersionOne = '1'
      const installedVersionTwo = '2'
      const latestVersionTwo = '2'
      await testViewTable({
        softwares: [
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
        installedVersions: [{ value: installedVersionOne }, { value: installedVersionTwo }],
        latestVersions: [{ value: latestVersionOne }, { value: latestVersionTwo }],
        expectedRows: [
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
      })
    })
    it('multiple valid softwares with updates prints out table', async () => {
      const nameOne = 'multiple valid view with update first'
      const nameTwo = 'multiple valid view with update last'
      const installedVersionOne = '7'
      const latestVersionOne = '10'
      const installedVersionTwo = '10.10'
      const latestVersionTwo = '11'
      await testViewTable({
        softwares: [
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
              command: 'os',
            },
            args: 'mac',
            installedRegex: 'amd64',
            url: 'https://appleaday.com',
            latestRegex: 'arm64',
          }),
        ],
        installedVersions: [{ value: installedVersionOne }, { value: installedVersionTwo }],
        latestVersions: [{ value: latestVersionOne }, { value: latestVersionTwo }],
        expectedRows: [
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
      await testViewTable({
        softwares: [
          new Software({
            name: nameOne,
            executable: {
              command: 'alcohol',
            },
            args: 'beer',
            installedRegex: 'irish red',
            url: 'https://whokilledkenny.com',
            latestRegex: 'kilkenny',
          }),
          new Software({
            name: nameTwo,
            executable: {
              command: 'alcohol',
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
        installedVersions: [
          { value: installedVersionOne },
          { value: installedVersionTwo },
          { value: installedVersionThree },
        ],
        latestVersions: [{ value: latestVersionOne }, { value: latestVersionTwo }, { value: latestVersionThree }],
        expectedRows: [
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
      })
    })
    it('single with no installed or latest version prints out table with red row', async () => {
      const name = 'single with no installed or latest'
      const installedVersion = ''
      const latestVersion = ''
      await testViewTable({
        softwares: [
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
        installedVersions: [{ value: installedVersion }],
        latestVersions: [{ value: latestVersion }],
        expectedRows: [
          {
            name,
            installedVersion: installedVersion,
            latestVersion: latestVersion,
            color: colors.red,
          },
        ],
      })
    })
    it('single with installed error prints out table with red row', async () => {
      const name = 'single with installed error'
      const installedError = 'Cannot predict the future as easily as the past'
      const latestVersion = '2020'
      await testViewTable({
        softwares: [
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
        installedVersions: [{ value: installedError, rejected: true }],
        latestVersions: [{ value: latestVersion }],
        expectedRows: [
          {
            name,
            installedVersion: installedError,
            latestVersion: latestVersion,
            color: colors.red,
          },
        ],
      })
    })
    it('single with latest error prints out table with red row', async () => {
      const name = 'single with latest error'
      const installedVersion = 'minas tirith'
      const latestError = 'could not find city. did you mean minas tirith?'
      await testViewTable({
        softwares: [
          new Software({
            name,
            executable: {
              command: 'lotr',
            },
            args: 'towers',
            installedRegex: 'minas anor',
            url: 'https://whereinmiddleearthami.com',
            latestRegex: 'capital of gondor',
          }),
        ],
        installedVersions: [{ value: installedVersion }],
        latestVersions: [{ value: latestError, rejected: true }],
        expectedRows: [
          {
            name,
            installedVersion: installedVersion,
            latestVersion: latestError,
            color: colors.red,
          },
        ],
      })
    })
    it('single with installed and latest error prints out table with red row', async () => {
      const name = 'single with installed and latest error'
      const installedError = 'Your record is broken'
      const latestError = 'Your record is brokener'
      await testViewTable({
        softwares: [
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
        installedVersions: [{ value: installedError, rejected: true }],
        latestVersions: [{ value: latestError, rejected: true }],
        expectedRows: [
          {
            name,
            installedVersion: installedError,
            latestVersion: latestError,
            color: colors.red,
          },
        ],
      })
    })
    it('multiple errors with one installed and one latest prints out table with red rows', async () => {
      const nameFirst = 'multiple errors with one installed and one latest first'
      const nameLast = 'multiple errors with one installed and one latest last'
      const installedError = 'mudcrab'
      const latestVersion = '0009B2B2'
      const installedVersion = '69'
      const latestError = 'white hood'
      await testViewTable({
        softwares: [
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
        installedVersions: [{ value: installedError, rejected: true }, { value: installedVersion }],
        latestVersions: [{ value: latestVersion }, { value: latestError, rejected: true }],
        expectedRows: [
          {
            name: nameFirst,
            installedVersion: installedError,
            latestVersion: latestVersion,
            color: colors.red,
          },
          {
            name: nameLast,
            installedVersion: installedVersion,
            latestVersion: latestError,
            color: colors.red,
          },
        ],
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
      await testViewTable({
        softwares: [
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
        installedVersions: [
          { value: installedVersionOne },
          { value: installedErrorTwo, rejected: true },
          { value: installedVersionThree },
        ],
        latestVersions: [
          { value: latestVersionOne },
          { value: latestErrorTwo, rejected: true },
          { value: latestVersionThree },
        ],
        expectedRows: [
          {
            name: nameOne,
            installedVersion: installedVersionOne,
            latestVersion: latestVersionOne,
            color: colors.white,
          },
          {
            name: nameTwo,
            installedVersion: installedErrorTwo,
            latestVersion: latestErrorTwo,
            color: colors.red,
          },
          {
            name: nameThree,
            installedVersion: installedVersionThree,
            latestVersion: latestVersionThree,
            color: colors.green,
          },
        ],
      })
    })
  })
  describe('edit', () => {
    it('no softwares prints message to add software to edit', async () => {
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([])
      const promptMock = mockedInquirer.prompt
      const configureMock = jest.spyOn(Prompts, 'configure')
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
      await expect(Prompts.edit()).resolves.toBe(undefined)
      expect(promptMock.mock.calls.length).toBe(0)
      expect(configureMock.mock.calls.length).toBe(0)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
      expect(JSON.stringify(consoleWarnMock.mock.calls, null, 2)).toBe(
        JSON.stringify([['No softwares to edit. Please add a software to have something to edit.'.yellow]], null, 2)
      )
    })
    it('single software to choose gets passed to configure method', async () => {
      const software = new Software({
        name: 'single',
        executable: {
          command: 'sculptures',
        },
        args: 'marble',
        installedRegex: 'michelangelo',
        url: 'https://teenagemutantninjasculptors.com',
        latestRegex: 'david',
      })
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([software])
      const promptMock = mockedInquirer.prompt.mockResolvedValue({ nameToEdit: software.name })
      const configureMock = jest.spyOn(Prompts, 'configure').mockResolvedValue(undefined)
      const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
      await expect(Prompts.edit()).resolves.toBe(undefined)
      expect(promptMock.mock.calls.length).toBe(1)
      expect(JSON.stringify(configureMock.mock.calls, null, 2)).toStrictEqual(JSON.stringify([[software]], null, 2))
      expect(JSON.stringify(consoleWarnMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('multiple softwares to choose first gets passed to configure method', async () => {
      const firstSoftware = new Software({
        name: 'multiple softwares choose first first',
        executable: {
          command: 'replicant',
        },
        args: 'nexus-6',
        installedRegex: 'batty',
        url: 'https://tearsintherain.com',
        latestRegex: 'N6MAA10816',
      })
      const lastSoftware = new Software({
        name: 'multiple softwares choose first last',
        executable: {
          command: 'ais',
        },
        args: 'sentient',
        installedRegex: 'hal',
        url: 'https://daisybell.com',
        latestRegex: 'Heuristically Programmed ALgorithmic Computer 9000',
      })
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([firstSoftware, lastSoftware])
      const promptMock = mockedInquirer.prompt.mockResolvedValue({ nameToEdit: firstSoftware.name })
      const configureMock = jest.spyOn(Prompts, 'configure').mockResolvedValue(undefined)
      const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
      await expect(Prompts.edit()).resolves.toBe(undefined)
      expect(promptMock.mock.calls.length).toBe(1)
      expect(JSON.stringify(configureMock.mock.calls, null, 2)).toStrictEqual(
        JSON.stringify([[firstSoftware]], null, 2)
      )
      expect(JSON.stringify(consoleWarnMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('multiple softwares to choose last gets passed to configure method', async () => {
      const firstSoftware = new Software({
        name: 'multiple softwares choose last first',
        executable: {
          command: 'villian',
        },
        args: 'serial-killer',
        installedRegex: 'lecter',
        url: 'https://favabeansandanicechianti.com',
        latestRegex: 'Dr. Hannibal Lecter',
      })
      const lastSoftware = new Software({
        name: 'multiple softwares choose last last',
        executable: {
          command: 'hero',
        },
        args: 'folk',
        installedRegex: 'finch',
        url: 'https://tokillamockingbird.com',
        latestRegex: 'atticus finch',
      })
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([firstSoftware, lastSoftware])
      const promptMock = mockedInquirer.prompt.mockResolvedValue({ nameToEdit: lastSoftware.name })
      const configureMock = jest.spyOn(Prompts, 'configure').mockResolvedValue(undefined)
      const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
      await expect(Prompts.edit()).resolves.toBe(undefined)
      expect(promptMock.mock.calls.length).toBe(1)
      expect(JSON.stringify(configureMock.mock.calls, null, 2)).toStrictEqual(JSON.stringify([[lastSoftware]], null, 2))
      expect(JSON.stringify(consoleWarnMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
  })
  describe('delete', () => {
    it('no softwares prints message to add software to delete', async () => {
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([])
      const promptMock = mockedInquirer.prompt
      const deleteMock = jest.spyOn(SoftwareList, 'delete')
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
      await expect(Prompts.delete()).resolves.toBe(undefined)
      expect(promptMock.mock.calls.length).toBe(0)
      expect(deleteMock.mock.calls.length).toBe(0)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
      expect(JSON.stringify(consoleWarnMock.mock.calls, null, 2)).toBe(
        JSON.stringify([['No softwares to delete. Please add a software to have something to delete.'.yellow]], null, 2)
      )
    })
    it('single software to choose without confirmation does not call delete method', async () => {
      const name = 'single delete without confirmation'
      jest.spyOn(SoftwareList, 'load').mockResolvedValue([
        new Software({
          name,
          executable: {
            command: 'candy',
          },
          args: 'hershey',
          installedRegex: 'caramel',
          url: 'https://failedroundcandies.com',
          latestRegex: 'milk duds',
        }),
      ])
      const promptMock = mockedInquirer.prompt
        .mockResolvedValueOnce({ nameToDelete: name })
        .mockResolvedValueOnce({ deleteConfirmed: false })
      const deleteMock = jest.spyOn(SoftwareList, 'delete').mockResolvedValue([])
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
      const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
      await expect(Prompts.delete()).resolves.toBe(undefined)
      expect(promptMock.mock.calls.length).toBe(2)
      expect(deleteMock.mock.calls.length).toBe(0)
      expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
      expect(JSON.stringify(consoleWarnMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
    })
    it('single software to choose with confirmation gets passed to delete method', async () => {
      const name = 'single delete with confirmation'
      await testDeletePromptSelection({
        softwares: [
          new Software({
            name,
            executable: {
              command: 'cyborg',
            },
            args: 'assassin',
            installedRegex: 'terminator',
            url: 'https://skynet.com',
            latestRegex: 'Cyberdyne Systems Model 101 Series 800',
          }),
        ],
        promptMocks: [
          {
            nameToDelete: name,
          },
          {
            deleteConfirmed: true,
          },
        ],
        expectedDeleteName: name,
      })
    })
    it('first of multiple with confirmation gets passed to delete method', async () => {
      const name = 'first of multiple with confirmation first'
      await testDeletePromptSelection({
        softwares: [
          new Software({
            name,
            executable: {
              command: 'matrix',
            },
            args: 'redpill',
            installedRegex: 'neo',
            url: 'https://theone.com',
            latestRegex: 'Thomas A. Anderson',
          }),
          new Software({
            name: 'first of multiple with confirmation last',
            executable: {
              command: 'arrakis',
            },
            args: 'rulers',
            installedRegex: "Muad'Dib",
            url: 'https://fearisthemindkiller.com',
            latestRegex: 'Paul Atreides',
          }),
        ],
        promptMocks: [
          {
            nameToDelete: name,
          },
          {
            deleteConfirmed: true,
          },
        ],
        expectedDeleteName: name,
      })
    })
    it('last of multiple with confirmation gets passed to delete method', async () => {
      const name = 'last of multiple with confirmation last'
      await testDeletePromptSelection({
        softwares: [
          new Software({
            name: 'last of multiple with confirmation first',
            executable: {
              command: 'rings',
            },
            args: 'magic',
            installedRegex: 'ring of fire',
            url: 'https://elvenkingsunderthesky.com',
            latestRegex: 'narya',
          }),
          new Software({
            name,
            executable: {
              command: 'wand',
            },
            args: 'thestral',
            installedRegex: 'destiny',
            url: 'https://deathsfirsthallow.com',
            latestRegex: 'elder wand',
          }),
        ],
        promptMocks: [
          {
            nameToDelete: name,
          },
          {
            deleteConfirmed: true,
          },
        ],
        expectedDeleteName: name,
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
  for (const action of actions) {
    mockedInquirer.prompt.mockResolvedValueOnce({ action })
  }
  const configureSpy = jest.spyOn(Prompts, 'configure').mockResolvedValue()
  const viewSpy = jest.spyOn(Prompts, 'view').mockResolvedValue()
  const editSpy = jest.spyOn(Prompts, 'edit').mockResolvedValue()
  const deleteSpy = jest.spyOn(Prompts, 'delete').mockResolvedValue()
  await expect(Prompts.home()).resolves.toBe(undefined)
  expect(configureSpy.mock.calls.length).toBe(configureCalls)
  expect(viewSpy.mock.calls.length).toBe(viewCalls)
  expect(editSpy.mock.calls.length).toBe(editCalls)
  expect(deleteSpy.mock.calls.length).toBe(deleteCalls)
}

async function testViewTable({
  softwares,
  installedVersions,
  latestVersions,
  expectedRows,
}: {
  softwares: Software[]
  installedVersions: MockResponse[]
  latestVersions: MockResponse[]
  expectedRows: ExpectedTableRow[]
}) {
  jest.spyOn(SoftwareList, 'load').mockResolvedValue(softwares)
  const installedSpy = jest.spyOn(Software.prototype, 'getInstalledVersion')
  for (const installedVersion of installedVersions) {
    if (installedVersion.rejected) {
      installedSpy.mockRejectedValueOnce(installedVersion.value)
    } else {
      installedSpy.mockResolvedValueOnce(installedVersion.value)
    }
  }
  const latestSpy = jest.spyOn(Software.prototype, 'getLatestVersion')
  for (const latestVersion of latestVersions) {
    if (latestVersion.rejected) {
      latestSpy.mockRejectedValueOnce(latestVersion.value)
    } else {
      latestSpy.mockResolvedValueOnce(latestVersion.value)
    }
  }
  const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
  const consoleTableMock = jest.spyOn(console, 'table').mockImplementation()
  const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
  const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation()
  await expect(Prompts.view()).resolves.toBe(undefined)
  expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
  consoleLogMock.mockRestore()
  TestUtil.validateTablePrintout(JSON.stringify(consoleTableMock.mock.calls[0][0], null, 2), expectedRows)
  expect(JSON.stringify(consoleWarnMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
  expect(JSON.stringify(consoleErrorMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
}

interface MockResponse {
  value: string
  rejected?: boolean
}

interface ExpectedTableRow {
  name: string
  installedVersion: string
  latestVersion: string
  color: colors.Color
}

async function testDeletePromptSelection({
  softwares,
  promptMocks,
  expectedDeleteName,
}: {
  softwares: Software[]
  promptMocks: PromptInput[]
  expectedDeleteName: string
}) {
  jest.spyOn(SoftwareList, 'load').mockResolvedValue(softwares)
  const promptMock = mockedInquirer.prompt
  for (const mock of promptMocks) {
    promptMock.mockResolvedValueOnce(mock)
  }
  const deleteMock = jest.spyOn(SoftwareList, 'delete').mockResolvedValue([])
  const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()
  const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
  await expect(Prompts.delete()).resolves.toBe(undefined)
  expect(promptMock.mock.calls.length).toBe(2)
  expect(JSON.stringify(deleteMock.mock.calls, null, 2)).toBe(JSON.stringify([[expectedDeleteName]], null, 2))
  expect(JSON.stringify(consoleLogMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
  expect(JSON.stringify(consoleWarnMock.mock.calls, null, 2)).toBe(JSON.stringify([], null, 2))
}

interface PromptInput {
  [key: string]: string | boolean
}

function getPromptDefault(input: Question | QuestionCollection, index = -1): string {
  if (index >= 0) {
    return (input as ReadonlyArray<DistinctQuestion<Answers>>)[index].default
  }
  return (input as Question).default
}
