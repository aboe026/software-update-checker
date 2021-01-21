export default class Validators {
  static required(input: string): boolean {
    return input !== ''
  }
}
