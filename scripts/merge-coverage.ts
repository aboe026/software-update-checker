import { exec } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
;(async () => {
  const coverageDir = path.join(__dirname, '../coverage')
  const tempMergeDir = path.join(coverageDir, 'temp-merge')
  const finalMergedDir = path.join(coverageDir, 'merged')
  await validateCoverageFileExists(coverageDir, 'unit')
  await validateCoverageFileExists(coverageDir, 'func')
  await cleanDir(tempMergeDir)
  await fs.copy(path.join(coverageDir, 'unit/coverage-final.json'), path.join(tempMergeDir, 'coverage-unit.json'))
  await fs.copy(path.join(coverageDir, 'func/coverage-final.json'), path.join(tempMergeDir, 'coverage-func.json'))
  await execute(`nyc merge ${tempMergeDir} ${path.join(finalMergedDir, 'coverage-final.json')}`)
  await fs.remove(tempMergeDir)
  await execute(
    `nyc report --temp-dir ${finalMergedDir} --reporter text --reporter html --reporter cobertura --report-dir ${finalMergedDir}`
  )
})().catch((err) => {
  console.error(err)
  process.exit(1)
})

async function validateCoverageFileExists(coverageDirectory: string, type: string): Promise<void> {
  const coverageFilePath = path.join(coverageDirectory, type, 'coverage-final.json')
  try {
    await fs.access(coverageFilePath)
  } catch (err) {
    throw Error(
      `Cannot access coverage file "${coverageFilePath}" for type "${type}". Make sure "${type}" type tests have been run.`
    )
  }
}

async function cleanDir(dir: string): Promise<void> {
  await fs.remove(dir)
  await fs.ensureDir(dir)
}

async function execute(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`${command} --colors`, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else if (stderr) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    }).stdout?.pipe(process.stdout)
  })
}
