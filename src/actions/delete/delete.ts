import Base from '../base/base'
import colors from '../../util/colors'
import DeletePrompts from './delete-prompts'
import Software from '../../software/software'
import SoftwareList from '../../software/software-list'

export default class Delete extends Base {
  static async removeConfiguration({ inputs }: { inputs?: Inputs }): Promise<void> {
    const softwares = await SoftwareList.load()
    if (softwares.length === 0) {
      console.warn(colors.yellow('No softwares to delete. Please add a software to have something to delete.'))
    } else {
      const interactive = !inputs || inputs.interactive === true

      const existing: Software = await Delete.getExistingSoftware({
        name: inputs?.existing,
        prompt: DeletePrompts.getExisting,
        softwares,
        interactive,
      })

      let deleteConfirmed = true
      if (interactive) {
        deleteConfirmed = await DeletePrompts.getDeleteConfirmed(existing.name)
      }
      if (deleteConfirmed) {
        await SoftwareList.delete(existing.name)
      }
    }
  }
}

export interface Inputs {
  existing?: string
  interactive?: boolean
}
