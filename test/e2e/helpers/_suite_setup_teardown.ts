import fs from 'fs-extra'
import path from 'path'

import E2eConfig from './e2e-config'

/**
 * Scoped to test files (suites)
 * beforeAll -> runs at the beginning of each test file (suite)
 * beforeEach -> runs at the beginning of each test in each test file (suite)
 * afterEach -> runs at the end of each test in each test file (suite)
 * afterAll -> runs at the end of each test file (suite)
 */

beforeEach(async () => {
  await fs.remove(E2eConfig.FILE.Softwares)
  await E2eConfig.appendToDebugLog(`${expect.getState().currentTestName}...`)
})

afterEach(async () => {
  await E2eConfig.appendToDebugLog(`...${expect.getState().currentTestName}\n`)
})
