import fetch from 'node-fetch'
import { ExecOptions } from 'child_process'
import path from 'path'

import { Dynamic, Static, isStatic, getDynamicExecutable } from './executable'
import execute from '../util/execute-async'
import SelfReference from '../util/self-reference'

export default class Software {
  readonly name: string
  readonly executable: Dynamic | Static
  readonly args?: string
  readonly shell?: string
  readonly installedRegex: string
  readonly url: string
  readonly latestRegex: string

  constructor({
    name,
    executable,
    args,
    shell,
    installedRegex,
    url,
    latestRegex,
  }: {
    name: string
    executable: Dynamic | Static
    args?: string
    shell?: string
    installedRegex: string
    url: string
    latestRegex: string
  }) {
    if (name === '') {
      throw Error('Name must be non-empty')
    }
    this.name = name
    this.executable = executable
    this.args = args
    this.shell = shell
    this.installedRegex = installedRegex
    this.url = url
    this.latestRegex = latestRegex
  }

  async getInstalledVersion(): Promise<string | null> {
    const executable = await getExecutable(this.executable)
    const output = await getFromExecutable({
      directory: path.dirname(executable),
      command: path.basename(executable),
      args: this.args,
      shell: this.shell,
    })
    return getFromRegex(output, new RegExp(this.installedRegex))
  }

  async getLatestVersion(): Promise<string | null> {
    const response = await getFromUrl(this.url)
    return getFromRegex(response, new RegExp(this.latestRegex))
  }
}

export async function getExecutable(executable: Static | Dynamic): Promise<string> {
  if (isStatic(executable)) {
    return executable.command
  }
  return getDynamicExecutable({
    directory: executable.directory,
    regex: executable.regex,
  })
}

export async function getFromExecutable({
  directory,
  command,
  args,
  shell,
}: {
  directory: string
  command: string
  args?: string
  shell?: string
}): Promise<string> {
  if (command === SelfReference.getName() && (directory === '.' || directory === SelfReference.getDirectory())) {
    // TODO: the "./" should be part of the example command in the future (when the working directory is a separate question)
    // rather than being added in here manually
    command = `./${command} ${(process as any).pkg.defaultEntrypoint}` // To get around self-reference/recursion: https://github.com/vercel/pkg/issues/376
  }
  const options: ExecOptions = {
    cwd: directory,
  }
  if (shell) {
    options.shell = shell
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
