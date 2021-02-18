import colors from 'colors'
import Prompts from './prompts'

Prompts.home().catch((err) => {
  console.error(colors.red(err))
  process.exit(1)
})
