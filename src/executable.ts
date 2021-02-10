import fs from 'fs-extra'
import path from 'path'

export type Static = {
  command: string
}

export type Dynamic = {
  directory: string
  regex: string
}

export function isStatic(executable: Static | Dynamic): executable is Static {
  return (executable as Static).command !== undefined
}

export async function getDynamicExecutable({
  directory,
  regex,
}: {
  directory: string
  regex: string
}): Promise<string> {
  let executable = ''
  if (!(await fs.pathExists(directory))) {
    throw Error(`Directory specified '${directory}' does not exist. Please specify a valid path.`)
  }
  const files = await fs.readdir(directory)
  for (const file of files) {
    if (!executable && new RegExp(regex).test(file)) {
      executable = path.join(directory, file)
    }
  }
  if (!executable) {
    throw Error(`Could not find any file in directory '${directory}' matching regex pattern '${regex}'`)
  }
  return executable
}
