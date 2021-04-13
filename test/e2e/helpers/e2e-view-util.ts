import E2eBaseUtil, { TableOutput, TableRow } from './e2e-base-util'

export default class E2eViewUtil extends E2eBaseUtil {
  static readonly MESSAGES = {
    NoSoftwares: 'No softwares to view. Please add a software to have something to view.',
  }

  static getDefaultViewChunks({ rows }: { rows: TableRow[] }): TableOutput[] {
    return [
      {
        rows,
      },
    ]
  }
}
