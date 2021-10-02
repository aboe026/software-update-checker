import E2eBaseUtil, { TableOutput, TableRow } from './e2e-base-util'

export default class E2eViewUtil extends E2eBaseUtil {
  static getSilentCommand(): string[] {
    return ['view']
  }

  static getChunks({ rows }: { rows: TableRow[] }): TableOutput[] {
    return [
      {
        rows,
      },
    ]
  }
}
