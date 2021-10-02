import fs from 'fs-extra'
import path from 'path'

import E2eConfig from './e2e-config'
import interactiveExecute, { ANSI_CHAR_REPLACEMENT, getExecutableName, KEYS } from './interactive-execute'
import SelfReference from '../../../src/util/self-reference'
import Software from '../../../src/software/software'
import testUtil from '../../helpers/test-util'
import allUpgrades from '../../../src/software/upgrades/all-upgrades'

export default class E2eBaseUtil {
  static readonly COMMAND = {
    Good: path.join(__dirname, '../../helpers/test-commands/good-command.js'),
    Bad: path.join(__dirname, '../../helpers/test-commands/bad-command.js'),
  }

  static readonly MESSAGES = {
    ShowVersion: 'Show version number',
    ShowHelp: 'Show help',
    CheckUpdates: 'Check if installed software has updates available',
    Add: 'Add software configuration',
    View: 'View configured software versions',
    Edit: 'Edit software configuration',
    Delete: 'Remove software configuration',
    CommandTypes: [
      'Command types:',
      'Static - Software executable defined by a fixed, non-changing path (eg executable on $PATH or absolute path to executable file).',
      'Dynamic - Software executable has changing, evolving name requiring regex patterns to determine (eg executable name includes version, which changes between releases).',
    ],
    Static: 'Software executable defined by a fixed, non-changing path',
    StaticExample: '(eg executable on $PATH or absolute path to executable file)',
    Dynamic: 'Software executable has changing, evolving name requiring regex patterns to determine',
    DynamicExample: '(eg executable name includes version, which changes between releases)',
    Name: 'Name to identify software configuration',
    NameExample: '(eg "Software Update Checker")',
    Command: 'Command or path to executable',
    Directory: 'Path to directory containing executable file',
    Arguments: 'Arguments to apply to executable to produce version',
    ArgumentsExample: '(eg "--version")',
    InstalledRegex: 'Regex pattern applied to executable command output for singling out installed version',
    InstalledRegexExample: '(eg "(.*)\\+")',
    LatestRegex: 'Regex pattern applied to URL contents for singling out latest version',
    LatestRegexExample: '(eg "releases\\/tag\\/v(.*?)&quot;")',
    Regex: 'Regex pattern applied to files in directory for singling out executable file to use',
    Shell: 'Shell to use instead of system default shell',
    ShellExample: '(eg "pwsh")',
    Url: 'URL to call for latest version',
    UrlExample: '(eg "https://github.com/aboe026/software-update-checker-cli/releases/latest")',
    NoSoftwaresToDelete: 'No softwares to delete. Please add a software to have something to delete.',
    NoSoftwaresToEdit: 'No softwares to edit. Please add a software to have something to edit.',
    NoSoftwaresToView: 'No softwares to view. Please add a software to have something to view.',
    NoOptionsProvided: 'Must provide something to change as an option/flag',
    NoCommandForStatic: 'The "static" executable type requires a "--command" option to be specified',
    NoDirectoryForDynamic: 'The "dynamic" executable type requires a "--directory" option to be specified',
    NoRegexForDynamic: 'The "dynamic" executable type requires a "--regex" option to be specified',
    IncompatibleDirectoryWithStaticType: 'The "--directory" option is not compatible with "--type=static"',
    IncompatibleRegexWithStaticType: 'The "--regex" option is not compatible with "--type=static"',
    IncompatibleCommandWithDynamicType: 'The "--command" option is not compatible with "--type=dynamic"',
    IncompatibleCommandWithDirectory: 'Arguments command and directory are mutually exclusive',
    IncompatibleCommandWithRegex: 'Arguments command and regex are mutually exclusive',
    IncompatibleDirectoryWithStaticExecutable: 'The "--directory" option is not compatible with a "static" executable',
    IncompatibleRegexWithStaticExecutable: 'The "--regex" option is not compatible with a "static" executable',
    IncompatibleCommandWithDynamicExecutable: 'The "--command" option is not compatible with a "dynamic" executable',
  }

  static getExampleFromMessage(message: string): string {
    const example = message?.match(/"(.*?)"/g)?.pop() || ''
    return example.substring(1, example.length - 1) // remove surrounding double quotes
  }

  static getDirectoryExampleMessage({ directory }: { directory?: string }): string {
    return `(eg "${directory || E2eConfig.DIRECTORY.Executables}")`
  }

