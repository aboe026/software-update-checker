import fs from 'fs-extra'
import path from 'path'
import os from 'os'

import Software from './software'
import Upgrader from '../util/upgrader'
import allUpgrades from './upgrades/all-upgrades'

export default class SoftwareList {
  private static softwares: Software[] = []
  private static savedFile = path.join(os.homedir(), '.suc', 'softwares.json')

  static get(): Software[] {
    return SoftwareList.softwares
  }

  static getSavedFilePath(): string {
    return SoftwareList.savedFile
  }

  static sortByName(softwares: Software[]): Software[] {
    const clonedSoftwares = []
    for (const software of softwares) {
      clonedSoftwares.push(
        new Software({
          name: software.name,
          executable: software.executable,
          args: software.args,
          shell: software.shell,
          installedRegex: software.installedRegex,
          url: software.url,
          latestRegex: software.latestRegex,
        })
      )
    }
    return clonedSoftwares.sort((a: Software, b: Software) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
  }

  static async add(software: Software): Promise<Software[]> {
    const softwares: Software[] = SoftwareList.get()
    if (softwares.find((s) => s.name === software.name)) {
      throw Error(`Software with name "${software.name}" already exists.`)
    }
    softwares.push(software)
    return SoftwareList.save(softwares)
  }

  static async edit(oldSoftware: Software, newSoftware: Software): Promise<Software[]> {
    const softwares: Software[] = SoftwareList.get()
    const index = softwares.findIndex((software) => software.name === oldSoftware.name)
    if (index < 0) {
      throw Error(`Could not find software to edit with name "${oldSoftware.name}".`)
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
      throw Error(`Could not find software to delete with name "${name}".`)
    }
    softwares.splice(index, 1)
    return SoftwareList.save(softwares)
  }

  static async save(softwares: Software[]): Promise<Software[]> {
    softwares = SoftwareList.sortByName(softwares)
    const file = SoftwareList.getSavedFilePath()
    await fs.ensureDir(path.dirname(file))
    await fs.writeFile(
      file,
      JSON.stringify(
        {
          version: allUpgrades().length,
          softwares,
        },
        null,
        2
      )
    )
    SoftwareList.softwares = softwares
    return softwares
  }

  static async load(): Promise<Software[]> {
    const file = SoftwareList.getSavedFilePath()
    SoftwareList.softwares = []
    const softwares: Software[] = []
    if (await fs.pathExists(file)) {
      let contents
      try {
        contents = await fs.readFile(file)
      } catch (err: any) {
        throw Error(`Cannot read contents of file "${file}": "${err.message || err}"`)
      }
      if (contents.toString() === '') {
        return SoftwareList.save(softwares)
      }

      let json
      try {
        json = JSON.parse(contents.toString())
      } catch (err: any) {
        throw Error(`Cannot parse saved file "${file}" as JSON: ${err.message}`)
      }

      if (!json || typeof json !== 'object') {
        throw Error(`Saved file "${file}" JSON must be of type "object", received type "${typeof json}"`)
      }
      if (!json.softwares) {
        throw Error(`Saved file "${file}" does not contain required "softwares" property`)
      }
      if (!Array.isArray(json.softwares)) {
        throw Error(`Saved file "${file}" property "softwares" is not an array`)
      }

      const objects = await Upgrader.run({
        objects: json.softwares,
        currentVersion: json.version || 0,
        upgrades: allUpgrades(),
      })

      for (const obj of objects) {
        if (!obj.name) {
          throw Error(`Saved file "${file}" contains an invalid software entry that does not have a name`)
        }
        if (!obj.executable) {
          throw Error(
            `Saved file "${file}" contains an invalid software entry "${obj.name}" that does not have an executable`
          )
        }
        if (!obj.executable.command && !obj.executable.directory) {
          throw Error(
            `Saved file "${file}" contains an invalid software entry "${obj.name}" that is dynamic but does not have an executable directory`
          )
        }
        if (!obj.executable.command && !obj.executable.regex) {
          throw Error(
            `Saved file "${file}" contains an invalid software entry "${obj.name}" that is dynamic but does not have an executable regex`
          )
        }
        if (!obj.installedRegex) {
          throw Error(
            `Saved file "${file}" contains an invalid software entry "${obj.name}" that does not have an installedRegex`
          )
        }
        if (!obj.url) {
          throw Error(`Saved file "${file}" contains an invalid software entry "${obj.name}" that does not have a url`)
        }
        if (!obj.latestRegex) {
          throw Error(
            `Saved file "${file}" contains an invalid software entry "${obj.name}" that does not have a latestRegex`
          )
        }
      }

      for (const obj of objects) {
        softwares.push(
          new Software({
            name: obj.name,
            executable: obj.executable,
            args: obj.args,
            shell: obj.shell,
            installedRegex: obj.installedRegex,
            url: obj.url,
            latestRegex: obj.latestRegex,
          })
        )
      }
    }
    return SoftwareList.save(softwares)
  }
}
