import colors from '../../util/colors'
import Software from '../../software/software'

export default class Base {
  static async getExistingSoftware({
    name,
    prompt,
    softwares,
    interactive,
  }: {
    name?: string
    prompt: (softwares: Software[]) => Promise<string>
    softwares: Software[]
    interactive: boolean
  }): Promise<Software> {
    let existing: Software | undefined = undefined
    let firstAttempt = true
    while (!existing) {
      if (firstAttempt && !name && !interactive) {
        throw Error('Must specify existing name when non-interactive')
      }
      const existingName = firstAttempt && name ? name : await prompt(softwares)
      firstAttempt = false
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

  static getMissingRequiredOptionErrorMessage(option: string): string {
    return `Option "${option}" must be non-empty string`
  }
}