  static getCommandExampleMessage({
    executableName,
    directory,
  }: {
    executableName?: string
    directory?: string
  }): string {
    const name = executableName || getExecutableName()
    return `(eg "${name}" or "${path.join(directory || E2eConfig.DIRECTORY.Executables, name)}")`
  }

  static getRegexExampleMessage({ executableName }: { executableName?: string }): string {
    const name = executableName || getExecutableName()
    return `(eg "${SelfReference.getNameRegex(name)}")`
  }

  static getNameInUseMessage(name: string): string {
    return `Invalid name "${name}", already in use.`
  }

  static getNotEnoughCommandsMessage(got: number, min: number): string {
    return `Not enough non-option arguments: got ${got}, need at least ${min}`
  }

  static getInputsPrompt({
    currentValue,
    defaultValue,
    fallbackValue = '',
  }: {
    currentValue: string | undefined
    defaultValue?: string
    fallbackValue?: string
  }): string[] {
    const inputs = []
    if (!defaultValue || currentValue !== defaultValue) {
      inputs.push(currentValue || fallbackValue)
    }
    inputs.push(KEYS.Enter)
    return inputs
  }

  static getInputsNavigate(position: number): string[] {
    const inputs: string[] = []
    for (let i = 0; i < position; i++) {
      inputs.push(KEYS.Down)
    }
    inputs.push(KEYS.Enter)
    return inputs
  }

  static async setOldSoftwares(softwares: any[], version?: number | boolean): Promise<void> {
    await fs.ensureDir(E2eConfig.DIRECTORY.UserConfig)
    const contents: any = {
      softwares,
    }
    if (version !== false) {
      contents.version = version === undefined ? allUpgrades().length : version
    }
    await fs.writeFile(E2eConfig.FILE.Softwares, JSON.stringify(contents, null, 2))
  }

  static async setSoftwares(softwares: Software[] | undefined): Promise<void> {
    if (softwares !== undefined) {
      await fs.ensureDir(E2eConfig.DIRECTORY.UserConfig)
      await fs.writeFile(
        E2eConfig.FILE.Softwares,
        JSON.stringify(
          {
            version: allUpgrades().length,
            softwares,
          },
          null,
          2
        )
      )
    } else {
      await fs.createFile(E2eConfig.FILE.Softwares)
    }
  }

  static async verifySoftwaresFileDoesNotExist(): Promise<void> {
    await expect(fs.access(E2eConfig.FILE.Softwares)).rejects.toThrow('no such file or directory')
  }

  static async verifyOldSoftwares(softwares: any[], version: number | boolean): Promise<void> {
    await expect(fs.access(E2eConfig.FILE.Softwares)).resolves.toBe(undefined)
    const contents = (await fs.readFile(E2eConfig.FILE.Softwares)).toString()
    let json
    try {
      json = JSON.parse(contents)
    } catch (err) {
      expect(err).toBe(undefined)
    }
    const expectedContents: any = {
      softwares,
    }
    if (version !== false) {
      expectedContents.version = version
    }
    expect(json).toEqual(JSON.parse(JSON.stringify(expectedContents)))
  }

  static async verifySoftwares(softwares: Software[] | undefined): Promise<void> {
    await expect(fs.access(E2eConfig.FILE.Softwares)).resolves.toBe(undefined)
    const contents = (await fs.readFile(E2eConfig.FILE.Softwares)).toString()
    if (softwares === undefined) {
      expect(contents).toBe('')
    } else {
      let json
      try {
        json = JSON.parse(contents)
      } catch (err) {
        expect(err).toBe(undefined)
      }
      expect(json).toStrictEqual(
        JSON.parse(
          JSON.stringify({
            softwares,
            version: allUpgrades().length,
          })
        )
      )
    }
  }

  static async testSilentError({ args, error }: { args: string[]; error: string }): Promise<void> {
    const response = await interactiveExecute({
      args,
    })
    expect(response.chunks.join('\n')).toContain(error)
  }

  static splitChunksOnNewline(chunks: string[]): string[] {
    const splitChunks: string[] = []
    for (const chunk of chunks) {
      chunk.split(/\\+n/).forEach((splitChunk) => splitChunks.push(splitChunk.replace(/\\+/g, '\\')))
    }
    return splitChunks
  }

