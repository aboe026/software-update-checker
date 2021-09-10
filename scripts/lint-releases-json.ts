import colors from 'colors'
import fs from 'fs-extra'
import path from 'path'

// https://semver.org/
const SEMVER_REGEX =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

// {
//   "version": "x.y.z",
//   "description": "",
//   "breaking": [""],
//   "fixes": [""],
//   "features": [""]
// }

;(async () => {
  colors.enable() // force colors, even on non-color supporting terminals (eg Jenkins CI)
  const releasesJsonFilePath = path.join(__dirname, '../releases.json')
  try {
    await fs.access(releasesJsonFilePath)
  } catch (err: any) {
    throw Error(`Cannot access releases json file at "${releasesJsonFilePath}": "${err.message || err}""`)
  }
  const releasesJsonContents = await fs.readFile(releasesJsonFilePath)
  let releasesJson
  try {
    releasesJson = JSON.parse(releasesJsonContents.toString())
  } catch (err: any) {
    throw Error(`Cannot parse releases json at "${releasesJsonFilePath}" as valid JSON: "${err.message || err}"`)
  }
  if (!Array.isArray(releasesJson)) {
    throw Error(`Releases json "${JSON.stringify(releasesJson)}" is not a valid JSON array.`)
  }
  for (const release of releasesJson) {
    if (!release.version) {
      throw Error(`Release "${JSON.stringify(release)}" must contain a "version" property`)
    }
    if (!new RegExp(SEMVER_REGEX).test(release.version)) {
      throw Error(`Release "${JSON.stringify(release)}" does not have a valid semver for its "version" property`)
    }
    let somethingChanged = false
    if (hasChanged(release, 'breaking')) {
      somethingChanged = true
    }
    if (hasChanged(release, 'fixes')) {
      somethingChanged = true
    }
    if (hasChanged(release, 'features')) {
      somethingChanged = true
    }
    if (!somethingChanged) {
      throw Error(`Release "${JSON.stringify(release)}" must have either "breaking", "fixes" or "features" listed`)
    }
  }
  console.log('All releases valid :)')
})().catch((err) => {
  console.error(err)
  process.exit(1)
})

function hasChanged(release: any, type: string): boolean {
  let changed = false
  if (release[type]) {
    if (!Array.isArray(release[type])) {
      throw Error(`Release "${JSON.stringify(release)}" property "${type}" is not a valid JSON array`)
    }
    const changes = release[type].filter((change: any) => change)
    if (changes.length !== release[type].length) {
      throw Error(`Release "${JSON.stringify(release)}" property "${type}" contains invalid element`)
    }
    if (changes.length > 0) {
      changed = true
    }
  }
  return changed
}
