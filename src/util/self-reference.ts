import path from 'path'

export default class SelfReference {
  static getName(): string {
    return path.basename(process.execPath)
  }

  static getNameRegex(name: string): string {
    if (name.length >= 3) {
      const lengths = Math.floor(name.length / 3)
      return `${name.substring(0, lengths)}.*${name.substring(name.length - lengths)}`
    }
    return `${name[0]}.*`
  }

  static getDirectory(): string {
    return process.cwd()
  }
}
