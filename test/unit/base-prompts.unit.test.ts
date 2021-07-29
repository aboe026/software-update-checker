import BasePrompts from '../../src/base/base-prompts'

describe('Base Prompts Unit Tests', () => {
  describe('capitalizeFirstLetters', () => {
    it('returns empty string if no parameter', () => {
      expect(BasePrompts.capitalizeFirstLetters()).toBe('')
    })
    it('returns empty string if undefined parameter', () => {
      expect(BasePrompts.capitalizeFirstLetters(undefined)).toBe('')
    })
    it('capitalizes single word string', () => {
      expect(BasePrompts.capitalizeFirstLetters('hello')).toBe('Hello')
    })
    it('capitalizes multiple word string', () => {
      expect(BasePrompts.capitalizeFirstLetters('the lazy fox jumped over the brown dog')).toBe(
        'The Lazy Fox Jumped Over The Brown Dog'
      )
    })
    it('capitalizes multiple spaces string', () => {
      expect(BasePrompts.capitalizeFirstLetters('hello    world')).toBe('Hello    World')
    })
  })
})
