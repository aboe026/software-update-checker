import Add, { Inputs as AddInputs } from '../add/add'
import Base from '../base/base'
import colors from '../colors'
import { CommandType, isStatic } from '../executable'
import { EditOptions } from './edit-options'
import EditPrompts from './edit-prompts'
import Home from '../home/home'
import Software from '../software'
import SoftwareList from '../software-list'

export default class Edit extends Base {
  static async editConfiguration({ inputs }: { inputs?: Inputs }): Promise<void> {
    const softwares = await SoftwareList.load()
    if (softwares.length === 0 && (!inputs || inputs.interactive)) {
      console.warn(colors.yellow('No softwares to edit. Please add a software to have something to edit.'))
      if (inputs?.interactive) {
        await Home.mainMenu()
      }
    } else {
      const existing: Software = await Edit.getExisting({
        name: inputs?.existing || (await EditPrompts.getExisting(softwares)),
        softwares,
        interactive: !inputs || inputs?.interactive === true,
      })

      if (
        !isStatic(existing.executable) &&
        inputs?.executable &&
        isStatic(inputs.executable) &&
        (!inputs.type || inputs?.type === CommandType.Dynamic)
      ) {
        throw Error(
          `The "--${EditOptions.Command.key}" option is not compatible with a "${CommandType.Dynamic}" executable`
        )
      }
      if (
        isStatic(existing.executable) &&
        inputs?.executable &&
        !isStatic(inputs.executable) &&
        (!inputs.type || inputs.type === CommandType.Static)
      ) {
        if (inputs.executable.directory) {
          throw Error(
            `The "--${EditOptions.Directory.key}" option is not compatible with a "${CommandType.Static}" executable`
          )
        } else if (inputs.executable.regex) {
          throw Error(
            `The "--${EditOptions.Regex.key}" option is not compatible with a "${CommandType.Static}" executable`
          )
        }
      }

      if (!isStatic(existing.executable) && inputs?.type === CommandType.Static) {
        let command
        if (inputs && inputs.executable && isStatic(inputs.executable)) {
          command = inputs.executable.command
        }
        if (!command) {
          throw Error(
            `The "${CommandType.Static}" executable type requires a "--${EditOptions.Command.key}" option to be specified.`
          )
        }
      }
      if (isStatic(existing.executable) && inputs?.type === CommandType.Dynamic) {
        let directory
        if (inputs && inputs.executable && !isStatic(inputs.executable)) {
          directory = inputs.executable.directory
        }
        if (!directory) {
          throw Error(
            `The "${CommandType.Dynamic}" executable type requires a "--${EditOptions.Directory.key}" option to be specified.`
          )
        }

        let regex
        if (inputs && inputs.executable && !isStatic(inputs.executable)) {
          regex = inputs.executable.regex
        }
        if (!regex) {
          throw Error(
            `The "${CommandType.Dynamic}" executable type requires a "--${EditOptions.Regex.key}" option to be specified.`
          )
        }
      }

      await Add.configure({
        inputs,
        existingSoftware: existing,
      })
    }
  }
}

interface Inputs extends AddInputs {
  existing?: string
  type?: CommandType
}
