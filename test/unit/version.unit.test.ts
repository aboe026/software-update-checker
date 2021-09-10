import fs from 'fs-extra'
import path from 'path'

import Version from '../../src/actions/version/version'

describe('Version Unit Tests', () => {
  describe('getVersion', () => {
    it('returns concatenation of package json version and build json number', async () => {
      const packageJson = await fs.readJSON(path.join(__dirname, '../../package.json'))
      const buildJson = await fs.readJSON(path.join(__dirname, '../../build.json'))
      expect(Version.getVersion()).toBe(`${packageJson.version}+${buildJson.number}`)
    })
  })
})