  static async validateChunks(
    actualChunks: string[],
    expectedChunks: (string | StringPrompt | BooleanPrompt | ChoicePrompt | TableOutput)[]
  ): Promise<void> {
    await E2eConfig.appendToDebugLog(`Expected: ${JSON.stringify(expectedChunks, null, 2)}`)
    let actualIndex = 0
    for (let i = 0; i < expectedChunks.length; i++) {
      const expected = expectedChunks[i]
      let actual = actualChunks[actualIndex]
      if (typeof expected === 'string') {
        expect(stripNewlines(actual)).toBe(expected)
        actualIndex++
      } else {
        if (isChoice(expected)) {
          const start = expected.default ? Object.values(expected.choice.options).indexOf(expected.default) : 0
          for (let j = start; j <= Object.values(expected.choice.options).indexOf(expected.answer || ''); j++) {
            expect(condenseBackslashes(actual)).toBe(
              this.getChoiceChunk({
                choice: expected.choice,
                index: j,
                first: j === start,
                defaultSelection: expected.default,
              })
            )
            actualIndex++
            actual = actualChunks[actualIndex]
          }
          if (expected.answer) {
            expect(condenseBackslashes(stripNewlines(actual))).toBe(`? ${expected.choice.question}: ${expected.answer}`)
          }
          actualIndex++
        } else if (isBoolean(expected)) {
          const question = `? ${expected.question}?`
          expect(actual).toBe(`${question} (Y/n)`)
          while (
            condenseBackslashes(stripNewlines(actualChunks[actualIndex])).startsWith(question) &&
            actualIndex < actualChunks.length
          ) {
            actualIndex++
          }
          actual = actualChunks[actualIndex - 1]
          expect(actual).toBe(`${question} ${expected.answer ? 'Yes' : 'No'}`)
        } else if (isTable(expected)) {
          this.validateTableChunk(expected, condenseBackslashes(actual))
          actualIndex++
        } else {
          const question = `? ${expected.question}:`
          expect(condenseBackslashes(stripNewlines(actual))).toBe(
            `${question}${expected.default !== undefined ? ` (${expected.default})` : ''}`
          )
          while (
            condenseBackslashes(stripNewlines(actualChunks[actualIndex])).startsWith(question) &&
            actualIndex < actualChunks.length
          ) {
            actualIndex++
          }
          actual = condenseBackslashes(stripNewlines(actualChunks[actualIndex - 1]))
          expect(actual).toBe(`${question}${expected.answer ? ` ${expected.answer}` : ''}`)
        }
      }
    }
    expect(actualChunks).toHaveLength(actualIndex)
  }

  static getChoiceChunk({
    choice,
    index,
    first,
    defaultSelection,
  }: {
    choice: InputChoice
    index: number
    first?: boolean
    defaultSelection?: string
  }): string {
    let chunk = `? ${choice.question}:${defaultSelection ? '\\n' : ''} `
    if (first) {
      chunk += '(Use arrow keys)'
    }
    let counter = 0
    for (const key of Object.keys(choice.options)) {
      const option = choice.options[key]
      chunk += `\\n${index === counter ? '>' : ' '} ${option} `
      counter++
    }
    return chunk.trim()
  }

  static validateTableChunk(expected: TableOutput, actual: string): void {
    const actualRows = actual.split('\\n')
    const topRegex = /┌(─+)┬(─+)┬(─+)┐/
    expect(actualRows[0]).toMatch(topRegex)
    const matches = actualRows[0].match(topRegex)
    const nameWidth = matches !== null ? matches[1].length - 2 : 0
    const installedWidth = matches !== null ? matches[2].length - 2 : 0
    const latestWidth = matches !== null ? matches[3].length - 2 : 0

    expect(actualRows[1]).toBe(
      this.generateExpectedRow({
        expected: {
          name: 'Name',
          installed: 'Installed',
          latest: 'Latest',
        },
        leftBorder: testUtil.TABLE_CHAR.MiddleSeparator,
        separator: testUtil.TABLE_CHAR.MiddleSeparator,
        rightBorder: testUtil.TABLE_CHAR.MiddleSeparator,
        filler: ' ',
        padding: ' ',
        installedWidth,
        latestWidth,
        nameWidth,
      })
    )

    for (let i = 0; i < expected.rows.length; i++) {
      expect(actualRows[2 + i * 2]).toBe(
        this.generateExpectedRow({
          expected: {
            name: testUtil.TABLE_CHAR.HeaderCenterBorder,
            installed: testUtil.TABLE_CHAR.HeaderCenterBorder,
            latest: testUtil.TABLE_CHAR.HeaderCenterBorder,
          },
          leftBorder: testUtil.TABLE_CHAR.HeaderLeftBorder,
          separator: testUtil.TABLE_CHAR.HeaderSeparator,
          rightBorder: testUtil.TABLE_CHAR.HeaderRightBorder,
          filler: testUtil.TABLE_CHAR.HeaderCenterBorder,
          padding: testUtil.TABLE_CHAR.HeaderCenterBorder,
          installedWidth,
          latestWidth,
          nameWidth,
        })
      )
      expect(actualRows[3 + i * 2]).toBe(
        this.generateExpectedRow({
          expected: expected.rows[i],
          leftBorder: testUtil.TABLE_CHAR.MiddleSeparator,
          separator: testUtil.TABLE_CHAR.MiddleSeparator,
          rightBorder: testUtil.TABLE_CHAR.MiddleSeparator,
          filler: ' ',
          padding: ' ',
          installedWidth,
          latestWidth,
          nameWidth,
        })
      )
    }

    expect(actualRows[actualRows.length - 1]).toBe(
      this.generateExpectedRow({
        expected: {
          name: testUtil.TABLE_CHAR.BottomCenterBorder,
          installed: testUtil.TABLE_CHAR.BottomCenterBorder,
          latest: testUtil.TABLE_CHAR.BottomCenterBorder,
        },
        leftBorder: testUtil.TABLE_CHAR.BottomLeftBorder,
        separator: testUtil.TABLE_CHAR.BottomSeparator,
        rightBorder: testUtil.TABLE_CHAR.BottomRightBorder,
        filler: testUtil.TABLE_CHAR.BottomCenterBorder,
        padding: testUtil.TABLE_CHAR.BottomCenterBorder,
        installedWidth,
        latestWidth,
        nameWidth,
      })
    )

    expect(actualRows).toHaveLength(3 + expected.rows.length * 2)
  }

