const args = process.argv
if (args.length > 2) {
  args.shift()
  args.shift()
}
for (const line of args.join(' ').split(/\r\n?|\n|\\r\\n?|\\n/)) {
  console.log(line)
}
