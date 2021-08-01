import Base from '../../src/actions/base/base'
import colors from '../../src/util/colors'
import Software from '../../src/software/software'

describe('Base Unit Tests', () => {
  describe('getMissingRequiredOptionErrorMessage', () => {
    it('works for empty string param', () => {
      expect(Base.getMissingRequiredOptionErrorMessage('')).toBe(`Option "" must be non-empty string`)
    })
    it('works for single letter string param', () => {
      expect(Base.getMissingRequiredOptionErrorMessage('m')).toBe(`Option "m" must be non-empty string`)
    })
    it('works for single word string param', () => {
      expect(Base.getMissingRequiredOptionErrorMessage('hello')).toBe(`Option "hello" must be non-empty string`)
    })
    it('works for multiple word string param', () => {
      expect(Base.getMissingRequiredOptionErrorMessage('hello word')).toBe(
        `Option "hello word" must be non-empty string`
      )
    })
  })
  describe('getExistingSoftware', () => {
    it('throws error in non-interactive and no string name input', async () => {
      await expect(
        Base.getExistingSoftware({
          softwares: [],
          prompt: jest.fn().mockResolvedValue(''),
          interactive: false,
        })
      ).rejects.toThrow('Must specify existing name when non-interactive')
    })
    it('throws error in non-interactive and empty string name input', async () => {
      await expect(
        Base.getExistingSoftware({
          softwares: [],
          name: '',
          prompt: jest.fn().mockResolvedValue(''),
          interactive: false,
        })
      ).rejects.toThrow('Must specify existing name when non-interactive')
    })
    it('throws error if non-interactive string name does not exist', async () => {
      const name = 'foo'
      await expect(
        Base.getExistingSoftware({
          softwares: [],
          name,
          prompt: jest.fn().mockResolvedValue(''),
          interactive: false,
        })
      ).rejects.toThrow(`Invalid existing software "${name}", does not exist.`)
    })
    it('prints error if interactive string name does not exist at first', async () => {
      const softwares = [
        new Software({
          name: 'pompeii',
          executable: {
            command: 'excavation',
          },
          installedRegex: 'eruption',
          url: 'https://buriedintime.com',
          latestRegex: 'vesuvius',
        }),
      ]

      const nonExistentName = 'bar'
      const nameSpy = jest.fn().mockResolvedValue(softwares[0].name)
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      await expect(
        Base.getExistingSoftware({
          softwares,
          name: nonExistentName,
          prompt: nameSpy,
          interactive: true,
        })
      ).resolves.toEqual(softwares[0])
      expect(consoleErrorSpy.mock.calls).toEqual([
        [colors.red(`Invalid existing software "${nonExistentName}", does not exist.`)],
      ])
    })
    it('prints error if interactive function name does not exist at first', async () => {
      const softwares = [
        new Software({
          name: 'atlantis',
          executable: {
            command: 'island',
          },
          installedRegex: 'submerged',
          url: 'https://hubrisincarnate.com',
          latestRegex: 'plato',
        }),
      ]

      const nonExistentName = 'fizz'
      const nameSpy = jest.fn().mockResolvedValueOnce(nonExistentName).mockResolvedValueOnce(softwares[0].name)
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      await expect(
        Base.getExistingSoftware({
          softwares,
          prompt: nameSpy,
          interactive: true,
        })
      ).resolves.toEqual(softwares[0])
      expect(consoleErrorSpy.mock.calls).toEqual([
        [colors.red(`Invalid existing software "${nonExistentName}", does not exist.`)],
      ])
    })
  })
})
