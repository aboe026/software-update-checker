import inquirer from 'inquirer'

import AddPrompts from '../../src/actions/add/add-prompts'
import { CommandType } from '../../src/software/executable'
import SelfReference from '../../src/util/self-reference'
import TestUtil from '../helpers/test-util'

describe('Add Prompts Unit Tests', () => {
  describe('getName', () => {
    it('returns inquirer output setting no default without existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getName,
        property: 'name',
        expected: 'nemo',
      })
    })
    it('returns inquirer output setting default with existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getName,
        property: 'name',
        expected: 'nomen',
        input: 'title',
        expectedDefault: 'title',
      })
    })
  })
  describe('getDirectory', () => {
    it('returns inquirer output setting no default without existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getDirectory,
        property: 'directory',
        expected: 'autodex',
      })
    })
    it('returns inquirer output setting default with existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getDirectory,
        property: 'directory',
        expected: 'rolodex',
        input: 'index',
        expectedDefault: 'index',
      })
    })
  })
  describe('getCommandType', () => {
    it('returns static inquirer output setting default without existing', async () => {
      const type = CommandType.Static
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ type })
      await expect(AddPrompts.getCommandType()).resolves.toBe(type)
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        expected: type,
      })
    })
    it('returns static inquirer output setting default with existing static', async () => {
      const type = CommandType.Static
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ type })
      await expect(AddPrompts.getCommandType(type)).resolves.toBe(type)
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        expected: type,
      })
    })
    it('returns static inquirer output setting default with existing dynamic', async () => {
      const type = CommandType.Static
      const existing = CommandType.Dynamic
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ type })
      await expect(AddPrompts.getCommandType(existing)).resolves.toBe(type)
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        expected: existing,
      })
    })
    it('returns dynamic inquirer output setting default without existing', async () => {
      const type = CommandType.Dynamic
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ type })
      await expect(AddPrompts.getCommandType()).resolves.toBe(type)
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        expected: CommandType.Static,
      })
    })
    it('returns dynamic inquirer output setting default with existing dynamic', async () => {
      const type = CommandType.Dynamic
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ type })
      await expect(AddPrompts.getCommandType(type)).resolves.toBe(type)
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        expected: type,
      })
    })
    it('returns dynamic inquirer output setting default with existing static', async () => {
      const type = CommandType.Dynamic
      const existing = CommandType.Static
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ type })
      await expect(AddPrompts.getCommandType(existing)).resolves.toBe(type)
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        expected: existing,
      })
    })
  })
  describe('getCommand', () => {
    it('returns inquirer output setting no default without existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getCommand,
        property: 'command',
        expected: 'sit',
      })
    })
    it('returns inquirer output setting default with existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getCommand,
        property: 'command',
        expected: 'stay',
        input: 'rollover',
        expectedDefault: 'rollover',
      })
    })
  })
  describe('getRegex', () => {
    it('returns inquirer output setting no default with empty object', async () => {
      const regex = 'dotstar'
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ regex })
      await expect(AddPrompts.getRegex({})).resolves.toBe(regex)
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        expected: undefined,
      })
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        parameter: 'message',
        expected: `Regex pattern applied to files in directory for singling out executable file to use (eg "${SelfReference.getNameRegex(
          SelfReference.getName()
        )}"):`,
      })
    })
    it('returns inquirer output setting default with object containing existing', async () => {
      const regex = 'slashess'
      const expectedDefault = 'slashplus'
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ regex })
      await expect(
        AddPrompts.getRegex({
          existingRegex: expectedDefault,
        })
      ).resolves.toBe(regex)
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        expected: expectedDefault,
      })
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        parameter: 'message',
        expected: `Regex pattern applied to files in directory for singling out executable file to use (eg "${SelfReference.getNameRegex(
          SelfReference.getName()
        )}"):`,
      })
    })
    it('replaces directory in message if specified', async () => {
      const regex = 'dollarstar'
      const expectedDefault = 'dollarslash'
      const directory = '/escape/this'
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ regex })
      await expect(
        AddPrompts.getRegex({
          existingRegex: expectedDefault,
          directory,
        })
      ).resolves.toBe(regex)
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        expected: expectedDefault,
      })
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        parameter: 'message',
        expected: `Regex pattern applied to files in "${directory}" for singling out executable file to use (eg "${SelfReference.getNameRegex(
          SelfReference.getName()
        )}"):`,
      })
    })
  })
  describe('getExecutableCorrect', () => {
    it('returns affirmative inquirer output setting default', async () => {
      await TestUtil.validateBooleanPrompt({
        method: AddPrompts.getExecutableCorrect,
        property: 'executableCorrect',
        expected: true,
        expectedDefault: true,
      })
    })
    it('returns negative inquirer output setting default', async () => {
      await TestUtil.validateBooleanPrompt({
        method: AddPrompts.getExecutableCorrect,
        property: 'executableCorrect',
        expected: false,
        expectedDefault: true,
      })
    })
  })
  describe('getReattemptDynamic', () => {
    it('returns affirmative inquirer output setting default', async () => {
      await TestUtil.validateBooleanPrompt({
        method: AddPrompts.getReattemptDynamic,
        property: 'reattempt',
        expected: true,
        expectedDefault: true,
      })
    })
    it('returns negative inquirer output setting default', async () => {
      await TestUtil.validateBooleanPrompt({
        method: AddPrompts.getReattemptDynamic,
        property: 'reattempt',
        expected: false,
        expectedDefault: true,
      })
    })
  })
  describe('getArgs', () => {
    it('returns inquirer output setting no default without existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getArgs,
        property: 'args',
        expected: 'toilet paper direction',
      })
    })
    it('returns inquirer output setting default with existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getArgs,
        property: 'args',
        expected: 'paper towel orientation',
        input: 'horizontal',
        expectedDefault: 'horizontal',
      })
    })
  })
  describe('getShell', () => {
    it('returns inquirer output setting no default without existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getShell,
        property: 'shell',
        expected: 'sand dollar',
      })
    })
    it('returns inquirer output setting default with existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getShell,
        property: 'shell',
        expected: 'nautilus',
        input: 'fossil',
        expectedDefault: 'fossil',
      })
    })
  })
  describe('getInstalledRegex', () => {
    it('returns inquirer output setting no default without existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getInstalledRegex,
        property: 'installedRegex',
        expected: 'present',
      })
    })
    it('returns inquirer output setting default with existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getInstalledRegex,
        property: 'installedRegex',
        expected: 'present',
        input: 'past',
        expectedDefault: 'past',
      })
    })
  })
  describe('getVersionCorrect', () => {
    it('returns affirmative inquirer output setting default', async () => {
      await TestUtil.validateBooleanPrompt({
        method: AddPrompts.getVersionCorrect,
        property: 'versionCorrect',
        expected: true,
        expectedDefault: true,
      })
    })
    it('returns negative inquirer output setting default', async () => {
      await TestUtil.validateBooleanPrompt({
        method: AddPrompts.getVersionCorrect,
        property: 'versionCorrect',
        expected: false,
        expectedDefault: true,
      })
    })
  })
  describe('getReattemptVersion', () => {
    it('returns affirmative inquirer output setting default', async () => {
      await TestUtil.validateBooleanPrompt({
        method: AddPrompts.getReattemptVersion,
        property: 'reattempt',
        expected: true,
        expectedDefault: true,
      })
    })
    it('returns negative inquirer output setting default', async () => {
      await TestUtil.validateBooleanPrompt({
        method: AddPrompts.getReattemptVersion,
        property: 'reattempt',
        expected: false,
        expectedDefault: true,
      })
    })
  })
  describe('getUrl', () => {
    it('returns inquirer output setting no default without existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getUrl,
        property: 'url',
        expected: 'world wide web',
      })
    })
    it('returns inquirer output setting default with existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getUrl,
        property: 'url',
        expected: 'hypertext transfer protocol',
        input: 'http/1',
        expectedDefault: 'http/1',
      })
    })
  })
  describe('getLatestRegex', () => {
    it('returns inquirer output setting no default without existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getLatestRegex,
        property: 'latestRegex',
        expected: 'greatest',
      })
    })
    it('returns inquirer output setting default with existing', async () => {
      await TestUtil.validateStringPrompt({
        method: AddPrompts.getLatestRegex,
        property: 'latestRegex',
        expected: 'best',
        input: 'better',
        expectedDefault: 'better',
      })
    })
  })
})
