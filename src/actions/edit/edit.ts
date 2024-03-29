import Add, { Inputs as AddInputs } from '../add/add'
import Base from '../base/base'
import colors from '../../util/colors'
import { CommandType, isStatic } from '../../software/executable'
import { EditOptions } from './edit-options'
import EditPrompts from './edit-prompts'
import Software from '../../software/software'
import SoftwareList from '../../software/software-list'

export default class Edit extends Base {
  static async editConfiguration({ inputs }: { inputs?: Inputs }): Promise<void> {
    const softwares = await SoftwareList.load()
    if (softwares.length === 0) {
      console.warn(colors.yellow('No softwares to edit. Please add a software to have something to edit.'))
    } else {
      const interactive = !inputs || inputs.interactive === true

      const existing: Software = await Edit.getExistingSoftware({
        name: inputs?.existing,
        prompt: EditPrompts.getExisting,
        softwares,
        interactive,
      })

      if (inputs) {
        if (
          !isStatic(existing.executable) &&
          inputs.executable &&
          isStatic(inputs.executable) &&
          (!inputs.type || inputs.type === CommandType.Dynamic)
        ) {
          throw Error(
            `The "--${EditOptions.Command.key}" option is not compatible with a "${CommandType.Dynamic}" executable`
          )
        }
        if (
          isStatic(existing.executable) &&
          inputs.executable &&
          !isStatic(inputs.executable) &&
          (!inputs.type || inputs.type === CommandType.Static)
        ) {
          throw Error(
            `The "--${EditOptions.Regex.key}" option is not compatible with a "${CommandType.Static}" executable`
          )
        }

        if (!isStatic(existing.executable) && inputs.type === CommandType.Static) {
          let command
          if (inputs.executable && isStatic(inputs.executable)) {
            command = inputs.executable.command
          }
          if (!command) {
            throw Error(
              `The "${CommandType.Static}" executable type requires a "--${EditOptions.Command.key}" option to be specified.`
            )
          }
        }
        if (isStatic(existing.executable) && inputs.type === CommandType.Dynamic) {
          let regex
          if (inputs.executable && !isStatic(inputs.executable)) {
            regex = inputs.executable.regex
          }
          if (!regex) {
            throw Error(
              `The "${CommandType.Dynamic}" executable type requires a "--${EditOptions.Regex.key}" option to be specified.`
            )
          }
        }
      }

      await Add.configure({
        inputs,
        existingSoftware: existing,
      })
    }
  }
}

export interface Inputs extends AddInputs {
  existing?: string
  type?: CommandType
}
