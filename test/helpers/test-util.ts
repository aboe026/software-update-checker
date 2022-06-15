import inquirer from 'inquirer'
import os from 'os'

import colors from '../../src/util/colors'

export default class TestUtil {
  static readonly NEWLINE_CHARS: string = '\\\\n'
  static readonly TABLE_CHAR = {
    TopLeftBorder: '┌',
    TopCenterBorder: '─',
    TopSeparator: '┬',
    TopRightBorder: '┐',
    HeaderLeftBorder: '├',
    HeaderCenterBorder: '─',
    HeaderSeparator: '┼',
    HeaderRightBorder: '┤',
    MiddleSeparator: '│', // note: this is not a pipe "|" character, but something that looks extremely like it but longer
    BottomLeftBorder: '└',
    BottomCenterBorder: '─',
    BottomSeparator: '┴',
    BottomRightBorder: '┘',
  }
  static readonly DIRECTORY_SEPARATOR = os.platform() === 'win32' ? '\\' : '/'

  static getFilePath(parts: string[]): string {
    let filePath = os.platform() === 'win32' ? 'C:' : ''
    for (const part of parts) {
      filePath += `${TestUtil.DIRECTORY_SEPARATOR}${part}`
    }
    return filePath
  }

  static validateTablePrintout(output: string, printouts: SoftwarePrintout[]): void {
    const lines = output.split(/\\\\r\\\\n?|\\\\n|\\r\\n?|\\n|\r\n?|\n/)
    const header = lines[1]
    const headerCols = header.split(TestUtil.TABLE_CHAR.MiddleSeparator)
    expect(headerCols[1]).toMatch(/.*Name.*/)
    expect(headerCols[2]).toMatch(/.*Installed.*/)
    expect(headerCols[3]).toMatch(/.*Latest.*/)
    expect(lines.length - 3).toBe(printouts.length * 2) // do not count headers, softwares have 2 lines, one for info and one as a row separator
    for (let i = 0; i < printouts.length; i++) {
      const line = lines[i * 2 + 3] // skip headers and row separators
      const printout = printouts[i]
      const cols = line.split(TestUtil.TABLE_CHAR.MiddleSeparator)
      expect(cols[1]).toMatch(getColorRegExp(printout.name, printout.color))
      expect(cols[2]).toMatch(getColorRegExp(printout.installedVersion, printout.color))
      expect(cols[3]).toMatch(getColorRegExp(printout.latestVersion, printout.color))
    }
  }

  static mockResponses({
    spy,
    responses,
  }: {
    spy: jest.SpyInstance
    responses: Response[] | undefined
  }): jest.SpyInstance {
    if (responses) {
      for (const response of responses) {
        if ('reject' in response) {
          spy.mockRejectedValueOnce(response.reject)
        } else if ('resolve' in response) {
          spy.mockResolvedValueOnce(response.resolve)
        } else if ('throw' in response) {
          spy.mockImplementationOnce(() => {
            throw new Error(response.throw)
          })
        } else if ('value' in response) {
          spy.mockReturnValueOnce(response.value)
        }
      }
    }
    return spy
  }

  static validateMockCallParameter({
    spy,
    parameter = 'default',
    expected,
  }: {
    spy: jest.SpyInstance
    parameter?: string
    expected: string | boolean | undefined
  }): void {
    expect(spy.mock.calls).toHaveLength(1)
    expect(spy.mock.calls[0]).toHaveLength(1)
    if (expected === undefined && !Object.keys(spy.mock.calls[0][0]).includes(parameter)) {
      expect(spy.mock.calls[0][0]).not.toHaveProperty(parameter)
    } else {
      expect(spy.mock.calls[0][0]).toHaveProperty(parameter, expected)
    }
  }

  static validateGetExistingSoftwareCalls({
    getExistingSoftwareSpy,
    getExistingSoftwareCalls,
  }: {
    getExistingSoftwareSpy: jest.SpyInstance
    getExistingSoftwareCalls?: ExpectedCalls[][]
  }): void {
    if (!getExistingSoftwareCalls) {
      expect(getExistingSoftwareSpy.mock.calls).toEqual([])
    } else {
      expect(getExistingSoftwareSpy.mock.calls).toHaveLength(getExistingSoftwareCalls.length)
      for (let i = 0; i < getExistingSoftwareCalls.length; i++) {
        const getExistingSoftwareCall = getExistingSoftwareCalls[i]
        expect(getExistingSoftwareSpy.mock.calls[i]).toHaveLength(1) // 1 input param
        expect(getExistingSoftwareSpy.mock.calls[i][0]).toHaveProperty('name', (getExistingSoftwareCall[0] as any).name)
        expect(getExistingSoftwareSpy.mock.calls[i][0]).toHaveProperty(
          'softwares',
          (getExistingSoftwareCall[0] as any).softwares
        )
        expect(getExistingSoftwareSpy.mock.calls[i][0]).toHaveProperty(
          'interactive',
          (getExistingSoftwareCall[0] as any).interactive
        )
        expect(getExistingSoftwareSpy.mock.calls[i][0]).toHaveProperty('prompt', expect.any(Function))
      }
    }
  }

  static async validateStringPrompt({
    property,
    method,
    input,
    expected,
    expectedDefault,
    expectedMessage,
  }: {
    property: string
    method: (existing?: any) => Promise<string>
    input?: string
    expected: string
    expectedDefault?: string
    expectedMessage?: string
  }): Promise<void> {
    const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({
      [property]: expected,
    })
    await expect(method(input)).resolves.toBe(expected)
    TestUtil.validateMockCallParameter({
      spy: promptSpy,
      expected: expectedDefault,
    })
    if (expectedMessage) {
      TestUtil.validateMockCallParameter({
        spy: promptSpy,
        expected: expectedMessage,
        parameter: 'message',
      })
    }
  }

  static async validateBooleanPrompt({
    property,
    method,
    input,
    expected,
    expectedDefault,
  }: {
    property: string
    method: (existing?: boolean) => Promise<boolean>
    input?: boolean
    expected: boolean
    expectedDefault?: boolean
  }): Promise<void> {
    const promptSpy = jest.spyOn(inquirer, 'prompt').mockResolvedValue({
      [property]: expected,
    })
    await expect(method(input)).resolves.toBe(expected)
    TestUtil.validateMockCallParameter({
      spy: promptSpy,
      expected: expectedDefault,
    })
  }

  static getNestedProperty({ property, obj }: { property: string | undefined; obj: any }): string | undefined {
    if (!property) {
      return undefined
    }
    const nestedProps = property.split('.')
    let value = obj[nestedProps[0]]
    for (let i = 1; i < nestedProps.length && value; i++) {
      value = value[nestedProps[i]]
    }
    return value
  }
}

function getColorRegExp(string: string, color: colors.Color): RegExp {
  return new RegExp(
    `.*(${JSON.stringify(color(string))
      .replace(/\"/g, '')
      .replace(/\\/g, '\\\\')
      .replace(/\[/g, '\\[')
      .replace(/\./g, '\\.')
      .replace(/\?/g, '\\?')}).*`
  )
}

interface SoftwarePrintout {
  name: string
  installedVersion: string
  latestVersion: string
  color: colors.Color
}

export interface Response {
  value?: string | object | boolean // eslint-disable-line @typescript-eslint/ban-types
  throw?: string
  resolve?: string | object | boolean // eslint-disable-line @typescript-eslint/ban-types
  reject?: string | Error
}

export type ExpectedCalls = string | object | undefined // eslint-disable-line @typescript-eslint/ban-types
