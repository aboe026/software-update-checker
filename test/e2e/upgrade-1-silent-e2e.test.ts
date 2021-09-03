import E2eBaseUtil from './helpers/e2e-base-util'
import E2eTestUtil from './helpers/e2e-test-util'
import { RowDecoration } from './helpers/e2e-base-util'
import Software from '../../src/software/software'
import Website from '../helpers/website'

describe('Upgrade 1 Silent', () => {
  beforeAll(async () => {
    await Website.start()
  })
  afterAll(async () => {
    await Website.stop()
  })
  it('silent add works with single existing software with shellOverride without version', async () => {
    const existingSoftware = {
      name: 'e2e upgrade 1 silent add single existing shellOverride without version',
      executable: {
        command: 'spectrum',
      },
      args: 'electromagnetic',
      shellOverride: 'visible',
      installedRegex: 'high',
      url: 'https://purplerain.com',
      latestRegex: 'violet',
    }
    const installedVersion = '0.7.4'
    const latestVersion = '0.7.6'
    const newSoftware = new Software({
      name: 'e2e upgrade 1 silent add single shellOverride without version',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      shell: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eBaseUtil.setOldSoftwares([existingSoftware], false)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], false)
    await E2eTestUtil.addSilent({
      software: newSoftware,
      installedVersion,
      latestVersion,
    })
    await E2eBaseUtil.verifySoftwares([
      new Software({
        name: existingSoftware.name,
        executable: existingSoftware.executable,
        args: existingSoftware.args,
        shell: existingSoftware.shellOverride,
        installedRegex: existingSoftware.installedRegex,
        url: existingSoftware.url,
        latestRegex: existingSoftware.latestRegex,
      }),
      newSoftware,
    ])
  })
  it('silent add works with single existing software with shellOverride from version 0', async () => {
    const existingSoftware = {
      name: 'e2e upgrade 1 silent add single existing shellOverride version 0',
      executable: {
        command: 'nightclub',
      },
      args: 'gin',
      shellOverride: 'warner bros',
      installedRegex: 'casablanca',
      url: 'https://hereslookingatyoukid.com',
      latestRegex: 'Ricks Cafe Americain',
    }
    const installedVersion = '0.6.1'
    const latestVersion = '0.6.7'
    const newSoftware = new Software({
      name: 'e2e upgrade 1 silent add single shellOverride version 0',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      shell: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eBaseUtil.setOldSoftwares([existingSoftware], 0)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], 0)
    await E2eTestUtil.addSilent({
      software: newSoftware,
      installedVersion,
      latestVersion,
    })
    await E2eBaseUtil.verifySoftwares([
      new Software({
        name: existingSoftware.name,
        executable: existingSoftware.executable,
        args: existingSoftware.args,
        shell: existingSoftware.shellOverride,
        installedRegex: existingSoftware.installedRegex,
        url: existingSoftware.url,
        latestRegex: existingSoftware.latestRegex,
      }),
      newSoftware,
    ])
  })
  it('silent edit works with single existing software with shellOverride without version', async () => {
    const existingSoftware = {
      name: 'e2e upgrade 1 silent edit single existing shellOverride without version',
      executable: {
        command: 'time',
      },
      args: 'hour',
      shellOverride: 'colloquialism',
      installedRegex: '0300',
      url: 'https://boo.com',
      latestRegex: 'witching hour',
    }
    const installedVersion = '0.5.6'
    const latestVersion = '0.6.5'
    const newSoftware = new Software({
      name: `${existingSoftware.name} edited`,
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      shell: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eBaseUtil.setOldSoftwares([existingSoftware], false)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], false)
    await E2eTestUtil.editSilent({
      existingName: existingSoftware.name,
      newSoftware,
      newInstalledVersion: installedVersion,
      newLatestVersion: latestVersion,
    })
    await E2eBaseUtil.verifySoftwares([newSoftware])
  })
  it('silent edit works with single existing software with shellOverride from version 0', async () => {
    const existingSoftware = {
      name: 'e2e upgrade 1 silent edit single existing shellOverride version 0',
      executable: {
        command: 'omnipotent',
      },
      args: 'black belt',
      shellOverride: 'superhuman',
      installedRegex: 'texas ranger',
      url: 'https://themanthemyththelegend.com',
      latestRegex: 'chuck norris',
    }
    const installedVersion = '0.9.3'
    const latestVersion = '0.9.9'
    const newSoftware = new Software({
      name: `${existingSoftware.name} edited`,
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      shell: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    })
    await E2eBaseUtil.setOldSoftwares([existingSoftware], 0)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], 0)
    await E2eTestUtil.editSilent({
      existingName: existingSoftware.name,
      newSoftware,
      newInstalledVersion: installedVersion,
      newLatestVersion: latestVersion,
    })
    await E2eBaseUtil.verifySoftwares([newSoftware])
  })
  it('silent view works with single existing software with shellOverride without version', async () => {
    const installedVersion = '0.5.3'
    const latestVersion = '0.6.2'
    const existingSoftware = {
      name: 'e2e upgrade 1 silent view single existing shellOverride without version',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    }
    await E2eBaseUtil.setOldSoftwares([existingSoftware], false)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], false)
    await E2eTestUtil.viewSilent({
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
        executable: existingSoftware.executable,
        args: existingSoftware.args,
        shell: existingSoftware.shellOverride,
        installedRegex: existingSoftware.installedRegex,
        url: existingSoftware.url,
        latestRegex: existingSoftware.latestRegex,
      }),
    ])
  })
  it('silent view works with single existing software with shellOverride from version 0', async () => {
    const installedVersion = '0.5.1'
    const latestVersion = '0.6.0'
    const existingSoftware = {
      name: 'e2e upgrade 1 silent view single existing shellOverride version 0',
      executable: {
        command: 'node',
      },
      args: `${E2eBaseUtil.COMMAND.Good} v${installedVersion}`,
      shellOverride: '',
      installedRegex: 'v(.*)',
      url: Website.getResponseUrl(`latest: v${latestVersion}`),
      latestRegex: 'latest: v(.*)',
    }
    await E2eBaseUtil.setOldSoftwares([existingSoftware], 0)
    await E2eBaseUtil.verifyOldSoftwares([existingSoftware], 0)
    await E2eTestUtil.viewSilent({
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
        executable: existingSoftware.executable,
        args: existingSoftware.args,
        shell: existingSoftware.shellOverride,
        installedRegex: existingSoftware.installedRegex,
        url: existingSoftware.url,
        latestRegex: existingSoftware.latestRegex,
      }),
    ])
  })
  it('silent delete works with existing softwares with shellOverride without version', async () => {
    const firstSoftware = {
      name: 'e2e upgrade 1 silent delete shellOverride without version first',
      executable: {
        command: 'host',
      },
      args: 'Public Broadcasting Service',
      shellOverride: 'tv',
      installedRegex: 'Mister Rogers Neighborhood',
      url: 'https://wontyoubemyneighbor.com',
      latestRegex: 'Fred McFeely Rogers',
    }
    const lastSoftware = {
      name: 'e2e upgrade 1 silent delete shellOverride without version last',
      executable: {
        command: 'painter',
      },
      args: 'pbs',
      shellOverride: 'artist',
      installedRegex: 'the joy of painting',
      url: 'https://happylittleaccidents.com',
      latestRegex: 'Robert Norman Ross',
    }
    await E2eBaseUtil.setOldSoftwares([firstSoftware, lastSoftware], false)
    await E2eBaseUtil.verifyOldSoftwares([firstSoftware, lastSoftware], false)
    await E2eTestUtil.deleteSilent({
      existingName: firstSoftware.name,
    })
    await E2eBaseUtil.verifySoftwares([
      new Software({
        name: lastSoftware.name,
        executable: lastSoftware.executable,
        args: lastSoftware.args,
        shell: lastSoftware.shellOverride,
        installedRegex: lastSoftware.installedRegex,
        url: lastSoftware.url,
        latestRegex: lastSoftware.latestRegex,
      }),
    ])
  })
  it('silent delete works with existing softwares with shellOverride from version 0', async () => {
    const firstSoftware = {
      name: 'e2e upgrade 1 silent delete shellOverride version 0 first',
      executable: {
        command: 'rating',
      },
      args: 'intensity',
      shellOverride: 'scale',
      installedRegex: 'tornado',
      url: 'https://twister.com',
      latestRegex: 'fujita',
    }
    const lastSoftware = {
      name: 'e2e upgrade 1 silent delete shellOverride version 0 last',
      executable: {
        command: 'airship',
      },
      args: 'zeppelin',
      shellOverride: 'transportation',
      installedRegex: 'lead',
      url: 'https://ohthehumanity.com',
      latestRegex: 'LZ 129 Hindenburg',
    }
    await E2eBaseUtil.setOldSoftwares([firstSoftware, lastSoftware], 0)
    await E2eBaseUtil.verifyOldSoftwares([firstSoftware, lastSoftware], 0)
    await E2eTestUtil.deleteSilent({
      existingName: firstSoftware.name,
    })
    await E2eBaseUtil.verifySoftwares([
      new Software({
        name: lastSoftware.name,
        executable: lastSoftware.executable,
        args: lastSoftware.args,
        shell: lastSoftware.shellOverride,
        installedRegex: lastSoftware.installedRegex,
        url: lastSoftware.url,
        latestRegex: lastSoftware.latestRegex,
      }),
    ])
  })
})
