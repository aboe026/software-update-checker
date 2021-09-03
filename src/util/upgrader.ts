export default class Upgrader {
  static async run({
    objects,
    upgrades,
    currentVersion,
  }: {
    objects: any[]
    upgrades: ((objects: any[]) => Promise<any[]>)[]
    currentVersion: number
  }): Promise<any[]> {
    if (currentVersion > upgrades.length) {
      throw Error(`Invalid start of upgrades "${currentVersion}", only "${upgrades.length}" upgrades available.`)
    }
    let upgradedObjects = JSON.parse(JSON.stringify(objects)) // so as not to modify original object (aka "clone")
    for (let i = currentVersion; i < upgrades.length; i++) {
      try {
        upgradedObjects = await upgrades[i](upgradedObjects)
      } catch (err: any) {
        throw Error(`Upgrade "${i + 1}" failed with error "${err.message || err}"`)
      }
    }
    return upgradedObjects
  }
}
