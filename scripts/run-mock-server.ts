import Website from '../test/helpers/website'
;(async () => {
  console.log('starting mock server...')
  await Website.start()
  console.log(`...mock server listening on port ${Website.getPort()}`)
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
