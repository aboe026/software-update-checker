import upgrade1 from './upgrade-1'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (): ((objects: any[]) => Promise<any[]>)[] => {
  return [upgrade1]
}
