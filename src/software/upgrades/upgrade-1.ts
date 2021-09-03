// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function (softwares: any[]): Promise<any[]> {
  for (const software of softwares) {
    if ('shellOverride' in software) {
      software.shell = software.shellOverride
      delete software.shellOverride
    }
  }
  return softwares
}
