import fetch from 'node-fetch'
import fs from 'fs-extra'
import { exec } from 'child_process'
import path from 'path'
import { promisify } from 'util'

const execa = promisify(exec)

export default class Software {
  readonly name: string
  readonly commandDir: string
  readonly dirRegex: string
  readonly args: string
  readonly command: string
  readonly installedRegex: string
  readonly url: string
  readonly latestRegex: string

  constructor({
    name,
    commandDir,
    dirRegex,
    command,
    args,
    installedRegex,
    url,
    latestRegex,
  }: {
    name: string
    commandDir: string
    dirRegex: string
    command: string
    args: string
    installedRegex: string
    url: string
    latestRegex: string
  }) {
    this.name = name
    this.commandDir = commandDir
    this.dirRegex = dirRegex
    this.command = command
    this.args = args
    this.installedRegex = installedRegex
    this.url = url
    this.latestRegex = latestRegex
  }

  async getInstalledVersion(): Promise<string | null> {
    let executable: string = this.command
    if (!executable) {
      const files = await fs.readdir(this.commandDir)
      for (const file of files) {
        if (!executable && new RegExp(this.dirRegex).test(file)) {
          executable = path.join(this.commandDir, file)
        }
      }
      if (!executable) {
        throw Error(
          `Could not find any file in directory '${this.commandDir}' matching regex pattern '${this.dirRegex}'`
        )
      }
    }
    const { stdout } = await execa(`${path.basename(executable)} ${this.args}`, {
      cwd: path.dirname(executable),
    })
    const matches = stdout.match(new RegExp(this.installedRegex))
    return matches && matches[1]
  }

  async getLatestVersion(): Promise<string | null> {
    const response = await fetch(this.url)
    const text = await response.text()
    const matches = text.match(new RegExp(this.latestRegex))
    return matches && matches[1]
  }
}
