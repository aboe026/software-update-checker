import fs from 'fs-extra'
import { Octokit } from '@octokit/rest'
import path from 'path'

import env from './env'
import { getDescription } from './release-notes'
import interactiveExecute, { getExecutableName } from '../../test/e2e/helpers/interactive-execute'

const owner = 'aboe026'
const repo = 'software-update-checker'

;(async () => {
  const github = new Octokit({
    auth: env.GITHUB_PERSONAL_ACCESS_TOKEN,
    userAgent: 'software-update-checker',
  })
  const assetsDir = path.isAbsolute(env.ASSETS_DIRECTORY)
    ? env.ASSETS_DIRECTORY
    : path.join(__dirname, env.ASSETS_DIRECTORY)
  if (!(await fs.pathExists)) {
    throw Error(`Assets directory "${assetsDir}" specified does not exist`)
  }
  const completeVersion = await getReleaseVersion(assetsDir)
  const [version, build] = completeVersion.split('+')
  console.log(`Creating release "${version}" from build "${build}"...`)
  const release = await github.repos.createRelease({
    owner,
    repo,
    tag_name: `v${version}`,
    draft: true,
    name: version,
    body: getDescription({
      version,
      build,
    }),
  })
  const assetPaths = await getAssetPaths(assetsDir)
  for (const assetPath of assetPaths) {
    const assetName = path.basename(assetPath)
    console.log(`Uploading asset "${assetName}"...`)
    await github.repos.uploadReleaseAsset({
      owner,
      repo,
      release_id: release.data.id,
      name: assetName,
      data: (await fs.readFile(assetPath)) as unknown as string,
      headers: {
        'content-type': 'application/octet-stream',
        'content-length': (await fs.stat(assetPath)).size,
      },
    })
  }
  console.log(`Draft release created at "${release.data.html_url}"`)
})().catch((err) => {
  console.error(err)
  process.exit(1)
})

async function getReleaseVersion(assetsDirectory: string): Promise<string> {
  console.log(`Determining release version from "${path.join(assetsDirectory, getExecutableName())}" executable...`)
  const response = await interactiveExecute({
    args: ['--version'],
    directory: assetsDirectory,
    verboseToFile: false,
  })
  return response.stdout.trim()
}

async function getAssetPaths(assetsDirectory: string): Promise<string[]> {
  const assetNames = await fs.readdir(assetsDirectory)
  const assetPaths: string[] = []
  for (const assetName of assetNames) {
    assetPaths.push(path.join(assetsDirectory, assetName))
  }
  return assetPaths
}
