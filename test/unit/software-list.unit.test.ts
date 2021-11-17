import fs from 'fs-extra'

import Software from '../../src/software/software'
import SoftwareList from '../../src/software/software-list'
import Upgrader from '../../src/util/upgrader'
import * as allUpgrades from '../../src/software/upgrades/all-upgrades'

jest.mock('fs-extra')

describe('Software List Unit Tests', () => {
  beforeEach(() => {
    fs.ensureDir = jest.fn().mockResolvedValue(true)
    fs.writeFile = jest.fn().mockResolvedValue(true)
  })
  describe('sortByName', () => {
    it('returns empty array for empty array', () => {
      expect(SoftwareList.sortByName([])).toEqual([])
    })
    it('returns single software for single software array', () => {
      const software = new Software({
        name: 'sortByName single software',
        shell: 'elf',
        executable: {
          command: 'ruler',
        },
        args: 'lothlorien',
        installedRegex: 'Lady of Light',
        url: 'https://lovemeanddespair.com',
        latestRegex: 'Galadriel',
      })
      expect(SoftwareList.sortByName([software])).toEqual([software])
    })
    it('ignores case sensitivity', () => {
      const first = new Software({
        name: 'sortByName ignore case B',
        shell: 'geomorphology',
        executable: {
          command: 'butte',
        },
        args: 'black hills',
        installedRegex: 'bear lodge butte',
        url: 'https://closeencounters.com',
        latestRegex: 'devils tower',
      })
      const last = new Software({
        name: 'sortByName ignore case a',
        shell: 'sculpture',
        executable: {
          command: 'neoclassical',
        },
        args: 'copper',
        installedRegex: 'new york harbor',
        url: 'https://thenewcolossus.com',
        latestRegex: 'statue of liberty',
      })
      expect(SoftwareList.sortByName([first, last])).toEqual([last, first])
    })
    it('does not modify original array', () => {
      const first = new Software({
        name: 'sortByName does not modify original b first',
        shell: 'mammal',
        directory: 'ungulate',
        executable: {
          command: 'hooved',
        },
        args: 'american',
        installedRegex: 'heaviest',
        url: 'https://thunderontheplain.com',
        latestRegex: 'bison bison bison',
      })
      const last = new Software({
        name: 'sortByName does not modify original a last',
        shell: 'paranormal',
        directory: 'ocean',
        executable: {
          command: 'region',
        },
        args: 'atlantic',
        installedRegex: 'devils triangle',
        url: 'https://herebedragons.com',
        latestRegex: 'bermuda triangle',
      })
      const original = [first, last]
      expect(SoftwareList.sortByName(original)).toEqual([last, first])
      expect(original).toEqual([first, last])
    })
    it('preserves alphabetical order of multiple softwares', () => {
      const first = new Software({
        name: 'sortByName multiple alphabetical first',
        shell: 'construct',
        executable: {
          command: 'unsc',
        },
        args: 'ai',
        installedRegex: 'pillar of autumn',
        url: 'https://thiscaveisnotanaturalformation.com',
        latestRegex: 'cortana',
      })
      const middle = new Software({
        name: 'sortByName multiple alphabetical middle',
        shell: 'organic',
        executable: {
          command: 'vessel',
        },
        args: 'embryotic',
        installedRegex: 'zygote',
        url: 'https://whatcamefirst.com',
        latestRegex: 'egg',
      })
      const last = new Software({
        name: 'sortByName multiple alphabetical zlast',
        shell: 'stephen king',
        executable: {
          command: 'antagonist',
        },
        args: 'nurse',
        installedRegex: 'misery',
        url: 'https://imyournumberonefan.com',
        latestRegex: 'Annie Wilkes',
      })
      expect(SoftwareList.sortByName([first, middle, last])).toEqual([first, middle, last])
    })
    it('reverses anti-alphabetical order of multiple softwares', () => {
      const first = new Software({
        name: 'sortByName multiple anti-alphabetical c first',
        shell: 'space',
        executable: {
          command: 'rocket',
        },
        args: 'super-heavy',
        installedRegex: 'apollo',
        url: 'https://gobigorgohome.com',
        latestRegex: 'saturn v',
      })
      const middle = new Software({
        name: 'sortByName multiple anti-alphabetical b middle',
        shell: 'cinema',
        executable: {
          command: 'tycoon',
        },
        args: 'publishing',
        installedRegex: 'New York Daily Inquirer',
        url: 'https://rosebud.com',
        latestRegex: 'Charles Foster Kane',
      })
      const last = new Software({
        name: 'sortByName multiple anti-alphabetical a last',
        shell: 'video game',
        executable: {
          command: 'cowboy',
        },
        args: 'Van der Linde gang',
        installedRegex: 'tuberculosis',
        url: 'https://igaveyouallihad.com',
        latestRegex: 'arthur morgan',
      })
      expect(SoftwareList.sortByName([first, middle, last])).toEqual([last, middle, first])
    })
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
      await expect(SoftwareList.add(software)).resolves.toEqual([software])
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
      await expect(SoftwareList.add(software)).resolves.toEqual([software, existingSoftware])
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
      await expect(SoftwareList.add(software)).resolves.toEqual([existingSoftware, software])
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
        shell: 'planet',
        executable: {
          command: 'minor',
        },
        args: 'kuiper',
        installedRegex: 'pluto',
        url: 'https://coldshouldered.com',
        latestRegex: '134340',
      })
      await expect(SoftwareList.add(software)).resolves.toEqual([existingSoftwareOne, software, existingSoftwareTwo])
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
      await expect(SoftwareList.edit(oldSoftware, newSoftware)).resolves.toEqual([newSoftware])
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
      await expect(SoftwareList.edit(oldSoftware, newSoftware)).resolves.toEqual([existingSoftware, newSoftware])
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
      await expect(SoftwareList.edit(oldSoftware, newSoftware)).resolves.toEqual([existingSoftware, newSoftware])
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
      await expect(SoftwareList.delete(name)).resolves.toEqual([])
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
      await expect(SoftwareList.delete(name)).resolves.toEqual([lastSoftware])
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
      await expect(SoftwareList.delete(name)).resolves.toEqual([firstSoftware])
    })
  })
  describe('load', () => {
    const file = 'test-mock-file.json'
    beforeEach(() => {
      fs.pathExists = jest.fn().mockResolvedValue(true)
      jest.spyOn(SoftwareList, 'getSavedFilePath').mockImplementation(() => file)
    })
    it('loads empty list if save file does not exist', async () => {
      fs.pathExists = jest.fn().mockResolvedValue(false)
      await expect(SoftwareList.load()).resolves.toEqual([])
    })
    it('loads empty list if save file is empty', async () => {
      fs.readFile = jest.fn().mockResolvedValue('')
      await expect(SoftwareList.load()).resolves.toEqual([])
    })
    it('throws error if file contents cannot be read', async () => {
      const error = 'permission denied'
      fs.readFile = jest.fn().mockRejectedValue(error)
      await expect(SoftwareList.load()).rejects.toThrow(`Cannot read contents of file "${file}": "${error}"`)
    })
    it('throws error if save file does not contain valid json', async () => {
      fs.readFile = jest.fn().mockResolvedValue('i am not valid JSON')
      await expect(SoftwareList.load()).rejects.toThrow(
        `Cannot parse saved file "${file}" as JSON: Unexpected token i in JSON at position 0`
      )
    })
    it('throws error if save file does not contain json object', async () => {
      fs.readFile = jest.fn().mockResolvedValue(10)
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" JSON must be of type "object", received type "number"`
      )
    })
    it('throws error if save file does not contain softwares property', async () => {
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          hello: 'world',
        })
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" does not contain required "softwares" property`
      )
    })
    it('throws error if software property is not an array', async () => {
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: {
            name: 'i am not a json array',
            executable: {
              command: 'shells',
            },
            args: 'conch',
            installedRegex: 'queen',
            url: 'https://shells.com',
            latestRegex: 'lobatus gigas',
          },
        })
      )
      await expect(SoftwareList.load()).rejects.toThrow(`Saved file "${file}" property "softwares" is not an array`)
    })
    it('throws error if save file has software without a name', async () => {
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [
            {
              executable: {
                command: 'name',
              },
              args: 'given',
              installedRegex: 'nemo',
              url: 'https://firstnames.com',
              latestRegex: 'forename',
            },
          ],
        })
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry that does not have a name`
      )
    })
    it('throws error if save file has software without an executable', async () => {
      const name = 'no executable'
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [
            {
              name,
              args: 'nada',
              installedRegex: 'niltch',
              url: 'https://nothing.com',
              latestRegex: 'nix',
            },
          ],
        })
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry "${name}" that does not have an executable`
      )
    })
    it('throws error if save file has empty executable', async () => {
      const name = 'dynamic no regex'
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [
            {
              name,
              directory: 'tree',
              executable: {},
              args: 'deciduous',
              installedRegex: 'willow',
              url: 'https://trees.com',
              latestRegex: 'salix babylonica',
            },
          ],
        })
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry "${name}" whose executable is neither static nor dynamic`
      )
    })
    it('throws error if save file has software without an installed regex', async () => {
      const name = 'no installed regex'
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [
            {
              name,
              executable: {
                command: 'colors',
              },
              args: 'white',
              url: 'https://paintbynumbers.com',
              latestRegex: 'eggshell',
            },
          ],
        })
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry "${name}" that does not have an installedRegex`
      )
    })
    it('throws error if save file has software without a url', async () => {
      const name = 'no url'
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [
            {
              name,
              executable: {
                command: 'pre',
              },
              args: 'internet',
              installedRegex: 'coding',
              latestRegex: 'how',
            },
          ],
        })
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry "${name}" that does not have a url`
      )
    })
    it('throws error if save file has software without a latest regex', async () => {
      const name = 'no latest regex'
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [
            {
              name,
              executable: {
                command: 'relatively',
              },
              args: 'after',
              installedRegex: 'late',
              url: 'https://latest.com',
            },
          ],
        })
      )
      await expect(SoftwareList.load()).rejects.toThrow(
        `Saved file "${file}" contains an invalid software entry "${name}" that does not have a latestRegex`
      )
    })
    it('passes current version as zero if no version property', async () => {
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [],
        })
      )
      jest.spyOn(allUpgrades, 'default').mockReturnValue([])
      const upgraderSpy = jest.spyOn(Upgrader, 'run')
      await expect(SoftwareList.load()).resolves.toEqual([])
      expect(upgraderSpy.mock.calls).toEqual([
        [
          {
            objects: [],
            currentVersion: 0,
            upgrades: [],
          },
        ],
      ])
    })
    it('passes current version as version if explicit version property', async () => {
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          version: 1,
          softwares: [],
        })
      )
      const upgrades = [jest.fn().mockResolvedValue([]), jest.fn().mockResolvedValue([])]
      jest.spyOn(allUpgrades, 'default').mockReturnValue(upgrades)
      const upgraderSpy = jest.spyOn(Upgrader, 'run')
      await expect(SoftwareList.load()).resolves.toEqual([])
      expect(upgraderSpy.mock.calls).toEqual([
        [
          {
            objects: [],
            currentVersion: 1,
            upgrades,
          },
        ],
      ])
    })
    it('loads software if software list is single valid entry with all properties', async () => {
      const software = new Software({
        name: 'valid single with shell',
        shell: 'mariokart',
        executable: {
          command: 'shell',
        },
        args: 'koopa',
        installedRegex: 'leader',
        url: 'https://itsame.com',
        latestRegex: 'spiny shell',
      })
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [software],
        })
      )
      jest.spyOn(allUpgrades, 'default').mockReturnValue([])
      await expect(SoftwareList.load()).resolves.toEqual([software])
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
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [software],
        })
      )
      jest.spyOn(allUpgrades, 'default').mockReturnValue([])
      await expect(SoftwareList.load()).resolves.toEqual([software])
    })
    it('loads software if software list is single valid entry without shell', async () => {
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
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [software],
        })
      )
      jest.spyOn(allUpgrades, 'default').mockReturnValue([])
      await expect(SoftwareList.load()).resolves.toEqual([software])
    })
    it('loads software if software list is single valid entry without either args or shell', async () => {
      const software = new Software({
        name: 'valid single without args and with shell',
        shell: 'force',
        executable: {
          command: 'attitudes',
        },
        installedRegex: 'unsparing',
        url: 'https://mywayorthehighway.com',
        latestRegex: 'obey',
      })
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [software],
        })
      )
      jest.spyOn(allUpgrades, 'default').mockReturnValue([])
      await expect(SoftwareList.load()).resolves.toEqual([software])
    })
    it('loads software if software list is single valid dynamic executable without directory', async () => {
      const software = new Software({
        name: 'valid single dynamic without directory',
        shell: 'standard',
        executable: {
          regex: 'film',
        },
        installedRegex: '70mm',
        url: 'https://maximumimage.com',
        latestRegex: 'imax',
      })
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [software],
        })
      )
      jest.spyOn(allUpgrades, 'default').mockReturnValue([])
      await expect(SoftwareList.load()).resolves.toEqual([software])
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
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [firstSoftware, lastSoftware],
        })
      )
      jest.spyOn(allUpgrades, 'default').mockReturnValue([])
      await expect(SoftwareList.load()).resolves.toEqual([firstSoftware, lastSoftware])
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
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [lastSoftware, firstSoftware],
        })
      )
      jest.spyOn(allUpgrades, 'default').mockReturnValue([])
      await expect(SoftwareList.load()).resolves.toEqual([firstSoftware, lastSoftware])
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
      fs.readFile = jest.fn().mockResolvedValue(
        JSON.stringify({
          softwares: [lastSoftware, firstSoftware],
        })
      )
      jest.spyOn(allUpgrades, 'default').mockReturnValue([])
      await expect(SoftwareList.load()).resolves.toEqual([firstSoftware, lastSoftware])
    })
  })
})
