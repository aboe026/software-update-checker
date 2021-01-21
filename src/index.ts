import Prompts from './prompts'
;(async () => {
  await Prompts.home()
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
