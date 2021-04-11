import fs from 'fs-extra'
import path from 'path'

import E2eBaseUtil from './e2e-base-util'

beforeAll(async () => {
  if (await fs.pathExists(E2eBaseUtil.DIRECTORY.TempBackupConfig)) {
    console.error(
      `Temporary config directory '${E2eBaseUtil.DIRECTORY.TempBackupConfig}' exists, previous run must not have exited properly. Please make sure actual user config dir '${E2eBaseUtil.DIRECTORY.UserConfig}' is correct, then delete temporary config directory '${E2eBaseUtil.DIRECTORY.TempBackupConfig}' to run e2e tests.`
    )
    process.exit(1)
  }
  if (await fs.pathExists(E2eBaseUtil.DIRECTORY.UserConfig)) {
    await fs.ensureDir(E2eBaseUtil.DIRECTORY.TempBackupConfig)
    const files = await fs.readdir(E2eBaseUtil.DIRECTORY.UserConfig)
    for (const file of files) {
      await fs.move(
        path.join(E2eBaseUtil.DIRECTORY.UserConfig, file),
        path.join(E2eBaseUtil.DIRECTORY.TempBackupConfig, file)
      )
    }
  }
})

beforeEach(async () => {
  await fs.remove(path.join(E2eBaseUtil.DIRECTORY.UserConfig, E2eBaseUtil.SOFTWARES_FILE_NAME))
})

afterAll(async () => {
  await fs.remove(E2eBaseUtil.DIRECTORY.UserConfig)
  await fs.ensureDir(E2eBaseUtil.DIRECTORY.UserConfig)
  if (await fs.pathExists(E2eBaseUtil.DIRECTORY.TempBackupConfig)) {
    const files = await fs.readdir(E2eBaseUtil.DIRECTORY.TempBackupConfig)
    for (const file of files) {
      await fs.move(
        path.join(E2eBaseUtil.DIRECTORY.TempBackupConfig, file),
        path.join(E2eBaseUtil.DIRECTORY.UserConfig, file)
      )
    }
    await fs.remove(E2eBaseUtil.DIRECTORY.TempBackupConfig)
  }
})
