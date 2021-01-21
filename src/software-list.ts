import fs from 'fs-extra'
import path from 'path'
import os from 'os'

import Software from './software'

export default class SoftwareList {
  private static softwares: Software[] = []
  private static savedFile = path.join(os.homedir(), '.suc', 'softwares.json')

  static get(): Software[] {
    return SoftwareList.softwares
  }

  static async add(software: Software): Promise<Software[]> {
    SoftwareList.softwares.push(software)
    return SoftwareList.save()
  }

  static async edit(oldSoftware: Software, newSoftware: Software): Promise<Software[]> {
    const index = SoftwareList.softwares.findIndex((software) => software.name === oldSoftware.name)
    if (index < 0) {
      throw Error(`Could not find software to edit with name '${oldSoftware.name}'.`)
    }
    SoftwareList.softwares.splice(index, 1, newSoftware)
    return SoftwareList.save()
  }

  static async delete(name: string): Promise<Software[]> {
    const index = SoftwareList.softwares.findIndex((software) => software.name === name)
    if (index < 0) {
      throw Error(`Could not find software to delete with name '${name}'.`)
    }
    SoftwareList.softwares.splice(index, 1)
    return SoftwareList.save()
  }

  static async save(): Promise<Software[]> {
    const softwares: Software[] = SoftwareList.softwares
    await fs.ensureDir(path.dirname(SoftwareList.savedFile))
    await fs.writeFile(SoftwareList.savedFile, JSON.stringify(softwares, null, 2))
    return softwares
  }

  static async load(): Promise<Software[]> {
    SoftwareList.softwares = []
    if (await fs.pathExists(SoftwareList.savedFile)) {
      const contents = await fs.readFile(SoftwareList.savedFile)
      try {
        let json = JSON.parse(contents.toString())
        if (!json || !Array.isArray(json)) {
          throw Error(`Saved file '${SoftwareList.savedFile}' does not contain a valid JSON array`)
        }
        for (const obj of json) {
          if (!obj.name) {
            throw Error(
              `Saved file '${SoftwareList.savedFile}' contains an invalid software entry that does not have a name`
            )
          }
          if (!obj.commandDir && !obj.command) {
            throw Error(
              `Saved file '${SoftwareList.savedFile}' contains an invalid software entry '${obj.name}' that does not have a command`
            )
          }
          if (!obj.args) {
            throw Error(
              `Saved file '${SoftwareList.savedFile}' contains an invalid software entry '${obj.name}' that does not have a args`
            )
          }
          if (!obj.installedRegex) {
            throw Error(
              `Saved file '${SoftwareList.savedFile}' contains an invalid software entry '${obj.name}' that does not have an installedRegex`
            )
          }
          if (!obj.url) {
            throw Error(
              `Saved file '${SoftwareList.savedFile}' contains an invalid software entry '${obj.name}' that does not have a url`
            )
          }
          if (!obj.latestRegex) {
            throw Error(
              `Saved file '${SoftwareList.savedFile}' contains an invalid software entry '${obj.name}' that does not have a latestRegex`
            )
          }
          if (obj.commandDir && !obj.dirRegex) {
            throw Error(
              `Saved file '${SoftwareList.savedFile}' contains an invalid software entry '${obj.name}' that is dynamic but does not have a dirRegex`
            )
          }
        }
        json = json.sort((a, b) => (a.name > b.name ? 1 : -1)) // sort alphabetically
        for (const obj of json) {
          SoftwareList.add(
            new Software({
              name: obj.name,
              commandDir: obj.commandDir,
              dirRegex: obj.dirRegex,
              args: obj.args,
              command: obj.command,
              installedRegex: obj.installedRegex,
              url: obj.url,
              latestRegex: obj.latestRegex,
            })
          )
        }
      } catch (err) {
        throw Error(`Cannot parse saved file '${SoftwareList.savedFile}' as JSON: ${err.message || err}`)
      }
    }
    return SoftwareList.softwares
  }
}
