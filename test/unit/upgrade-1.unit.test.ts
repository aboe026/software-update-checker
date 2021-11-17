import upgrade1 from '../../src/software/upgrades/upgrade-1'

describe('Upgrade 1 Unit Tests', () => {
  it('does not error with empty array', async () => {
    await expect(upgrade1([])).resolves.toEqual([])
  })
  it('does not alter single software without shellOverride', async () => {
    const softwares = [
      {
        name: 'single no shell override',
        executable: {
          command: 'medium',
        },
        args: 'information',
        installedRegex: 'written',
        url: 'https://takealookitsinabook.com',
        latestRegex: 'e-book',
      },
    ]
    await expect(upgrade1(softwares)).resolves.toEqual(softwares)
  })
  it('does not alter single software with empty shellOverride', async () => {
    const softwares = [
      {
        name: 'single shell override empty',
        shellOverride: '',
        executable: {
          command: 'ecosystems',
        },
        installedRegex: 'grass',
        url: 'https://homeontheplains.com',
        latestRegex: 'prairie',
      },
    ]
    await expect(upgrade1(softwares)).resolves.toEqual(softwares)
  })
  it('does not alter multiple softwares without shellOverride', async () => {
    const softwares = [
      {
        name: 'multiple no shell override first',
        executable: {
          command: 'alphabet',
        },
        args: 'grecian',
        installedRegex: 'beginning',
        url: 'https://start.com',
        latestRegex: 'alpha',
      },
      {
        name: 'multiple no shell override last',
        executable: {
          command: 'greek',
        },
        args: 'alphabet',
        installedRegex: 'end',
        url: 'https://end.com',
        latestRegex: 'omega',
      },
    ]
    await expect(upgrade1(softwares)).resolves.toEqual(softwares)
  })
  it('converts shellOverride to shell for single software', async () => {
    const softwaresBefore = [
      {
        name: 'single with shell override',
        shellOverride: 'system',
        executable: {
          command: 'transport',
        },
        args: 'physical',
        installedRegex: 'mail',
        url: 'https://neithersnownorrainnorheatnorgloom.com',
        latestRegex: 'e-mail',
      },
    ]
    const softwaresAfter = [
      {
        name: softwaresBefore[0].name,
        shell: softwaresBefore[0].shellOverride,
        executable: softwaresBefore[0].executable,
        args: softwaresBefore[0].args,
        installedRegex: softwaresBefore[0].installedRegex,
        url: softwaresBefore[0].url,
        latestRegex: softwaresBefore[0].latestRegex,
      },
    ]
    await expect(upgrade1(softwaresBefore)).resolves.toEqual(softwaresAfter)
  })
  it('converts empty shellOverride to shell for single software', async () => {
    const softwaresBefore = [
      {
        name: 'single with empty shell override',
        shellOverride: '',
        executable: {
          command: 'indigenous',
        },
        args: 'polynesian',
        installedRegex: 'new zealand',
        url: 'https://haka.com',
        latestRegex: 'maori',
      },
    ]
    const softwaresAfter = [
      {
        name: softwaresBefore[0].name,
        shell: softwaresBefore[0].shellOverride,
        executable: softwaresBefore[0].executable,
        args: softwaresBefore[0].args,
        installedRegex: softwaresBefore[0].installedRegex,
        url: softwaresBefore[0].url,
        latestRegex: softwaresBefore[0].latestRegex,
      },
    ]
    await expect(upgrade1(softwaresBefore)).resolves.toEqual(softwaresAfter)
  })
  it('converts shellOverride to shell of multiple softwares', async () => {
    const softwaresBefore = [
      {
        name: 'multiple with shell override first',
        shellOverride: 'breakfast',
        executable: {
          command: 'dish',
        },
        args: 'ironed',
        installedRegex: 'waffle',
        url: 'https://leggomyeggo.com',
        latestRegex: 'belgian',
      },
      {
        name: 'multiple with shell override last',
        shellOverride: 'cultivar',
        executable: {
          command: 'berry',
        },
        args: 'blackberry',
        installedRegex: 'oregon',
        url: 'https://avemarion.com',
        latestRegex: 'marionberry',
      },
    ]
    const softwaresAfter = [
      {
        name: softwaresBefore[0].name,
        shell: softwaresBefore[0].shellOverride,
        executable: softwaresBefore[0].executable,
        args: softwaresBefore[0].args,
        installedRegex: softwaresBefore[0].installedRegex,
        url: softwaresBefore[0].url,
        latestRegex: softwaresBefore[0].latestRegex,
      },
      {
        name: softwaresBefore[1].name,
        shell: softwaresBefore[1].shellOverride,
        executable: softwaresBefore[1].executable,
        args: softwaresBefore[1].args,
        installedRegex: softwaresBefore[1].installedRegex,
        url: softwaresBefore[1].url,
        latestRegex: softwaresBefore[1].latestRegex,
      },
    ]
    await expect(upgrade1(softwaresBefore)).resolves.toEqual(softwaresAfter)
  })
  it('converts shellOverride to shell for some of many softwares', async () => {
    const softwaresBefore = [
      {
        name: 'some of many first',
        shellOverride: 'metal',
        executable: {
          command: 'machine',
        },
        args: 'tool',
        installedRegex: 'rotate',
        url: 'https://turniton.com',
        latestRegex: 'lathe',
      },
      {
        name: 'some of many middle',
        executable: {
          command: 'store',
        },
        args: 'rental',
        installedRegex: 'video',
        url: 'https://bekindrewind.com',
        latestRegex: 'Blockbuster LLC',
      },
      {
        name: 'some of many last',
        shellOverride: 'mathematics',
        executable: {
          command: 'constant',
        },
        args: 'irrational',
        installedRegex: '3.14*',
        url: 'https://memorizethis.com',
        latestRegex: 'pi',
      },
    ]
    const softwaresAfter = [
      {
        name: softwaresBefore[0].name,
        shell: softwaresBefore[0].shellOverride,
        executable: softwaresBefore[0].executable,
        args: softwaresBefore[0].args,
        installedRegex: softwaresBefore[0].installedRegex,
        url: softwaresBefore[0].url,
        latestRegex: softwaresBefore[0].latestRegex,
      },
      {
        name: softwaresBefore[1].name,
        shell: softwaresBefore[1].shellOverride,
        executable: softwaresBefore[1].executable,
        args: softwaresBefore[1].args,
        installedRegex: softwaresBefore[1].installedRegex,
        url: softwaresBefore[1].url,
        latestRegex: softwaresBefore[1].latestRegex,
      },
      {
        name: softwaresBefore[2].name,
        shell: softwaresBefore[2].shellOverride,
        executable: softwaresBefore[2].executable,
        args: softwaresBefore[2].args,
        installedRegex: softwaresBefore[2].installedRegex,
        url: softwaresBefore[2].url,
        latestRegex: softwaresBefore[2].latestRegex,
      },
    ]
    await expect(upgrade1(softwaresBefore)).resolves.toEqual(softwaresAfter)
  })
})
