export default class BasePrompts {
  static capitalizeFirstLetters(words?: string): string {
    if (words) {
      words = words
        .split(' ')
        .map((word) => {
          if (word && word.length > 0) {
            word = `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`
          }
          return word
        })
        .join(' ')
    }
    return words || ''
  }
}
