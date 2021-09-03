import upgrade1 from './upgrade-1'

export default (): ((objects: any[]) => Promise<any[]>)[] => {
  return [upgrade1]
}
