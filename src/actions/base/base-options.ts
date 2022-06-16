import { Options, PositionalOptions } from 'yargs'

export enum GROUP {
  Globals = 'Globals:',
}

export class Option {
  readonly key: string
  readonly value: Options

  constructor({ key, value }: { key: string; value: Options }) {
    this.key = key
    this.value = value
  }
}

export class Command {
  readonly key: string
  readonly value: PositionalOptions

  constructor({ key, value }: { key: string; value: PositionalOptions }) {
    this.key = key
    this.value = value
  }
}

export const BaseOptions = {
  Help: new Option({
    key: 'help',
    value: {
      alias: ['h'],
      description: 'Show help',
      type: 'boolean',
      default: false,
      demandOption: false,
      requiresArg: false,
      group: GROUP.Globals,
    },
  }),
  Interactive: new Option({
    key: 'prompt',
    value: {
      alias: ['p', 'interactive'],
      description: 'Whether or not terminal should wait for user input if needed, or exit/error as necessary',
      type: 'boolean',
      default: false,
      demandOption: false,
      requiresArg: false,
      group: GROUP.Globals,
    },
  }),
}

interface OptionSet {
  [key: string]: Option
}

export interface GenericOptions {
  [key: string]: Options
}

export function addNewlineForExample(description?: string): string {
  return description ? description.replace(' (eg', '\n(eg') : ''
}

export function convertToGenericOptions(options: OptionSet): GenericOptions {
  const convertedOpts: GenericOptions = {}
  for (const key of Object.keys(options)) {
    convertedOpts[options[key].key] = options[key].value
    convertedOpts[options[key].key].description = addNewlineForExample(convertedOpts[options[key].key].description)
  }
  return convertedOpts
}
