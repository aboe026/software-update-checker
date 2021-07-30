import fs from 'fs-extra'

import Software from '../../src/software'
import SoftwareList from '../../src/software-list'

jest.mock('fs-extra')

describe('Software List Unit Tests', () => {
  beforeEach(() => {
    fs.ensureDir = jest.fn().mockResolvedValue(true)
    fs.writeFile = jest.fn().mockResolvedValue(true)
  })
  describe('add', () => {
    it('throws error if software with name already exists', async () => {
      const existingName = 'hey i already exist'
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [
        new Software({
          name: existingName,
          executable: {
            command: 'lorem',
          },
          args: 'ipsum',
          installedRegex: 'roma',
          url: 'https://spqr.com',
          latestRegex: 'caesar',
        }),
      ])
      await expect(
        SoftwareList.add(
          new Software({
            name: existingName,
            executable: {
              command: 'gods',
            },
            args: 'greek',
            installedRegex: 'zeus',
            url: 'https://olympus.com',
            latestRegex: 'allfather',
          })
        )
      ).rejects.toThrow(`Software with name "${existingName}" already exists.`)
    })
    it('returns list with software added at end on empty list', async () => {
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [])
      const software: Software = new Software({
        name: 'add single',
        executable: {
          command: 'salve',
        },
        args: 'world',
        installedRegex: 'v(.*)',
        url: '',
        latestRegex: 'latest: v(.*)',
      })
      await expect(SoftwareList.add(software)).resolves.toStrictEqual([software])
    })
    it('returns list with software added alphabetically at beginning on list with single software already', async () => {
      const existingSoftware = new Software({
        name: 'existing single',
        executable: {
          command: 'foo',
        },
        args: 'bar',
        installedRegex: 'test',
        url: 'https://google.com',
        latestRegex: 'potatoe',
      })
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [existingSoftware])
      const software: Software = new Software({
        name: 'add after single existing to beginning',
        executable: {
          command: 'aloha',
        },
        args: 'oahu',
        installedRegex: 'island',
        url: 'https://hawaiia.com',
        latestRegex: 'mahalo',
      })
      await expect(SoftwareList.add(software)).resolves.toStrictEqual([software, existingSoftware])
    })
    it('returns list with software added alphabetically to end on list with single software already', async () => {
      const existingSoftware = new Software({
        name: 'an existing single',
        executable: {
          command: 'manufacturer',
        },
        args: 'cpu',
        installedRegex: 'amd',
        url: 'https://threadripper.com',
        latestRegex: 'advanced micro devices',
      })
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [existingSoftware])
      const software: Software = new Software({
        name: 'the added after single existing to end',
        executable: {
          command: 'designer',
        },
        args: 'gpu',
        installedRegex: 'GeForce',
        url: 'https://ampere.com',
        latestRegex: 'nvidia',
      })
      await expect(SoftwareList.add(software)).resolves.toStrictEqual([existingSoftware, software])
    })
    it('returns list with software added alphabetically to middle on list with two softwares already', async () => {
      const existingSoftwareOne = new Software({
        name: 'an existing double',
        executable: {
          command: 'planets',
        },
        args: 'gas',
        installedRegex: 'biggest',
        url: 'https://getmorestupider.com',
        latestRegex: 'jupiter',
      })
      const existingSoftwareTwo = new Software({
        name: 'the existing double trouble',
        executable: {
          command: 'habitable',
        },
        args: 'solar-system',
        installedRegex: 'worlds',
        url: 'https://bluemarble.com',
        latestRegex: 'earth',
      })
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [existingSoftwareOne, existingSoftwareTwo])
      const software: Software = new Software({
        name: 'middling double existing',
        executable: {
          command: 'minor',
        },
        args: 'kuiper',
        shellOverride: 'planet',
        installedRegex: 'pluto',
        url: 'https://coldshouldered.com',
        latestRegex: '134340',
      })
      await expect(SoftwareList.add(software)).resolves.toStrictEqual([
        existingSoftwareOne,
        software,
        existingSoftwareTwo,
      ])
    })
  })
  describe('edit', () => {
    it('throws error if editing a software with empty list', async () => {
      const oldSoftware = new Software({
        name: 'i am old',
        executable: {
          command: 'rocks',
        },
        args: 'sedimentary',
        installedRegex: 'shale',
        url: 'https://rock.com',
        latestRegex: 'mudrock',
      })
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [])
      const newSoftware: Software = new Software({
        name: 'i am new',
        executable: {
          command: 'stars',
        },
        args: 'main',
        installedRegex: 'yellow dwarf',
        url: 'https://stars.com',
        latestRegex: 'sol',
      })
      await expect(SoftwareList.edit(oldSoftware, newSoftware)).rejects.toThrow(
        `Could not find software to edit with name "${oldSoftware.name}".`
      )
    })
    it('throws error if editing a software not in list', async () => {
      const oldSoftware = new Software({
        name: 'edit old not in list',
        executable: {
          command: 'whales',
        },
        args: 'baleen',
        installedRegex: 'blue',
        url: 'https://whaleofatime.com',
        latestRegex: 'Balaenoptera musculus',
      })
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [
        new Software({
          name: 'edit existing not in list',
          executable: {
            command: 'fishes',
          },
          args: 'freshwater',
          installedRegex: 'walleye',
          url: 'https://fishy.com',
          latestRegex: 'Sander vitreus',
        }),
      ])
      const newSoftware: Software = new Software({
        name: 'edit new not in list',
        executable: {
          command: 'crustaceans',
        },
        args: 'families',
        installedRegex: 'lobster',
        url: 'https://redlobster.com',
        latestRegex: 'Nephropidae',
      })
      await expect(SoftwareList.edit(oldSoftware, newSoftware)).rejects.toThrow(
        `Could not find software to edit with name "${oldSoftware.name}".`
      )
    })
    it('edit only software in list', async () => {
      const oldSoftware = new Software({
        name: 'single edit old',
        executable: {
          command: 'computers',
        },
        args: 'microsoft',
        installedRegex: 'surface',
        url: 'https://computers.com',
        latestRegex: 'surface pro x',
      })
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [oldSoftware])
      const newSoftware: Software = new Software({
        name: 'single edit new',
        executable: {
          command: 'phones',
        },
        args: 'android',
        installedRegex: 'galaxy',
        url: 'https://phones.com',
        latestRegex: 'samsung galaxy',
      })
      await expect(SoftwareList.edit(oldSoftware, newSoftware)).resolves.toStrictEqual([newSoftware])
    })
    it('edit first software in list', async () => {
      const oldSoftware = new Software({
        name: 'an old software first edit',
        executable: {
          command: 'cars',
        },
        args: 'crossovers',
        installedRegex: 'cx-5',
        url: 'https://cars.com',
        latestRegex: 'mazda cx-5',
      })
      const existingSoftware = new Software({
        name: 'first edit existing',
        executable: {
          command: 'wines',
        },
        args: 'red',
        installedRegex: 'pinot noir',
        url: 'https://wines.com',
        latestRegex: 'washington pinot',
      })
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [oldSoftware, existingSoftware])
      const newSoftware: Software = new Software({
        name: 'first edit new',
        executable: {
          command: 'planes',
        },
        args: 'passenger',
        installedRegex: '747',
        url: 'https://planes.com',
        latestRegex: 'boeing 747',
      })
      await expect(SoftwareList.edit(oldSoftware, newSoftware)).resolves.toStrictEqual([existingSoftware, newSoftware])
    })
    it('edit last software in list', async () => {
      const oldSoftware = new Software({
        name: 'last edit old',
        executable: {
          command: 'cats',
        },
        args: 'domestic',
        installedRegex: 'tabby',
        url: 'https://cats.com',
        latestRegex: 'Felis catus',
      })
      const existingSoftware = new Software({
        name: 'last edit existing',
        executable: {
          command: 'dogs',
        },
        args: 'retriever',
        installedRegex: 'labrador',
        url: 'https://dogs.com',
        latestRegex: 'Canis familiaris',
      })
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [existingSoftware, oldSoftware])
      const newSoftware: Software = new Software({
        name: 'last edit new',
        executable: {
          command: 'goats',
        },
        args: 'caprinae',
        installedRegex: 'mountain',
        url: 'https://goat.com',
        latestRegex: 'Oreamnos americanus',
      })
      await expect(SoftwareList.edit(oldSoftware, newSoftware)).resolves.toStrictEqual([existingSoftware, newSoftware])
    })
  })
  describe('delete', () => {
    it('throw error if empty string', async () => {
      await expect(SoftwareList.delete('')).rejects.toThrow('Must specify non-empty name to delete')
    })
    it('throw error if no softwares in list', async () => {
      const name = 'test-delete-no-softwares'
      await expect(SoftwareList.delete(name)).rejects.toThrow(`Could not find software to delete with name "${name}".`)
    })
    it('throw error if software not in list', async () => {
      const name = 'test-delete-not-in-list'
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [
        new Software({
          name: 'existing delete not in list',
          executable: {
            command: 'fruit',
          },
          args: 'drupe',
          installedRegex: 'cherry',
          url: 'https://fruits.com',
          latestRegex: 'prunus',
        }),
      ])
      await expect(SoftwareList.delete(name)).rejects.toThrow(`Could not find software to delete with name "${name}".`)
    })
    it('removes only software in list', async () => {
      const name = 'test-delete-only-in-list'
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [
        new Software({
          name,
          executable: {
            command: 'lotr',
          },
          args: 'maia',
          installedRegex: 'gandalf',
          url: 'https://middleearth.com',
          latestRegex: 'mithrandir',
        }),
      ])
      await expect(SoftwareList.delete(name)).resolves.toStrictEqual([])
    })
    it('removes first software in list', async () => {
      const name = 'test-delete-first-in-list'
      const lastSoftware = new Software({
        name: 'test-delete-first-other',
        executable: {
          command: 'heroes',
        },
        args: 'spiderman',
        installedRegex: 'tobey',
        url: 'https://spidey.com',
        latestRegex: 'maguire',
      })
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [
        new Software({
          name,
          executable: {
            command: 'mi6',
          },
          args: 'agents',
          installedRegex: 'bond',
          url: 'https://jamesbond.com',
          latestRegex: 'brosnan',
        }),
        lastSoftware,
      ])
      await expect(SoftwareList.delete(name)).resolves.toStrictEqual([lastSoftware])
    })
    it('removes last software in list', async () => {
      const name = 'test-delete-last-in-list'
      const firstSoftware = new Software({
        name: 'test-delete-last-other',
        executable: {
          command: 'cheese',
        },
        args: 'semi-soft',
        installedRegex: 'havarti',
        url: 'https://cheesy.com',
        latestRegex: 'cream havarti',
      })
      jest.spyOn(SoftwareList, 'get').mockImplementation(() => [
        firstSoftware,
        new Software({
          name,
          executable: {
            command: 'dairy',
          },
          args: 'cheese',
          installedRegex: 'Parmesan',
          url: 'https://cheesier.com',
          latestRegex: 'Parmigiano-Reggiano',
        }),
      ])
      await expect(SoftwareList.delete(name)).resolves.toStrictEqual([firstSoftware])
    })
  })
  describe('load', () => {
    const file = 'test-mock-file.json'
    beforeEach(() => {
      fs.pathExists = jest.fn().mockResolvedValue(true)
      jest.spyOn(SoftwareList, 'getSavedFilePath').mockImplementation(() => file)
    })
    it('throws error if save file does not contain valid json', async () => {
      fs.readFile = jest.fn().mockResolvedValue('i am not valid JSON')
      await expect(SoftwareList.load()).rejects.toThrow(
        `Cannot parse saved file "${file}" as JSON: Unexpected token i in JSON at position 0`
      )
    })
    it('throws error if save file does not contain JSON array', async () => {
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          name: 'i am not a json array',
          executable: {
            command: 'shells',
          },
          args: 'conch',
          installedRegex: 'queen',
          url: 'https://shells.com',
          latestRegex: 'lobatus gigas',
        })
      )
      await expect(SoftwareList.load()).rejects.toThrow(`Saved file "${file}" does not contain a valid JSON array`)
    })
    it('throws error if save file has software without a name', async () => {
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify([
          {
            executable: {
              command: 'name',
            },
            args: 'given',
            installedRegex: 'nemo',
            url: 'https://firstnames.com',
            latestRegex: 'forename',
          },
        ])
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry that does not have a name`
      )
    })
    it('throws error if save file has software without an executable', async () => {
      const name = 'no executable'
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify([
          {
            name,
            args: 'nada',
            installedRegex: 'niltch',
            url: 'https://nothing.com',
            latestRegex: 'nix',
          },
        ])
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry "${name}" that does not have an executable`
      )
    })
    it('throws error if save file has dynamic software without a directory', async () => {
      const name = 'dynamic no directory'
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify([
          {
            name,
            executable: {
              regex: 'candy',
            },
            args: 'nougat',
            installedRegex: 'snickers',
            url: 'https://candy.com',
            latestRegex: 'marathon',
          },
        ])
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry "${name}" that is dynamic but does not have an executable directory`
      )
    })
    it('throws error if save file has dynamic software without a regex', async () => {
      const name = 'dynamic no regex'
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify([
          {
            name,
            executable: {
              directory: 'tree',
            },
            args: 'deciduous',
            installedRegex: 'willow',
            url: 'https://trees.com',
            latestRegex: 'salix babylonica',
          },
        ])
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry "${name}" that is dynamic but does not have an executable regex`
      )
    })
    it('throws error if save file has software without an installed regex', async () => {
      const name = 'no installed regex'
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify([
          {
            name,
            executable: {
              command: 'colors',
            },
            args: 'white',
            url: 'https://paintbynumbers.com',
            latestRegex: 'eggshell',
          },
        ])
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry "${name}" that does not have an installedRegex`
      )
    })
    it('throws error if save file has software without a url', async () => {
      const name = 'no url'
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify([
          {
            name,
            executable: {
              command: 'pre',
            },
            args: 'internet',
            installedRegex: 'coding',
            latestRegex: 'how',
          },
        ])
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry "${name}" that does not have a url`
      )
    })
    it('throws error if save file has software without a latest regex', async () => {
      const name = 'no latest regex'
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify([
          {
            name,
            executable: {
              command: 'time',
            },
            args: 'after',
            installedRegex: 'late',
            url: 'https://latest.com',
          },
        ])
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry "${name}" that does not have a latestRegex`
      )
    })
    it('loads empty list if save file does not exist', async () => {
      fs.pathExists = jest.fn().mockResolvedValue(false)
      await expect(SoftwareList.load()).resolves.toStrictEqual([])
    })
    it('loads empty list if save file is empty', async () => {
      fs.readFile = jest.fn().mockResolvedValue('')
      await expect(SoftwareList.load()).resolves.toStrictEqual([])
    })
    it('loads software if software list is single valid entry', async () => {
      const software = new Software({
        name: 'valid single',
        executable: {
          command: 'boats',
        },
        args: 'small',
        installedRegex: 'tender',
        url: 'https://ahoy.com',
        latestRegex: 'dinghy',
      })
      fs.readFile = jest.fn().mockResolvedValue(JSON.stringify([software]))
      await expect(SoftwareList.load()).resolves.toStrictEqual([software])
    })
    it('loads software if software list is single valid entry without args', async () => {
      const software = new Software({
        name: 'valid single without args',
        executable: {
          command: 'handlebars',
        },
        installedRegex: 'no',
        url: 'https://flobots.com',
        latestRegex: 'fight with tools',
      })
      fs.readFile = jest.fn().mockResolvedValue(JSON.stringify([software]))
      await expect(SoftwareList.load()).resolves.toStrictEqual([software])
    })
    it('loads software if software list is single valid entry with shell override', async () => {
      const software = new Software({
        name: 'valid single with shell override',
        executable: {
          command: 'shell',
        },
        args: 'koopa',
        shellOverride: 'mariokart',
        installedRegex: 'leader',
        url: 'https://itsame.com',
        latestRegex: 'spiny shell',
      })
      fs.readFile = jest.fn().mockResolvedValue(JSON.stringify([software]))
      await expect(SoftwareList.load()).resolves.toStrictEqual([software])
    })
    it('loads software if software list is single valid entry without args and with shell override', async () => {
      const software = new Software({
        name: 'valid single without args and with shell override',
        executable: {
          command: 'attitudes',
        },
        shellOverride: 'force',
        installedRegex: 'unsparing',
        url: 'https:mywayorthehighway//.com',
        latestRegex: 'obey',
      })
      fs.readFile = jest.fn().mockResolvedValue(JSON.stringify([software]))
      await expect(SoftwareList.load()).resolves.toStrictEqual([software])
    })
    it('loads software if software list multiple valid entries', async () => {
      const firstSoftware = new Software({
        name: 'valid multiple first',
        executable: {
          command: 'hems',
        },
        args: 'stitches',
        installedRegex: 'catch',
        url: 'https://hemandhaw.com',
        latestRegex: 'herringbone',
      })
      const lastSoftware = new Software({
        name: 'valid multiple last',
        executable: {
          command: 'shanties',
        },
        args: 'heaving',
        installedRegex: 'pump',
        url: 'https://seamyshanty.com',
        latestRegex: 'south australia',
      })
      fs.readFile = jest.fn().mockResolvedValue(JSON.stringify([firstSoftware, lastSoftware]))
      await expect(SoftwareList.load()).resolves.toStrictEqual([firstSoftware, lastSoftware])
    })
    it('loads and alphabetizes software if software list multiple valid entries not in order', async () => {
      const firstSoftware = new Software({
        name: 'valid multiple out of order first',
        executable: {
          command: 'insects',
        },
        args: 'bee',
        installedRegex: 'honey',
        url: 'https://beelieve.com',
        latestRegex: 'apis',
      })
      const lastSoftware = new Software({
        name: 'valid multiple out of order last',
        executable: {
          command: 'endocrinology',
        },
        args: 'diseases',
        installedRegex: 'diabetes',
        url: 'https://automimmunes.com',
        latestRegex: 'diabetes mellitus',
      })
      fs.readFile = jest.fn().mockResolvedValue(JSON.stringify([lastSoftware, firstSoftware]))
      await expect(SoftwareList.load()).resolves.toStrictEqual([firstSoftware, lastSoftware])
    })
    it('loads and alphabetizes software ignoring capitalization if software list multiple valid entries of different capitalization', async () => {
      const firstSoftware = new Software({
        name: 'a valid multiple capitalization first',
        executable: {
          command: 'capitals',
        },
        args: 'smallest',
        installedRegex: 'South Georgia and the South Sandwich Islands (UK)',
        url: 'https://capitalizationmatters.com',
        latestRegex: 'King Edward Point',
      })
      const lastSoftware = new Software({
        name: 'B valid multiple capitalization last',
        executable: {
          command: 'location',
        },
        args: 'caput mundi',
        installedRegex: 'rome',
        url: 'https://capitaloftheworld.com',
        latestRegex: 'new york city',
      })
      fs.readFile = jest.fn().mockResolvedValue(JSON.stringify([lastSoftware, firstSoftware]))
      await expect(SoftwareList.load()).resolves.toStrictEqual([firstSoftware, lastSoftware])
    })
  })
})
