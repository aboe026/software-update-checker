import { Arguments, Options } from 'yargs'
import os from 'os'

import { CommandType } from '../../software/executable'
import { GenericOptions, Option } from './base-options'

export default class BaseCommand {
  static sortOptions(commands: OptionsSet): GenericOptions {
    return Object.keys(commands)
      .sort()
      .reduce(
        (acc, key) => ({
          ...acc,
          [key]: commands[key],
        }),
        {}
      )
  }

  static getStringArgument(argv: Arguments, option: Option): string | undefined {
    let argument
    if (option.value && option.value.alias) {
      for (const alias of option.value.alias) {
        const potentialArg = argv[alias]
        if (potentialArg !== undefined && typeof potentialArg === 'string') {
          argument = potentialArg
        }
      }
    }
    if (option.key) {
      const potentialArg = argv[option.key]
      if (potentialArg !== undefined && typeof potentialArg === 'string') {
        argument = potentialArg
      }
    }
    return argument
  }

  static getBooleanArgument(argv: Arguments, option: Option): boolean | undefined {
    let argument
    if (option.value && option.value.alias) {
      for (const alias of option.value.alias) {
        const potentialArg = argv[alias]
        if (potentialArg !== undefined && typeof potentialArg === 'boolean') {
          argument = potentialArg
        }
      }
    }
    if (option.key) {
      const potentialArg = argv[option.key]
      if (potentialArg !== undefined && typeof potentialArg === 'boolean') {
        argument = potentialArg
      }
    }
    return argument
  }

  static getCommandTypeArgument(argv: Arguments, option: Option): CommandType | undefined {
    let argument
    if (option.value && option.value.alias) {
      for (const alias of option.value.alias) {
        const potentialArg = argv[alias]
        if (potentialArg !== undefined && typeof potentialArg === 'string') {
          argument = potentialArg
        }
      }
    }
    if (option.key) {
      const potentialArg = argv[option.key]
      if (potentialArg !== undefined && typeof potentialArg === 'string') {
        argument = potentialArg
      }
    }
    if (argument === CommandType.Static) {
      return CommandType.Static
    } else if (argument === CommandType.Dynamic) {
      return CommandType.Dynamic
    }
    return undefined
  }

  static getExecutableName(): string {
    let name = 'software-update-checker-'
    if (os.platform() === 'win32') {
      name += 'win.exe'
    } else if (os.platform() === 'darwin') {
      name += 'macos'
    } else {
      name += 'linux'
    }
    return name
  }
}

export interface OptionsSet {
  [key: string]: Options
}
