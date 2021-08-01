import HomePrompts from '../../src/actions/home/home-prompts'
import TestUtil from '../helpers/test-util'

describe('Home Prompts Unit Tests', () => {
  describe('getAction', () => {
    it('returns inquirer output setting no default', async () => {
      await TestUtil.validateStringPrompt({
        method: HomePrompts.getAction,
        property: 'action',
        expected: 'lights, camera',
      })
    })
  })
})
