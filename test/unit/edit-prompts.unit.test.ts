import inquirer from 'inquirer'

import EditPrompts from '../../src/edit/edit-prompts'
import Software from '../../src/software'
import TestUtil from '../helpers/test-util'

describe('Edit Prompts Unit Tests', () => {
  describe('getExisting', () => {
    it('returns inquirer output setting no default', async () => {
      const existing = 'bygone'
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ existing })
      await expect(EditPrompts.getExisting([])).resolves.toBe(existing)
      TestUtil.validateDefaultProperty(promptSpy, undefined)
    })
    it('maps softwares to choices', async () => {
      const softwares = [
        new Software({
          name: 'first to edit',
          executable: {
            command: 'single-sided',
          },
          args: 'non-orientable',
          shellOverride: 'surface',
          installedRegex: 'boundry-curve=1',
          url: 'https://recycle.com',
          latestRegex: 'mobius strip',
        }),
        new Software({
          name: 'last to edit',
          executable: {
            command: 'cognitive',
          },
          args: 'shift',
          shellOverride: 'psychology',
          installedRegex: 'spaceflight',
          url: 'https://fragileballoflife.com',
          latestRegex: 'overview effect',
        }),
      ]
      const existing = softwares[1].name
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ existing })
      await expect(EditPrompts.getExisting(softwares)).resolves.toBe(existing)
      expect(promptSpy.mock.calls).toHaveLength(1)
      expect(promptSpy.mock.calls[0]).toHaveLength(1)
      expect(promptSpy.mock.calls[0][0]).toHaveProperty('choices', [
        {
          name: softwares[0].name,
          value: softwares[0].name,
        },
        {
          name: softwares[1].name,
          value: softwares[1].name,
        },
      ])
    })
  })
})