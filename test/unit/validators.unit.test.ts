import Validators from '../../src/validators'

describe('Validators Unit Tests', () => {
  describe('Required', () => {
    it('Empty string returns false', () => {
      expect(Validators.required('')).toBe(false)
    })
    it('Single character returns true', () => {
      expect(Validators.required('a')).toBe(true)
    })
    it('Two characters returns true', () => {
      expect(Validators.required('to')).toBe(true)
    })
    it('Word returns true', () => {
      expect(Validators.required('hello')).toBe(true)
    })
    it('Multiple words returns true', () => {
      expect(Validators.required('hello world')).toBe(true)
    })
    it("'false' returns true", () => {
      expect(Validators.required('false')).toBe(true)
    })
    it("'undefined' returns true", () => {
      expect(Validators.required('undefined')).toBe(true)
    })
    it("'null' returns true", () => {
      expect(Validators.required('null')).toBe(true)
    })
  })
})
