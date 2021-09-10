import fs from 'fs-extra'
import path from 'path'

import E2eBaseUtil from './e2e-base-util'

export default class E2eVersionUtil extends E2eBaseUtil {
  static getSilentCommand(subCommands: string[] = []): string[] {
    return ['version'].concat(subCommands)
  }

  static getLongOption(subCommands: string[] = []): string[] {
    return ['--version'].concat(subCommands)
  }

  static getShortOption(subCommands: string[] = []): string[] {
    return ['-v'].concat(subCommands)
  }

  static async getChunks(): Promise<string[]> {
    const packageJson = await fs.readJSON(path.join(__dirname, '../../../package.json'))
    const buildJson = await fs.readJSON(path.join(__dirname, '../../../build.json'))
    return [`${packageJson.version}+${buildJson.number}`]
  }
}
