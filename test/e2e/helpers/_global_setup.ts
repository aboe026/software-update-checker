import fs from 'fs-extra'
import path from 'path'

import E2eConfig from './e2e-config'

/**
 * Run once before all tests execute
 */

export default async (): Promise<void> => {
  if (await fs.pathExists(E2eConfig.DIRECTORY.BackupConfig)) {
    console.error(
      `Temporary config directory "${E2eConfig.DIRECTORY.BackupConfig}" exists, previous run must not have exited properly. Please make sure actual user config dir "${E2eConfig.DIRECTORY.UserConfig}" is correct, then delete temporary config directory "${E2eConfig.DIRECTORY.BackupConfig}" to run e2e tests.`
    )
    process.exit(1)
  }
  if (await fs.pathExists(E2eConfig.DIRECTORY.UserConfig)) {
    await fs.ensureDir(E2eConfig.DIRECTORY.BackupConfig)
    const files = await fs.readdir(E2eConfig.DIRECTORY.UserConfig)
    for (const file of files) {
      await fs.move(path.join(E2eConfig.DIRECTORY.UserConfig, file), path.join(E2eConfig.DIRECTORY.BackupConfig, file))
    }
  }

  try {
    await fs.access(E2eConfig.FILE.Debug)
    await fs.remove(E2eConfig.FILE.Debug)
  } catch (err) {
    // debug file does not exist, no need to delete
  }
  await fs.createFile(E2eConfig.FILE.Debug)
}
