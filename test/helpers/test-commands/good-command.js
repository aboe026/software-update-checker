const args = process.argv
if (args.length > 2) {
  args.shift()
  args.shift()
}
for (const line of args.join(' ').split(/\\n/)) {
  console.log(line)
}
