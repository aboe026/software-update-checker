const args = process.argv
if (args.length > 2) {
  args.shift()
  args.shift()
}

console.error(args.join(' '))
process.exit(1)
