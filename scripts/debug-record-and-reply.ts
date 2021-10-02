import interactiveExecute from '../test/e2e/helpers/interactive-execute'
;(async () => {
  await interactiveExecute({
    debugRecordAndReplyChunk: process.argv[2],
  })
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
