import fs from 'fs-extra'

export enum CommandType {
  Static = 'static',
  Dynamic = 'dynamic',
}

export type Static = {
  command: string
}

export type Dynamic = {
  regex: string
}

export function isStatic(executable: Static | Dynamic): executable is Static {
  return (executable as Static).command !== undefined
}

export async function getDynamicExecutable({
  directory,
  regex,
}: {
  directory?: string
  regex: string
}): Promise<string> {
  const dir = directory || process.cwd()
  let executable = ''
  if (!(await fs.pathExists(dir))) {
    throw Error(`Directory specified "${dir}" does not exist. Please specify a valid path.`)
  }
  const files = await fs.readdir(dir)
  for (const file of files) {
    if (!executable && new RegExp(regex).test(file)) {
      executable = file
    }
  }
  if (!executable) {
    throw Error(`Could not find any file in directory "${dir}" matching regex pattern "${regex}"`)
  }
  return executable
}
