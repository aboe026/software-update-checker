import Base from '../base/base'
import { number } from '../../../build.json'
import { version } from '../../../package.json'

export default class Version extends Base {
  static getVersion(): string {
    return `${version}+${number}`
  }
}
