import E2eBaseUtil from './helpers/e2e-base-util'
import E2eTestUtil from './helpers/e2e-test-util'
import { RowDecoration } from './helpers/e2e-base-util'
import Software from '../../src/software/software'
import Website from '../helpers/website'

describe('Upgrade 1 Interactive', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  it('interactive add works with single existing software with shellOverride without version', async () => {
    const existingSoftware = {
      name: 'e2e upgrade 1 interactive add single existing shellOverride without version',
      shellOverride: 'metaphysics',
      directory: 'identity',
      executable: {
        command: 'experiment',
      },
      args: 'thought',
      installedRegex: 'ship',
      url: 'https://whoami.com',
      latestRegex: 'theseus',
    }
    const installedVersion = '0.7.0'
    const latestVersion = '0.7.7'
    const newSoftware = new Software({
      name: 'e2e upgrade 1 interactive add single shellOverride without version',
      shell: '',
      directory: '',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eBaseUtil.setOldSoftwares([existingSoftware], false)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], false)
    await E2eTestUtil.addInteractive({
      software: newSoftware,
      installedVersion,
      latestVersion,
    })
    await E2eBaseUtil.verifySoftwares([
      new Software({
        name: existingSoftware.name,
        shell: existingSoftware.shellOverride,
        directory: existingSoftware.directory,
        executable: existingSoftware.executable,
        args: existingSoftware.args,
        installedRegex: existingSoftware.installedRegex,
        url: existingSoftware.url,
        latestRegex: existingSoftware.latestRegex,
      }),
      newSoftware,
    ])
  })
  it('interactive add works with single existing software with shellOverride from version 0', async () => {
    const existingSoftware = {
      name: 'e2e upgrade 1 interactive add single existing shellOverride version 0',
      directory: 'cow',
      shellOverride: 'diary',
      executable: {
        command: 'cheeses',
      },
      args: 'alpine',
      installedRegex: 'veneto',
      url: 'https://productofthemountains.com',
      latestRegex: 'asiago',
    }
    const installedVersion = '0.7.1'
    const latestVersion = '0.7.8'
    const newSoftware = new Software({
      name: 'e2e upgrade 1 interactive add single shellOverride version 0',
      shell: '',
      directory: '',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eBaseUtil.setOldSoftwares([existingSoftware], 0)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], 0)
    await E2eTestUtil.addInteractive({
      software: newSoftware,
      installedVersion,
      latestVersion,
    })
    await E2eBaseUtil.verifySoftwares([
      new Software({
        name: existingSoftware.name,
        shell: existingSoftware.shellOverride,
        directory: existingSoftware.directory,
        executable: existingSoftware.executable,
        args: existingSoftware.args,
        installedRegex: existingSoftware.installedRegex,
        url: existingSoftware.url,
        latestRegex: existingSoftware.latestRegex,
      }),
      newSoftware,
    ])
  })
  it('interactive edit works with single existing software with shellOverride without version', async () => {
    const existingSoftware = {
      name: 'e2e upgrade 1 interactive edit single existing shellOverride without version',
      shellOverride: 'game',
      directory: 'global',
      executable: {
        command: 'competition',
      },
      args: 'athletic',
      installedRegex: 'greek',
      url: 'https://icallupontheyouthoftheworld.com',
      latestRegex: 'olympics',
    }
    const installedVersion = '0.6.6'
    const latestVersion = '0.6.7'
    const newSoftware = new Software({
      name: `${existingSoftware.name} edited`,
      shell: '',
      directory: '',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eBaseUtil.setOldSoftwares([existingSoftware], false)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], false)
    await E2eTestUtil.editInteractive({
      existingSoftwares: [
        new Software({
          name: existingSoftware.name,
          shell: existingSoftware.shellOverride,
          directory: existingSoftware.directory,
          executable: existingSoftware.executable,
          args: existingSoftware.args,
          installedRegex: existingSoftware.installedRegex,
          url: existingSoftware.url,
          latestRegex: existingSoftware.latestRegex,
        }),
      ],
      positionToEdit: 0,
      newSoftware,
      newInstalledVersion: installedVersion,
      newLatestVersion: latestVersion,
    })
    await E2eBaseUtil.verifySoftwares([newSoftware])
  })
  it('interactive edit works with single existing software with shellOverride from version 0', async () => {
    const existingSoftware = {
      name: 'e2e upgrade 1 interactive edit single existing shellOverride version 0',
      shellOverride: 'marine',
      directory: 'wonder',
      executable: {
        command: 'ecosystem',
      },
      args: 'coral',
      installedRegex: 'australia',
      url: 'https://fisharefriends.com',
      latestRegex: 'great barrier reef',
    }
    const installedVersion = '0.8.5'
    const latestVersion = '0.8.6'
    const newSoftware = new Software({
      name: `${existingSoftware.name} edited`,
      shell: '',
      directory: '',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eBaseUtil.setOldSoftwares([existingSoftware], 0)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], 0)
    await E2eTestUtil.editInteractive({
      existingSoftwares: [
        new Software({
          name: existingSoftware.name,
          shell: existingSoftware.shellOverride,
          directory: existingSoftware.directory,
          executable: existingSoftware.executable,
          args: existingSoftware.args,
          installedRegex: existingSoftware.installedRegex,
          url: existingSoftware.url,
          latestRegex: existingSoftware.latestRegex,
        }),
      ],
      positionToEdit: 0,
      newSoftware,
      newInstalledVersion: installedVersion,
      newLatestVersion: latestVersion,
    })
    await E2eBaseUtil.verifySoftwares([newSoftware])
  })
  it('interactive view works with single existing software with shellOverride without version', async () => {
    const installedVersion = '0.5.1'
    const latestVersion = '0.6.0'
    const existingSoftware = {
      name: 'e2e upgrade 1 interactive view single existing shellOverride without version',
      shellOverride: '',
      directory: '',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    }
    await E2eBaseUtil.setOldSoftwares([existingSoftware], false)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], false)
    await E2eTestUtil.viewInteractive({
      rows: [
        {
          name: existingSoftware.name,
          installed: installedVersion,
          latest: latestVersion,
          decoration: RowDecoration.Update,
        },
      ],
    })
    await E2eBaseUtil.verifySoftwares([
      new Software({
        name: existingSoftware.name,
        shell: existingSoftware.shellOverride,
        directory: existingSoftware.directory,
        executable: existingSoftware.executable,
        args: existingSoftware.args,
        installedRegex: existingSoftware.installedRegex,
        url: existingSoftware.url,
        latestRegex: existingSoftware.latestRegex,
      }),
    ])
  })
  it('interactive view works with single existing software with shellOverride from version 0', async () => {
    const installedVersion = '0.5.2'
    const latestVersion = '0.6.1'
    const existingSoftware = {
      name: 'e2e upgrade 1 interactive view single existing shellOverride version 0',
      shellOverride: '',
      directory: '',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    }
    await E2eBaseUtil.setOldSoftwares([existingSoftware], 0)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], 0)
    await E2eTestUtil.viewInteractive({
      rows: [
        {
          name: existingSoftware.name,
          installed: installedVersion,
          latest: latestVersion,
          decoration: RowDecoration.Update,
        },
      ],
    })
    await E2eBaseUtil.verifySoftwares([
      new Software({
        name: existingSoftware.name,
        shell: existingSoftware.shellOverride,
        directory: existingSoftware.directory,
        executable: existingSoftware.executable,
        args: existingSoftware.args,
        installedRegex: existingSoftware.installedRegex,
        url: existingSoftware.url,
        latestRegex: existingSoftware.latestRegex,
      }),
    ])
  })
  it('interactive delete works with existing softwares with shellOverride without version', async () => {
    const firstSoftware = {
      name: 'e2e upgrade 1 interactive delete shellOverride without version first',
      shellOverride: 'comedy',
      directory: 'ohio',
      executable: {
        command: 'business',
      },
      args: 'automotive',
      installedRegex: 'break pads',
      url: 'https://holyschnikes.com',
      latestRegex: 'callahan auto',
    }
    const lastSoftware = {
      name: 'e2e upgrade 1 interactive delete shellOverride without version last',
      shellOverride: 'supernatural',
      directory: 'drumbeats',
      executable: {
        command: 'game',
      },
      args: 'board',
      installedRegex: 'jungle',
      url: 'https://whatyearisit.com',
      latestRegex: 'jumanji',
    }
    await E2eBaseUtil.setOldSoftwares([firstSoftware, lastSoftware], false)
    await E2eBaseUtil.verifyOldSoftwares([firstSoftware, lastSoftware], false)
    await E2eTestUtil.deleteInteractive({
      existingSoftwares: [
        new Software({
          name: firstSoftware.name,
          shell: firstSoftware.shellOverride,
          directory: firstSoftware.directory,
          executable: firstSoftware.executable,
          args: firstSoftware.args,
          installedRegex: firstSoftware.installedRegex,
          url: firstSoftware.url,
          latestRegex: firstSoftware.latestRegex,
        }),
        new Software({
          name: lastSoftware.name,
          shell: lastSoftware.shellOverride,
          directory: lastSoftware.directory,
          executable: lastSoftware.executable,
          args: lastSoftware.args,
          installedRegex: lastSoftware.installedRegex,
          url: lastSoftware.url,
          latestRegex: lastSoftware.latestRegex,
        }),
      ],
      positionToDelete: 0,
    })
    await E2eBaseUtil.verifySoftwares([
      new Software({
        name: lastSoftware.name,
        shell: lastSoftware.shellOverride,
        directory: lastSoftware.directory,
        executable: lastSoftware.executable,
        args: lastSoftware.args,
        installedRegex: lastSoftware.installedRegex,
        url: lastSoftware.url,
        latestRegex: lastSoftware.latestRegex,
      }),
    ])
  })
  it('interactive delete works with existing softwares with shellOverride from version 0', async () => {
    const firstSoftware = {
      name: 'e2e upgrade 1 interactive delete shellOverride version 0 first',
      shellOverride: 'fiction',
      directory: 'family',
      executable: {
        command: 'word',
      },
      args: 'one from many',
      installedRegex: 'high speech',
      url: 'https://longdayspleasantnights.com',
      latestRegex: 'ka-tet',
    }
    const lastSoftware = {
      name: 'e2e upgrade 1 interactive delete shellOverride version 0 last',
      shellOverride: 'grain',
      directory: 'unleavened',
      executable: {
        command: 'flatbread',
      },
      args: 'corn',
      installedRegex: 'hominy',
      url: 'https://littlecake.com',
      latestRegex: 'tortilla',
    }
    await E2eBaseUtil.setOldSoftwares([firstSoftware, lastSoftware], 0)
    await E2eBaseUtil.verifyOldSoftwares([firstSoftware, lastSoftware], 0)
    await E2eTestUtil.deleteInteractive({
      existingSoftwares: [
        new Software({
          name: firstSoftware.name,
          shell: firstSoftware.shellOverride,
          directory: firstSoftware.directory,
          executable: firstSoftware.executable,
          args: firstSoftware.args,
          installedRegex: firstSoftware.installedRegex,
          url: firstSoftware.url,
          latestRegex: firstSoftware.latestRegex,
        }),
        new Software({
          name: lastSoftware.name,
          shell: lastSoftware.shellOverride,
          directory: lastSoftware.directory,
          executable: lastSoftware.executable,
          args: lastSoftware.args,
          installedRegex: lastSoftware.installedRegex,
          url: lastSoftware.url,
          latestRegex: lastSoftware.latestRegex,
        }),
      ],
      positionToDelete: 0,
    })
    await E2eBaseUtil.verifySoftwares([
      new Software({
        name: lastSoftware.name,
        shell: lastSoftware.shellOverride,
        directory: lastSoftware.directory,
        executable: lastSoftware.executable,
        args: lastSoftware.args,
        installedRegex: lastSoftware.installedRegex,
        url: lastSoftware.url,
        latestRegex: lastSoftware.latestRegex,
      }),
    ])
  })
})
