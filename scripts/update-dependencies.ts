import { exec } from 'child_process'
import path from 'path'
import { replaceInFile } from 'replace-in-file'
import util from 'util'

const execa = util.promisify(exec)
const DENY_LIST: string[] = ['inquirer', 'node-fetch', '@types/node-fetch', 'yargs']
;(async () => {
  const outdated = await getOutdatedDependencies()
  for (const key in outdated) {
    if (DENY_LIST.includes(key)) {
      console.log(`Skipping "${key}" due to deny list`)
    } else {
      const info: OutdatedDependency = outdated[key]
      const currentFirstDigit = info.current.split('.')[0]
      const latestFirstDigit = info.latest.split('.')[0]
      if (latestFirstDigit > currentFirstDigit) {
        console.warn(`Major version bump for "${key}" - "${info.current}" to "${info.latest}"`)
      }
      await replaceInFile({
        files: path.join(__dirname, '../package.json'),
        from: `"${key}": "${info.current}"`,
        to: `"${key}": "${info.latest}"`,
      })
    }
  }
})()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .then(() => {
    console.log('Dependencies updated! Run "npm install" to install new dependencies.')
    process.exit(0)
  })

async function getOutdatedDependencies(): Promise<OutdatedDependenciesList> {
  let response: any
  try {
    response = await execa('npm outdated --json')
  } catch (err: any) {
    if (err && err.stderr === '' && err.stdout) {
      response = err
    } else {
      throw err
    }
  }
  if (response.stderr) {
    throw new Error(`Error executing 'npm outdated --json' command: ${JSON.stringify(response, null, 2)}`)
  }
  let outdatedJson
  try {
    outdatedJson = JSON.parse(response.stdout)
  } catch (err: any) {
    throw new Error(`Error parsing outdated as JSON: ${err.message || err}`)
  }
  return outdatedJson
}

interface OutdatedDependenciesList {
  [key: string]: OutdatedDependency
}

interface OutdatedDependency {
  current: string
  wanted: string
  latest: string
  location: string
}
