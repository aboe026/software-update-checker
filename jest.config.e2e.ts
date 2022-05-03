import type { Config } from '@jest/types'

import config from './jest.config'

const e2eConfig: Config.InitialOptions = {
  globalSetup: './test/e2e/helpers/_global_setup.ts',
  globalTeardown: './test/e2e/helpers/_global_teardown.ts',
  maxWorkers: 1, // same as --runInBand
  setupFilesAfterEnv: ['./test/e2e/helpers/_suite_setup_teardown.ts'],
  testTimeout: 30000,
}

export default {
  ...config,
  ...e2eConfig,
}
