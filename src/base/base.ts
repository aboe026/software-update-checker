import colors from '../colors'
import Software from '../software'

export default class Base {
  static async getExisting({
    name,
    softwares,
    interactive,
  }: {
    name: string | ((softwares: Software[]) => Promise<string>)
    softwares: Software[]
    interactive: boolean
  }): Promise<Software> {
    let existing: Software | undefined = undefined
    while (!existing) {
      const existingName = typeof name === 'string' ? name : await name(softwares)
      existing = softwares.find((software) => software.name === existingName)
      if (!existing) {
        const message = `Invalid existing software "${existingName}", does not exist.`
        if (!interactive) {
          throw Error(message)
        }
        console.error(colors.red(message))
      }
    }
    return existing
  }
}
