import Upgrader from '../../src/util/upgrader'

describe('Upgrader Unit Tests', () => {
  describe('run', () => {
    describe('invalid', () => {
      it('throws error if start greater than upgrades length', async () => {
        await expect(
          Upgrader.run({
            objects: [],
            currentVersion: 1,
            upgrades: [],
          })
        ).rejects.toThrow(`Invalid start of upgrades "1", only "0" upgrades available.`)
      })
      it('throws error if error in single upgrade', async () => {
        const error = 'mea culpa'
        await expect(
          Upgrader.run({
            objects: [],
            currentVersion: 0,
            upgrades: [
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              async (): Promise<any[]> => {
                throw Error(error)
              },
            ],
          })
        ).rejects.toThrow(`Upgrade "1" failed with error "${error}"`)
      })
      it('throws error if non-error thrown', async () => {
        const error = 'darn it'
        await expect(
          Upgrader.run({
            objects: [],
            currentVersion: 0,
            upgrades: [
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              async (): Promise<any[]> => {
                throw error
              },
            ],
          })
        ).rejects.toThrow(`Upgrade "1" failed with error "${error}"`)
      })
      it('throws error if first error in multiple upgrade', async () => {
        const error = 'that one is on me'
        const first = jest.fn().mockRejectedValue(error)
        const middle = jest.fn().mockResolvedValue([])
        const last = jest.fn().mockResolvedValue([])
        await expect(
          Upgrader.run({
            objects: [],
            currentVersion: 0,
            upgrades: [first, middle, last],
          })
        ).rejects.toThrow(`Upgrade "1" failed with error "${error}"`)
        expect(first).toHaveBeenCalledTimes(1)
        expect(middle).toHaveBeenCalledTimes(0)
        expect(last).toHaveBeenCalledTimes(0)
      })
      it('throws error if middle error in multiple upgrade', async () => {
        const error = 'that one is on me'
        const first = jest.fn().mockResolvedValue([])
        const middle = jest.fn().mockRejectedValue(error)
        const last = jest.fn().mockResolvedValue([])
        await expect(
          Upgrader.run({
            objects: [],
            currentVersion: 0,
            upgrades: [first, middle, last],
          })
        ).rejects.toThrow(`Upgrade "2" failed with error "${error}"`)
        expect(first).toHaveBeenCalledTimes(1)
        expect(middle).toHaveBeenCalledTimes(1)
        expect(last).toHaveBeenCalledTimes(0)
      })
      it('throws error if last error in multiple upgrade', async () => {
        const error = 'that one is on me'
        const first = jest.fn().mockResolvedValue([])
        const middle = jest.fn().mockResolvedValue([])
        const last = jest.fn().mockRejectedValue(error)
        await expect(
          Upgrader.run({
            objects: [],
            currentVersion: 0,
            upgrades: [first, middle, last],
          })
        ).rejects.toThrow(`Upgrade "3" failed with error "${error}"`)
        expect(first).toHaveBeenCalledTimes(1)
        expect(middle).toHaveBeenCalledTimes(1)
        expect(last).toHaveBeenCalledTimes(1)
      })
    })
    describe('valid', () => {
      it('does not modify original objects', async () => {
        const objects = [
          {
            foo: 'bar',
          },
        ]
        await expect(
          Upgrader.run({
            objects,
            currentVersion: 0,
            upgrades: [
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              async (objects: any[]): Promise<any[]> => {
                for (const object of objects) {
                  object.foo = 'bizz'
                }
                return objects
              },
            ],
          })
        ).resolves.toEqual([
          {
            foo: 'bizz',
          },
        ])
        expect(objects).toEqual([
          {
            foo: 'bar',
          },
        ])
      })
      it('runs all of multiple upgrades and starting from 0', async () => {
        const objects = [
          {
            hello: 'world',
          },
          {
            hello: 'friendo',
          },
        ]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const first = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            object.key = 'lock'
          }
          return objects
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const middle = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            object.salt = 'pepper'
          }
          return objects
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const last = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            if (object.hello === 'world') {
              object.hello = 'earth'
            }
          }
          return objects
        })
        await expect(
          Upgrader.run({
            objects,
            currentVersion: 0,
            upgrades: [first, middle, last],
          })
        ).resolves.toEqual([
          {
            hello: 'earth',
            key: 'lock',
            salt: 'pepper',
          },
          {
            hello: 'friendo',
            key: 'lock',
            salt: 'pepper',
          },
        ])
        expect(objects).toEqual([
          {
            hello: 'world',
          },
          {
            hello: 'friendo',
          },
        ])
        expect(first).toHaveBeenCalledTimes(1)
        expect(middle).toHaveBeenCalledTimes(1)
        expect(last).toHaveBeenCalledTimes(1)
      })
      it('ignores first of multiple upgrades and starting from 1', async () => {
        const objects = [
          {
            hello: 'world',
          },
          {
            hello: 'friendo',
          },
        ]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const first = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            object.key = 'lock'
          }
          return objects
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const middle = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            object.salt = 'pepper'
          }
          return objects
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const last = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            if (object.hello === 'world') {
              object.hello = 'earth'
            }
          }
          return objects
        })
        await expect(
          Upgrader.run({
            objects,
            currentVersion: 1,
            upgrades: [first, middle, last],
          })
        ).resolves.toEqual([
          {
            hello: 'earth',
            salt: 'pepper',
          },
          {
            hello: 'friendo',
            salt: 'pepper',
          },
        ])
        expect(objects).toEqual([
          {
            hello: 'world',
          },
          {
            hello: 'friendo',
          },
        ])
        expect(first).toHaveBeenCalledTimes(0)
        expect(middle).toHaveBeenCalledTimes(1)
        expect(last).toHaveBeenCalledTimes(1)
      })
      it('ignores first and second of multiple upgrades and starting from 2', async () => {
        const objects = [
          {
            hello: 'world',
          },
          {
            hello: 'friendo',
          },
        ]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const first = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            object.key = 'lock'
          }
          return objects
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const middle = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            object.salt = 'pepper'
          }
          return objects
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const last = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            if (object.hello === 'world') {
              object.hello = 'earth'
            }
          }
          return objects
        })
        await expect(
          Upgrader.run({
            objects,
            currentVersion: 2,
            upgrades: [first, middle, last],
          })
        ).resolves.toEqual([
          {
            hello: 'earth',
          },
          {
            hello: 'friendo',
          },
        ])
        expect(objects).toEqual([
          {
            hello: 'world',
          },
          {
            hello: 'friendo',
          },
        ])
        expect(first).toHaveBeenCalledTimes(0)
        expect(middle).toHaveBeenCalledTimes(0)
        expect(last).toHaveBeenCalledTimes(1)
      })
      it('ignores all of multiple upgrades and starting from end', async () => {
        const objects = [
          {
            hello: 'world',
          },
          {
            hello: 'friendo',
          },
        ]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const first = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            object.key = 'lock'
          }
          return objects
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const middle = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            object.salt = 'pepper'
          }
          return objects
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const last = jest.fn().mockImplementation(async (objects: any[]): Promise<any[]> => {
          for (const object of objects) {
            if (object.hello === 'world') {
              object.hello = 'earth'
            }
          }
          return objects
        })
        await expect(
          Upgrader.run({
            objects,
            currentVersion: 3,
            upgrades: [first, middle, last],
          })
        ).resolves.toEqual([
          {
            hello: 'world',
          },
          {
            hello: 'friendo',
          },
        ])
        expect(objects).toEqual([
          {
            hello: 'world',
          },
          {
            hello: 'friendo',
          },
        ])
        expect(first).toHaveBeenCalledTimes(0)
        expect(middle).toHaveBeenCalledTimes(0)
        expect(last).toHaveBeenCalledTimes(0)
      })
    })
  })
})