  static generateExpectedRow({
    expected,
    leftBorder,
    separator,
    rightBorder,
    filler,
    padding,
    nameWidth,
    installedWidth,
    latestWidth,
  }: {
    expected: TableRow
    leftBorder: string
    separator: string
    rightBorder: string
    filler: string
    padding: string
    nameWidth: number
    installedWidth: number
    latestWidth: number
  }): string {
    let row = `${leftBorder}${padding}${applyDecoration(expected.name, expected.decoration)}`
    for (let i = 0; i < nameWidth - expected.name.length; i++) {
      row += filler
    }
    row += `${padding}${separator}${padding}${applyDecoration(expected.installed, expected.decoration)}`
    for (let i = 0; i < installedWidth - expected.installed.length; i++) {
      row += filler
    }
    row += `${padding}${separator}${padding}${applyDecoration(expected.latest, expected.decoration)}`
    for (let i = 0; i < latestWidth - expected.latest.length; i++) {
      row += filler
    }
    row += `${padding}${rightBorder}`

    return row
  }
}

export interface Option {
  [key: string]: string
}

interface InputChoice {
  question: string
  options: Option
}

export interface StringPrompt {
  question: string
  answer?: string
  default?: string
  validated?: boolean
}

export interface BooleanPrompt {
  question: string
  answer: boolean
}

export interface ChoicePrompt {
  choice: InputChoice
  answer?: string
  default?: string
}

export interface TableOutput {
  rows: TableRow[]
}

export interface TableRow {
  name: string
  installed: string
  latest: string
  decoration?: RowDecoration
}

export enum RowDecoration {
  Update = 'update',
  Error = 'error',
}

function isChoice(prompt: string | StringPrompt | BooleanPrompt | ChoicePrompt | TableOutput): prompt is ChoicePrompt {
  return (prompt as ChoicePrompt).choice !== undefined
}

function isBoolean(
  prompt: string | StringPrompt | BooleanPrompt | ChoicePrompt | TableOutput
): prompt is BooleanPrompt {
  return typeof (prompt as BooleanPrompt).answer === 'boolean'
}

function isTable(output: string | StringPrompt | BooleanPrompt | ChoicePrompt | TableOutput): output is TableOutput {
  return (output as TableOutput).rows !== undefined
}

function stripNewlines(words: string): string {
  return words && words.replace(/\\?\\n/g, '')
}

function condenseBackslashes(words: string): string {
  return words && words.replace(/\\+/g, '\\')
}

function applyDecoration(words: string, decoration?: RowDecoration) {
  let decoratedWords = words
  if (decoration === RowDecoration.Error) {
    decoratedWords = `${ANSI_CHAR_REPLACEMENT.Red}${decoratedWords}`
  } else if (decoration === RowDecoration.Update) {
    decoratedWords = `${ANSI_CHAR_REPLACEMENT.Green}${decoratedWords}`
  }
  return decoratedWords
}
