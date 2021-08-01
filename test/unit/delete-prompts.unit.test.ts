import inquirer from 'inquirer'

import DeletePrompts from '../../src/actions/delete/delete-prompts'
import Software from '../../src/software/software'
import TestUtil from '../helpers/test-util'

describe('Delete Prompts Unit Tests', () => {
  describe('getExisting', () => {
    it('returns inquirer output setting no default', async () => {
      const existing = 'bygone'
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ existing })
      await expect(DeletePrompts.getExisting([])).resolves.toBe(existing)
      TestUtil.validateDefaultProperty(promptSpy, undefined)
    })
    it('maps softwares to choices', async () => {
      const softwares = [
        new Software({
          name: 'first to delete',
          executable: {
            command: 'flare',
          },
          installedRegex: 'solar',
          url: 'https://herecomesthesun.com',
          latestRegex: 'coronal mass ejection',
        }),
        new Software({
          name: 'last to delete',
          executable: {
            command: 'phase',
          },
          installedRegex: 'lunar',
          url: 'https://werewolvesdelight.com',
          latestRegex: 'full moon',
        }),
      ]
      const existing = softwares[1].name
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ existing })
      await expect(DeletePrompts.getExisting(softwares)).resolves.toBe(existing)
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
  describe('getDeleteConfirmed', () => {
    it('returns inquirer output true setting default', async () => {
      const deleteConfirmed = true
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ deleteConfirmed })
      await expect(DeletePrompts.getDeleteConfirmed('')).resolves.toBe(deleteConfirmed)
      TestUtil.validateDefaultProperty(promptSpy, true)
    })
    it('returns inquirer output false setting default', async () => {
      const deleteConfirmed = false
      const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({ deleteConfirmed })
      await expect(DeletePrompts.getDeleteConfirmed('')).resolves.toBe(deleteConfirmed)
      TestUtil.validateDefaultProperty(promptSpy, true)
    })
  })
})
