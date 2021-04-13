import fs from 'fs-extra'
import path from 'path'

import E2eConfig from './e2e-config'

/**
 * Run once after all tests execute
 */

export default async (): Promise<void> => {
  await fs.remove(E2eConfig.DIRECTORY.UserConfig)
  await fs.ensureDir(E2eConfig.DIRECTORY.UserConfig)
  if (await fs.pathExists(E2eConfig.DIRECTORY.BackupConfig)) {
    const files = await fs.readdir(E2eConfig.DIRECTORY.BackupConfig)
    for (const file of files) {
      await fs.move(path.join(E2eConfig.DIRECTORY.BackupConfig, file), path.join(E2eConfig.DIRECTORY.UserConfig, file))
    }
    await fs.remove(E2eConfig.DIRECTORY.BackupConfig)
  }
}
