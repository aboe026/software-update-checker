import fs from 'fs-extra'
import path from 'path'

import upgrades from '../../src/software/upgrades/all-upgrades'

describe('All Upgrades Unit Tests', () => {
  it('all upgrades contains as many upgrades as exist in the upgrades directory', async () => {
    const upgradesDir = path.join(__dirname, '../../src/software/upgrades')
    const upgradesFiles = await fs.readdir(upgradesDir)
    expect(upgradesFiles).not.toBe(undefined)
    expect(typeof upgradesFiles).toBe('object')
    expect(Array.isArray(upgradesFiles)).toBe(true)
    expect(upgrades().length + 1).toBe(upgradesFiles.length)
  })
})
