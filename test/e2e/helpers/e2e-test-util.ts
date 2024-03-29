import { CommandType, isStatic } from '../../../src/software/executable'
import E2eAddUtil, { InstalledReconfiguration, LatestReconfiguration } from './e2e-add-util'
import E2eBaseUtil, { TableRow } from './e2e-base-util'
import E2eDeleteUtil from './e2e-delete-util'
import E2eEditUtil from './e2e-edit-util'
import E2eHomeUtil, { HomeChoiceOption } from './e2e-home-util'
import E2eVersionUtil from './e2e-version-util'
import E2eViewUtil from './e2e-view-util'
import interactiveExecute, { KEYS } from './interactive-execute'
import Software from '../../../src/software/software'

export default class E2eTestUtil {
  static async silentError({ args, error }: { args: string[]; error: string }): Promise<void> {
    const response = await interactiveExecute({
      args,
    })
    expect(response.chunks.join('\n')).toContain(error)
  }

  static async addInteractive({
    software,
    installedVersion,
    latestVersion,
    executableDirectory,
    executableFile,
  }: {
    software: Software
    installedVersion: string
    latestVersion: string
    executableDirectory?: string
    executableFile?: string
  }): Promise<void> {
    const response = await interactiveExecute({
      inputs: [
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Add),
        ...E2eAddUtil.getInputs({
          software,
        }),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit),
      ],
      directory: executableDirectory,
      file: executableFile,
    })
    await E2eAddUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Add),
      ...E2eAddUtil.getChunks({
        software,
        installedVersion,
        latestVersion,
        executableDirectory,
        executableFile,
      }),
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
    ])
  }

  static async addInteractiveReconfigure({
    installed,
    latest = [],
  }: {
    installed: InstalledReconfiguration[]
    latest?: LatestReconfiguration[]
  }): Promise<void> {
    const response = await interactiveExecute({
      inputs: [
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Add),
        ...E2eAddUtil.getInputsReconfigure({
          installed,
          latest,
        }),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit),
      ],
    })
    await E2eAddUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Add),
      ...E2eAddUtil.getChunksReconfigure({
        installed,
        latest,
      }),
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
    ])
  }

  static async addInteractiveDuplicate({ name }: { name: string }): Promise<void> {
    const response = await interactiveExecute({
      inputs: [...E2eHomeUtil.getInputs(HomeChoiceOption.Add), name, KEYS.Enter],
    })
    await E2eAddUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Add),
      {
        question: `${E2eBaseUtil.MESSAGES.Name} ${E2eBaseUtil.MESSAGES.NameExample}`,
        answer: name,
      },
      E2eAddUtil.getNameInUseMessage(name),
      `? ${E2eBaseUtil.MESSAGES.Name} ${E2eBaseUtil.MESSAGES.NameExample}:`,
    ])
  }

  static async addSilent({
    software,
    installedVersion,
    latestVersion,
    executableDirectory,
    executableFile,
  }: {
    software: Software
    installedVersion: string
    latestVersion: string
    executableDirectory?: string
    executableFile?: string
  }): Promise<void> {
    const response = await interactiveExecute({
      args: E2eAddUtil.getSilentCommand({ software }),
      directory: executableDirectory,
      file: executableFile,
    })
    await E2eAddUtil.validateChunks(response.chunks, [
      ...E2eAddUtil.getChunksSilent({
        installedVersion,
        latestVersion,
      }),
    ])
  }

  static async viewInteractive({ rows }: { rows: TableRow[] }): Promise<void> {
    const response = await interactiveExecute({
      inputs: [...E2eHomeUtil.getInputs(HomeChoiceOption.View), ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit)],
    })
    await E2eViewUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.View),
      ...E2eViewUtil.getChunks({
        rows,
      }),
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
    ])
  }

  static async viewInteractiveNoSoftwares(): Promise<void> {
    const response = await interactiveExecute({
      inputs: [...E2eHomeUtil.getInputs(HomeChoiceOption.View), ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit)],
    })
    await E2eViewUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.View),
      E2eBaseUtil.MESSAGES.NoSoftwaresToView,
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
    ])
  }

  static async viewSilent({ rows }: { rows: TableRow[] }): Promise<void> {
    const response = await interactiveExecute({
      args: E2eViewUtil.getSilentCommand(),
    })
    await E2eViewUtil.validateChunks(response.chunks, [
      ...E2eViewUtil.getChunks({
        rows,
      }),
    ])
  }

  static async viewSilentNoSoftwares(): Promise<void> {
    const response = await interactiveExecute({
      args: E2eViewUtil.getSilentCommand(),
    })
    await E2eViewUtil.validateChunks(response.chunks, [E2eBaseUtil.MESSAGES.NoSoftwaresToView])
  }

  static async editInteractive({
    existingSoftwares,
    positionToEdit,
    newSoftware,
    newInstalledVersion,
    newLatestVersion,
  }: {
    existingSoftwares: Software[]
    positionToEdit: number
    newSoftware: Software
    newInstalledVersion: string
    newLatestVersion: string
  }): Promise<void> {
    const response = await interactiveExecute({
      inputs: [
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Edit),
        ...E2eEditUtil.getInputs({
          position: positionToEdit,
          newSoftware,
          oldSoftware: existingSoftwares[positionToEdit],
        }),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit),
      ],
    })
    await E2eEditUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Edit),
      ...E2eEditUtil.getChunks({
        existingSoftwares,
        oldSoftware: existingSoftwares[positionToEdit],
        newSoftware,
        installedVersion: newInstalledVersion,
        latestVersion: newLatestVersion,
      }),
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
    ])
  }

  static async editInteractiveReconfigure({
    existingSoftwares,
    positionToEdit,
    installed,
    latest = [],
  }: {
    existingSoftwares: Software[]
    positionToEdit: number
    installed: InstalledReconfiguration[]
    latest?: LatestReconfiguration[]
  }): Promise<void> {
    const response = await interactiveExecute({
      inputs: [
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Edit),
        ...E2eEditUtil.getInputsReconfigure({
          position: positionToEdit,
          installed,
          latest,
          oldSoftware: existingSoftwares[positionToEdit],
        }),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit),
      ],
    })
    await E2eEditUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Edit),
      ...E2eEditUtil.getChunksReconfigure({
        existingSoftwares,
        oldSoftware: existingSoftwares[positionToEdit],
        installed,
        latest,
      }),
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
    ])
  }

  static async editInteractiveDuplicate({
    existingSoftwares,
    positionToEdit,
    name,
  }: {
    existingSoftwares: Software[]
    positionToEdit: number
    name: string
  }): Promise<void> {
    const existingName = existingSoftwares[positionToEdit].name
    const response = await interactiveExecute({
      inputs: [
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Edit),
        ...E2eEditUtil.getInputsNavigate(positionToEdit),
        name,
        KEYS.Enter,
      ],
    })
    await E2eEditUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Edit),
      ...E2eEditUtil.getChunksNavigate({
        existingSoftwares,
        nameToEdit: existingName,
      }),
      {
        question: `${E2eBaseUtil.MESSAGES.Name} ${E2eBaseUtil.MESSAGES.NameExample}`,
        answer: name,
        default: existingName,
      },
      E2eEditUtil.getNameInUseMessage(name),
      `? ${E2eBaseUtil.MESSAGES.Name} ${E2eBaseUtil.MESSAGES.NameExample}: (${existingName})`,
    ])
  }

  static async editInteractiveNoSoftwares(): Promise<void> {
    const response = await interactiveExecute({
      inputs: [...E2eHomeUtil.getInputs(HomeChoiceOption.Edit), ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit)],
    })
    await E2eEditUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Edit),
      E2eBaseUtil.MESSAGES.NoSoftwaresToEdit,
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
    ])
  }

  static async editSilent({
    existingName,
    newSoftware,
    newInstalledVersion,
    newLatestVersion,
  }: {
    existingName: string
    newSoftware: Software
    newInstalledVersion: string
    newLatestVersion: string
  }): Promise<void> {
    const response = await interactiveExecute({
      args: E2eEditUtil.getSilentCommand({
        existingName,
        newSoftware: {
          name: newSoftware.name,
          shell: newSoftware.shell,
          directory: newSoftware.directory,
          type: CommandType.Static,
          command: isStatic(newSoftware.executable) ? newSoftware.executable.command : '',
          args: newSoftware.args,
          installedRegex: newSoftware.installedRegex,
          url: newSoftware.url,
          latestRegex: newSoftware.latestRegex,
        },
      }),
    })
    await E2eEditUtil.validateChunks(response.chunks, [
      ...E2eEditUtil.getChunksSilent({
        installedVersion: newInstalledVersion,
        latestVersion: newLatestVersion,
      }),
    ])
  }

  static async deleteInteractive({
    existingSoftwares,
    positionToDelete,
    confirm = true,
  }: {
    existingSoftwares: Software[]
    positionToDelete: number
    confirm?: boolean
  }): Promise<void> {
    const response = await interactiveExecute({
      inputs: [
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Delete),
        ...E2eDeleteUtil.getInputs({
          position: positionToDelete,
          confirm,
        }),
        ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit),
      ],
    })
    await E2eDeleteUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Delete),
      ...E2eDeleteUtil.getChunks({
        existingSoftwares,
        softwareToDelete: existingSoftwares[positionToDelete],
        confirm,
      }),
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
    ])
  }

  static async deleteInteractiveNoSoftwares(): Promise<void> {
    const response = await interactiveExecute({
      inputs: [...E2eHomeUtil.getInputs(HomeChoiceOption.Delete), ...E2eHomeUtil.getInputs(HomeChoiceOption.Exit)],
    })
    await E2eDeleteUtil.validateChunks(response.chunks, [
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Delete),
      E2eBaseUtil.MESSAGES.NoSoftwaresToDelete,
      ...E2eHomeUtil.getChunks(HomeChoiceOption.Exit),
    ])
  }

  static async deleteSilent({ existingName }: { existingName: string }): Promise<void> {
    const response = await interactiveExecute({
      args: E2eDeleteUtil.getSilentCommand({
        existingName,
      }),
    })
    await E2eDeleteUtil.validateChunks(response.chunks, [...E2eDeleteUtil.getChunksSilent()])
  }

  static async helpSilent({ args, expected }: { args?: string[]; expected: string[] }): Promise<void> {
    const response = await interactiveExecute({
      args,
    })
    await E2eBaseUtil.validateChunks(E2eBaseUtil.splitChunksOnNewline(response.chunks), expected)
  }

  static async versionSilent({ args }: { args?: string[] }): Promise<void> {
    await E2eVersionUtil.validateChunks(
      (
        await interactiveExecute({
          args,
        })
      ).chunks,
      await E2eVersionUtil.getChunks()
    )
  }
}
