import fs from 'fs-extra'
import os from 'os'
import path from 'path'

import { ANSI_CHAR_REPLACEMENT, KEYS } from './interactive-execute'
import Software from '../../../src/software'
import testUtil from '../../helpers/test-util'

export default class E2eBaseUtil {
  static readonly SOFTWARES_FILE_NAME = 'softwares.json'
  static readonly DIRECTORY = {
    UserConfig: path.join(os.homedir(), '.suc'),
    TempBackupConfig: path.join(__dirname, '../.temp-work-dir', '.suc-temp'),
  }
  static readonly COMMAND = {
    Good: path.join(__dirname, '../../helpers/test-commands/good-command.js'),
    Bad: path.join(__dirname, '../../helpers/test-commands/bad-command.js'),
  }

  static getNameInUseMessage(name: string): string {
    return `Invalid name '${name}', already in use.`
  }

  static getNavigateToPositionInputs(position: number): string[] {
    const inputs: string[] = []
    for (let i = 0; i < position; i++) {
      inputs.push(KEYS.Down)
    }
    inputs.push(KEYS.Enter)
    return inputs
  }

  static async setSoftwares(softwares: Software[] | undefined): Promise<void> {
    const softwaresFile = path.join(this.DIRECTORY.UserConfig, this.SOFTWARES_FILE_NAME)
    if (softwares !== undefined) {
      await fs.writeFile(softwaresFile, JSON.stringify(softwares, null, 2))
    } else {
      await fs.createFile(softwaresFile)
    }
  }

  static async verifySoftwares(softwares: Software[] | undefined, fileExists = true): Promise<void> {
    const softwaresFile = path.join(this.DIRECTORY.UserConfig, this.SOFTWARES_FILE_NAME)
    if (!fileExists) {
      await expect(fs.access(softwaresFile)).rejects.toThrow('no such file or directory')
    } else {
      await expect(fs.access(softwaresFile)).resolves.toBe(undefined)
      const contents = (await fs.readFile(softwaresFile)).toString()
      if (softwares === undefined) {
        expect(contents).toBe('')
      } else {
        let json
        try {
          json = JSON.parse(contents)
        } catch (err) {
          expect(err).toBe(undefined)
        }
        expect(json).toStrictEqual(JSON.parse(JSON.stringify(softwares)))
      }
    }
  }

  static validatePromptChunks(
    actualChunks: string[],
    expectedChunks: (string | StringPrompt | BooleanPrompt | ChoicePrompt | TableOutput)[]
  ): void {
    let actualIndex = 0
    for (let i = 0; i < expectedChunks.length; i++) {
      const expected = expectedChunks[i]
      let actual = actualChunks[actualIndex]
      console.log('TEST expected: ' + JSON.stringify(expected, null, 2))
      console.log('TEST actual: ' + actual)
      if (typeof expected === 'string') {
        expect(actual).toBe(expected)
        actualIndex++
      } else {
        if (isChoice(expected)) {
          const start = expected.default ? Object.values(expected.choice.options).indexOf(expected.default) : 0
          for (let j = start; j <= Object.values(expected.choice.options).indexOf(expected.answer || ''); j++) {
            expect(condenseBackslashes(actual)).toBe(
              this.getChoiceChunk(expected.choice, j, j === start, expected.default)
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
          expect(actual).toBe(`${question} (Y/n) `)
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
          const question = `? ${expected.question}: `
          expect(condenseBackslashes(stripNewlines(actual))).toBe(
            `${question}${expected.default ? `(${expected.default}) ` : ''}`
          )
          while (
            condenseBackslashes(stripNewlines(actualChunks[actualIndex])).startsWith(question) &&
            actualIndex < actualChunks.length
          ) {
            actualIndex++
          }
          actual = condenseBackslashes(stripNewlines(actualChunks[actualIndex - 1]))
          expect(actual).toBe(`${question}${expected.answer}`)
        }
      }
    }
    expect(actualChunks).toHaveLength(actualIndex)
  }

  static getChoiceChunk(choice: InputChoice, index: number, first?: boolean, defaultSelection?: string): string {
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
    return chunk
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
  answer: string
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
  return words.replace(/\\?\\n/g, '')
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
