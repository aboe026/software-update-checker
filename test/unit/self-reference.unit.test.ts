import SelfReference from '../../src/util/self-reference'

describe('Self Reference Unit Tests', () => {
  describe('getName', () => {
    const origExecPath = process.execPath
    const execName = 'executable.exe'
    beforeEach(() => {
      process.execPath = `/i/am/a/path/to/${execName}`
    })
    afterEach(() => {
      process.execPath = origExecPath
    })
    it('returns base name of process execution path', () => {
      expect(SelfReference.getName()).toBe(execName)
    })
  })
  describe('getNameRegex', () => {
    it('returns single character with any regex if 1 character in file name', () => {
      expect(SelfReference.getNameRegex('s')).toBe('s.*')
    })
    it('returns single character with any regex if 2 characters in file name', () => {
      expect(SelfReference.getNameRegex('su')).toBe('s.*')
    })
    it('returns first and last characters separated by any regex if 3 characters in file name', () => {
      expect(SelfReference.getNameRegex('suc')).toBe('s.*c')
    })
    it('returns first and last characters separated by any regex if 4 characters in file name', () => {
      expect(SelfReference.getNameRegex('sucv')).toBe('s.*v')
    })
    it('returns first and last characters separated by any regex if 5 characters in file name', () => {
      expect(SelfReference.getNameRegex('s.exe')).toBe('s.*e')
    })
    it('returns first and last 2 characters separated by any regex if 6 characters in file name', () => {
      expect(SelfReference.getNameRegex('su.exe')).toBe('su.*xe')
    })
    it('returns first and last 2 characters separated by any regex if 7 characters in file name', () => {
      expect(SelfReference.getNameRegex('suc.exe')).toBe('su.*xe')
    })
    it('returns first and last 2 characters separated by any regex if 8 characters in file name', () => {
      expect(SelfReference.getNameRegex('sucv.exe')).toBe('su.*xe')
    })
    it('returns first and last 3 characters separated by any regex if 9 characters in file name', () => {
      expect(SelfReference.getNameRegex('suc-v.exe')).toBe('suc.*exe')
    })
    it('returns first and last 9 characters separated by any regex if 29 default macos characters in file name', () => {
      expect(SelfReference.getNameRegex('software-update-checker-macos')).toBe('software-.*ker-macos')
    })
    it('returns first and last 9 characters separated by any regex if 29 default linux characters in file name', () => {
      expect(SelfReference.getNameRegex('software-update-checker-linux')).toBe('software-.*ker-linux')
    })
    it('returns first and last 10 characters separated by any regex if 31 default windows characters in file name', () => {
      expect(SelfReference.getNameRegex('software-update-checker-win.exe')).toBe('software-u.*er-win.exe')
    })
  })
  describe('getDirectory', () => {
    it('returns the working directory of the process', () => {
      const dir = 'oboe'
      jest.spyOn(process, 'cwd').mockReturnValue(dir)
      expect(SelfReference.getDirectory()).toBe(dir)
    })
  })
})
