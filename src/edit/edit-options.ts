import { AddOptions, DynamicOptions, StaticOptions } from '../add/add-options'
import { Command, Option } from '../base/base-options'
import { CommandType } from '../executable'

export const EditCommands = {
  Edit: new Command({
    key: 'edit',
    value: {
      alias: ['update', 'reconfigure'],
      description: 'Edit software configuration',
    },
  }),
  Existing: new Command({
    key: 'existing',
    value: {
      description: 'Name of existing software configuration to edit',
      type: 'string',
      demandOption: true,
    },
  }),
}

export const EditOptions = {
  Name: new Option({
    key: AddOptions.Name.key,
    value: {
      ...AddOptions.Name.value,
      demandOption: false,
    },
  }),
  Type: new Option({
    key: 'type',
    value: {
      alias: ['t'],
      description: 'Whether executable to get installed version is fixed or dynamic',
      type: 'string',
      choices: [CommandType.Static, CommandType.Dynamic],
      demandOption: false,
      requiresArg: true,
    },
  }),
  Command: new Option({
    key: StaticOptions.Command.key,
    value: {
      ...StaticOptions.Command.value,
      demandOption: false,
      conflicts: [DynamicOptions.Directory.key, DynamicOptions.Regex.key],
    },
  }),
  Directory: new Option({
    key: DynamicOptions.Directory.key,
    value: {
      ...DynamicOptions.Directory.value,
      demandOption: false,
      conflicts: [StaticOptions.Command.key],
    },
  }),
  Regex: new Option({
    key: DynamicOptions.Regex.key,
    value: {
      ...DynamicOptions.Regex.value,
      demandOption: false,
      conflicts: [StaticOptions.Command.key],
    },
  }),
  Arguments: new Option({
    key: AddOptions.Arguments.key,
    value: {
      ...AddOptions.Arguments.value,
      demandOption: false,
    },
  }),
  Shell: new Option({
    key: AddOptions.Shell.key,
    value: {
      ...AddOptions.Shell.value,
      demandOption: false,
    },
  }),
  InstalledRegex: new Option({
    key: AddOptions.InstalledRegex.key,
    value: {
      ...AddOptions.InstalledRegex.value,
      demandOption: false,
    },
  }),
  Url: new Option({
    key: AddOptions.Url.key,
    value: {
      ...AddOptions.Url.value,
      demandOption: false,
    },
  }),
  LatestRegex: new Option({
    key: AddOptions.LatestRegex.key,
    value: {
      ...AddOptions.LatestRegex.value,
      demandOption: false,
    },
  }),
}
