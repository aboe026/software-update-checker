import colors from '../../src/colors'

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

  static validateTablePrintout(output: string, printouts: SoftwarePrintout[]): void {
    console.log('TEST output: ' + JSON.stringify(output))
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
