import open from 'open'
;(async () => {
  await open(process.argv[2], {
    wait: false,
  })
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
