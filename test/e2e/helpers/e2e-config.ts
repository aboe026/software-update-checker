import fs from 'fs-extra'
import os from 'os'
import path from 'path'

export default class E2eConfig {
  static readonly DIRECTORY = {
    UserConfig: path.join(os.homedir(), '.suc'),
    Temp: path.join(__dirname, '../.temp-work-dir'),
    BackupConfig: path.join(__dirname, '../.temp-work-dir', '.suc-temp'),
  }
  static readonly FILE = {
    Softwares: path.join(E2eConfig.DIRECTORY.UserConfig, 'softwares.json'),
    Debug: path.join(E2eConfig.DIRECTORY.Temp, 'e2e-debug.txt'),
  }

  static appendToDebugLog(words: string): void {
    fs.appendFileSync(E2eConfig.FILE.Debug, `${words}\n`)
  }
}
