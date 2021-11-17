import { ExecOptions } from 'child_process'
import fetch from 'node-fetch'

import { Dynamic, Static, isStatic, getDynamicExecutable } from './executable'
import execute from '../util/execute-async'
import SelfReference from '../util/self-reference'

export default class Software {
  readonly name: string
  readonly shell?: string
  readonly directory?: string
  readonly executable: Dynamic | Static
  readonly args?: string
  readonly installedRegex: string
  readonly url: string
  readonly latestRegex: string

  constructor({
    name,
    shell,
    directory,
    executable,
    args,
    installedRegex,
    url,
    latestRegex,
  }: {
    name: string
    shell?: string
    directory?: string
    executable: Dynamic | Static
    args?: string
    installedRegex: string
    url: string
    latestRegex: string
  }) {
    if (name === '') {
      throw Error('Name must be non-empty')
    }
    this.name = name
    this.shell = shell
    this.directory = directory
    this.executable = executable
    this.args = args
    this.installedRegex = installedRegex
    this.url = url
    this.latestRegex = latestRegex
  }

  async getInstalledVersion(): Promise<string | null> {
    const directory = this.directory || process.cwd()
    const command = await getCommand({
      executable: this.executable,
      directory,
    })
    const output = await getFromExecutable({
      shell: this.shell,
      directory,
      command,
      args: this.args,
    })
    return getFromRegex(output, new RegExp(this.installedRegex))
  }

  async getLatestVersion(): Promise<string | null> {
    const response = await getFromUrl(this.url)
    return getFromRegex(response, new RegExp(this.latestRegex))
  }
}

export async function getCommand({
  executable,
  directory,
}: {
  executable: Static | Dynamic
  directory?: string
}): Promise<string> {
  if (isStatic(executable)) {
    return executable.command
  }
  return getDynamicExecutable({
    regex: executable.regex,
    directory,
  })
}

export async function getFromExecutable({
  shell,
  directory,
  command,
  args,
}: {
  shell?: string
  directory?: string
  command: string
  args?: string
}): Promise<string> {
  const defaultEntrypoint = (process as any).pkg?.defaultEntrypoint
  if (
    (command === SelfReference.getName() || command === `./${SelfReference.getName()}`) &&
    (directory === '.' || directory === SelfReference.getDirectory()) &&
    defaultEntrypoint
  ) {
    command = `${command} ${defaultEntrypoint}` // To get around self-reference/recursion issue: https://github.com/vercel/pkg/issues/376
  }
  const options: ExecOptions = {}
  if (shell) {
    options.shell = shell
  }
  if (directory) {
    options.cwd = directory
  }
  const { stdout, stderr } = await execute(`${command} ${args}`, options)
  return `${stdout.trim()}${stderr.trim()}`
}

export async function getFromUrl(url: string): Promise<string> {
  const response = await fetch(url)
  return response.text()
}

export function getFromRegex(text: string, regex: RegExp): string | null {
  const matches = text.match(regex)
  const matchesLength = matches && matches.length ? matches.length : 0
  if (matchesLength <= 0) {
    throw Error(`Could not find match for regex "${regex}" in text "${text}"`)
  }
  return matches && matches[1]
}
