import { addNewlineForExample } from '../../src/actions/base/base-options'

describe('Base Options Unit Tests', () => {
  describe('addNewlineForExample', () => {
    it('returns empty string if no parameter', () => {
      expect(addNewlineForExample()).toBe('')
    })
    it('returns empty string if undefined parameter', () => {
      expect(addNewlineForExample(undefined)).toBe('')
    })
    it('returns same string if no example parameter', () => {
      expect(addNewlineForExample('hello world')).toBe('hello world')
    })
    it('returns multiline string if example parameter', () => {
      expect(addNewlineForExample('foo (eg "bar")')).toBe('foo\n(eg "bar")')
    })
  })
})
