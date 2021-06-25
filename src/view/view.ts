import cliProgress from 'cli-progress'
import Table from 'cli-table3'

import colors from '../colors'
import SoftwareList from '../software-list'

export default class View {
  static async showVersions(): Promise<void> {
    const softwares = await SoftwareList.load()
    if (softwares.length === 0) {
      console.warn(colors.yellow('No softwares to view. Please add a software to have something to view.'))
    } else {
      const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
      progress.start(softwares.length, 0)
      const table = new Table({
        head: ['Name'.white, 'Installed'.white, 'Latest'.white],
      })
      for (const software of softwares) {
        let installed: string | null = null
        let latest: string | null = null
        let installedError = false
        let latestError = false
        let color: colors.Color = colors.white
        try {
          installed = await software.getInstalledVersion()
        } catch (err) {
          installedError = true
        }
        try {
          latest = await software.getLatestVersion()
        } catch (err) {
          latestError = true
        }
        if (installedError || latestError || !installed || !latest) {
          color = colors.red
        } else if (installed !== latest) {
          color = colors.green
        }
        table.push([
          color(software.name),
          color((installedError ? 'Error' : installed || '').trim()),
          color((latestError ? 'Error' : latest || '').trim()),
        ])
        progress.increment()
      }

      progress.stop()
      console.table(table.toString())
    }
  }
}
