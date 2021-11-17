import colors from 'colors'
import fs from 'fs-extra'
import path from 'path'
;(async () => {
  colors.enable() // force colors, even on non-color supporting terminals (eg Jenkins CI)
  const ignoreDirectories = await getDirectoriesToIgnore()
  const fileNames = await getFilePathsRecursively(path.join(__dirname, '../test'), ignoreDirectories)
  const resources: TestResource[] = []
  for (const fileName of fileNames) {
    resources.push(...(await getTestResources(fileName)))
  }
  const types: TestResourceType[] = resources.map((resource) => resource.type).filter((x, i, a) => a.indexOf(x) === i)
  const duplicates: TestResource[] = []
  for (const type of types) {
    const resourcesForType: TestResource[] = resources.filter((resource) => resource.type === type)
    const values: string[] = resourcesForType.map((resource) => resource.value).filter((x, i, a) => a.indexOf(x) === i)
    for (const value of values) {
      const resourcesForTypeAndValue: TestResource[] = resourcesForType.filter((resource) => resource.value === value)
      if (resourcesForTypeAndValue.length > 1) {
        duplicates.push(...resourcesForTypeAndValue)
      }
    }
  }

  const duplicateTypes: TestResourceType[] = duplicates
    .map((resource) => resource.type)
    .filter((x, i, a) => a.indexOf(x) === i)
  for (const type of duplicateTypes) {
    const duplicatesForType: TestResource[] = duplicates.filter((resource) => resource.type === type)
    console.log(colors.red(`Duplicates for field "${type}" (${duplicatesForType.length}):`))
    const duplicateValues: string[] = duplicatesForType
      .map((resource) => resource.value)
      .filter((x, i, a) => a.indexOf(x) === i)
    for (const value of duplicateValues) {
      const duplicatesForValue: TestResource[] = duplicatesForType.filter((resource) => resource.value === value)
      console.log(`    "${value}" (${duplicatesForValue.length}):`)
      for (const resource of duplicatesForValue) {
        console.log(`        ${resource.filePath}:${resource.line}`)
      }
    }
  }
  if (duplicates.length > 0) {
    process.exit(1)
  } else {
    console.log('No duplicate resources detected :)')
  }
})().catch((err) => {
  console.error(err)
  process.exit(1)
})

async function getDirectoriesToIgnore(): Promise<string[]> {
  const directoriesToIgnore = []
  const prettierIgnoreFile = path.join(__dirname, '../.prettierignore')
  const prettierIgnoreContents = await fs.readFile(prettierIgnoreFile, {
    encoding: 'utf-8',
  })
  for (const line of prettierIgnoreContents.split(/\r?\n/)) {
    directoriesToIgnore.push(path.join(__dirname, '../', line))
  }
  return directoriesToIgnore
}

async function getFilePathsRecursively(directory: string, ignores: string[]): Promise<string[]> {
  const filePaths = []
  const fileNames = await fs.readdir(directory)
  for (const fileName of fileNames) {
    const stats = await fs.lstat(path.join(directory, fileName))
    if (stats.isDirectory()) {
      if (!ignores.includes(path.join(directory, fileName))) {
        filePaths.push(...(await getFilePathsRecursively(path.join(directory, fileName), ignores)))
      }
    } else {
      filePaths.push(path.join(directory, fileName))
    }
  }
  return filePaths
}

async function getTestResources(filePath: string): Promise<TestResource[]> {
  const resources: TestResource[] = []
  const fileContents = await fs.readFile(filePath, {
    encoding: 'utf-8',
  })
  const lines = fileContents.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].endsWith('// ignore-duplicate-test-resource')) {
      addResourceMatchingRegex({
        type: TestResourceType.name,
        regex: /name: '(.*)'/,
        ignore: [''],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.name,
        regex: /name = '(.*)'/,
        ignore: [''],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.shell,
        regex: /shell: '(.*)'/,
        ignore: ['', 'pwsh'],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.shell,
        regex: /shell = '(.*)'/,
        ignore: [''],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.directory,
        regex: /directory: '(.*)'/,
        ignore: [''],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.directory,
        regex: /directory = '(.*)'/,
        ignore: [''],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.command,
        regex: /command: '(.*)'/,
        ignore: ['', 'node'],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.command,
        regex: /command = '(.*)'/,
        ignore: ['', 'node'],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.regex,
        regex: /regex: '(.*)'/,
        ignore: ['', 'v(.*)'],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.regex,
        regex: /regex = '(.*)'/,
        ignore: ['', 'v(.*)'],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.args,
        regex: /args: '(.*)'/,
        ignore: [''],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.args,
        regex: /args = '(.*)'/,
        ignore: [''],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.installedRegex,
        regex: /installedRegex: '(.*)'/,
        ignore: ['', 'v(.*)'],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.installedRegex,
        regex: /installedRegex = '(.*)'/,
        ignore: ['', 'v(.*)'],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.url,
        regex: /url: '(.*)'/,
        ignore: [''],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.url,
        regex: /url = '(.*)'/,
        ignore: [''],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.latestRegex,
        regex: /latestRegex: '(.*)'/,
        ignore: ['', 'latest: v(.*)'],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
      addResourceMatchingRegex({
        type: TestResourceType.latestRegex,
        regex: /latestRegex = '(.*)'/,
        ignore: ['', 'latest: v(.*)'],
        lines,
        line: i + 1,
        filePath,
        resources,
      })
    }
  }
  return resources
}

function addResourceMatchingRegex({
  lines,
  regex,
  ignore,
  type,
  filePath,
  line,
  resources,
}: {
  lines: string[]
  regex: RegExp
  ignore?: string[]
  type: TestResourceType
  filePath: string
  line: number
  resources: TestResource[]
}) {
  const match = lines[line - 1].match(regex)
  if (match) {
    const value = match[1]
    if (!ignore || !ignore.includes(value)) {
      resources.push({
        type,
        value: match[1],
        filePath,
        line,
      })
    }
  }
}

enum TestResourceType {
  name = 'name',
  shell = 'shell',
  directory = 'directory',
  command = 'command',
  regex = 'regex',
  args = 'args',
  installedRegex = 'installedRegex',
  url = 'url',
  latestRegex = 'latestRegex',
}

interface TestResource {
  type: TestResourceType
  value: string
  filePath: string
  line: number
}
