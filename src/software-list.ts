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

  static getSavedFilePath(): string {
    return SoftwareList.savedFile
  }

  static async add(software: Software): Promise<Software[]> {
    const softwares: Software[] = SoftwareList.get()
    if (softwares.find((s) => s.name === software.name)) {
      throw Error(`Software with name '${software.name}' already exists.`)
    }
    softwares.push(software)
    return SoftwareList.save(softwares)
  }

  static async edit(oldSoftware: Software, newSoftware: Software): Promise<Software[]> {
    const softwares: Software[] = SoftwareList.get()
    const index = softwares.findIndex((software) => software.name === oldSoftware.name)
    if (index < 0) {
      throw Error(`Could not find software to edit with name '${oldSoftware.name}'.`)
    }
    softwares.splice(index, 1, newSoftware)
    return SoftwareList.save(softwares)
  }

  static async delete(name: string): Promise<Software[]> {
    if (name === '') {
      throw Error('Must specify non-empty name to delete')
    }
    const softwares: Software[] = SoftwareList.get()
    const index = softwares.findIndex((software) => software.name === name)
    if (index < 0) {
      throw Error(`Could not find software to delete with name '${name}'.`)
    }
    softwares.splice(index, 1)
    return SoftwareList.save(softwares)
  }

  static async save(softwares: Software[]): Promise<Software[]> {
    softwares = softwares.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
    const file = SoftwareList.getSavedFilePath()
    await fs.ensureDir(path.dirname(file))
    await fs.writeFile(file, JSON.stringify(softwares, null, 2))
    SoftwareList.softwares = softwares
    return softwares
  }

  static async load(): Promise<Software[]> {
    const file = SoftwareList.getSavedFilePath()
    SoftwareList.softwares = []
    const softwares: Software[] = []
    if (await fs.pathExists(file)) {
      try {
        const contents = await fs.readFile(file)
        if (contents.toString() === '') {
          return SoftwareList.save(softwares)
        }
        let json = JSON.parse(contents.toString())
        if (!json || !Array.isArray(json)) {
          throw Error(`Saved file '${file}' does not contain a valid JSON array`)
        }
        for (const obj of json) {
          if (!obj.name) {
            throw Error(`Saved file '${file}' contains an invalid software entry that does not have a name`)
          }
          if (!obj.executable) {
            throw Error(
              `Saved file '${file}' contains an invalid software entry '${obj.name}' that does not have an executable`
            )
          }
          if (!obj.executable.command && !obj.executable.directory) {
            throw Error(
              `Saved file '${file}' contains an invalid software entry '${obj.name}' that is dynamic but does not have an executable directory`
            )
          }
          if (!obj.executable.command && !obj.executable.regex) {
            throw Error(
              `Saved file '${file}' contains an invalid software entry '${obj.name}' that is dynamic but does not have an executable regex`
            )
          }
          if (!obj.installedRegex) {
            throw Error(
              `Saved file '${file}' contains an invalid software entry '${obj.name}' that does not have an installedRegex`
            )
          }
          if (!obj.url) {
            throw Error(
              `Saved file '${file}' contains an invalid software entry '${obj.name}' that does not have a url`
            )
          }
          if (!obj.latestRegex) {
            throw Error(
              `Saved file '${file}' contains an invalid software entry '${obj.name}' that does not have a latestRegex`
            )
          }
        }
        json = json.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)) // sort alphabetically
        for (const obj of json) {
          softwares.push(
            new Software({
              name: obj.name,
              executable: obj.executable,
              args: obj.args,
              shellOverride: obj.shellOverride,
              installedRegex: obj.installedRegex,
              url: obj.url,
              latestRegex: obj.latestRegex,
            })
          )
        }
      } catch (err) {
        throw Error(`Cannot parse saved file '${file}' as JSON: ${err.message}`)
      }
    }
    return SoftwareList.save(softwares)
  }
}
