import * as executable from '../../src/executable'
import Software, { getExecutable, getFromRegex } from '../../src/software'

describe('Software Unit Tests', () => {
  describe('constructor', () => {
    it('throw error if name empty', () => {
      expect(() => {
        new Software({
          name: '',
          executable: {
            command: '',
          },
          args: '',
          installedRegex: '',
          url: '',
          latestRegex: '',
        })
      }).toThrow('Name must be non-empty')
    })
    it('do not throw error if name non-empty', () => {
      expect(() => {
        new Software({
          name: 'a',
          executable: {
            command: '',
          },
          args: '',
          installedRegex: '',
          url: '',
          latestRegex: '',
        })
      }).not.toThrow()
    })
  })
  describe('getFromRegex', () => {
    it('throw error if no match', () => {
      expect(() => getFromRegex('version 1.0.0', /version v(.*)/)).toThrow(
        "Could not find match for regex '/version v(.*)/' in text 'version 1.0.0'"
      )
    })
    it('retuns correct single match at end', () => {
      expect(getFromRegex('version v1.0.0', /version v(.*)/)).toBe('1.0.0')
    })
    it('retuns correct single match in middle', () => {
      expect(getFromRegex('version v1.0.0 build 234', /version v(\d+\.\d+(\.\d+)?)/)).toBe('1.0.0')
    })
    it('retuns correct single match at beginning', () => {
      expect(getFromRegex('1.0.0 build 333', /(\d+\.\d+(\.\d+)?)/)).toBe('1.0.0')
    })
    it('retuns first match out of multiple', () => {
      expect(getFromRegex('client version v1.0.0, server version v2.0.0', /version v(\d+\.\d+(\.\d+)?)/)).toBe('1.0.0')
    })
  })
  describe('getExecutable', () => {
    it('Static returns command', async () => {
      const command = 'world'
      await expect(
        getExecutable({
          command,
        })
      ).resolves.toBe(command)
    })
    it('Dynamic does not return command', async () => {
      const mockExecutable = 'dynamic-test'
      const getDynamicExecutableSpy = jest.spyOn(executable, 'getDynamicExecutable').mockResolvedValue(mockExecutable)
      await expect(
        getExecutable({
          directory: 'hello',
          regex: 'world',
        })
      ).resolves.toBe(mockExecutable)
      expect(getDynamicExecutableSpy.mock.calls.length).toBe(1)
    })
  })
})
