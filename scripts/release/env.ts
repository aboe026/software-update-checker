import 'dotenv/config'
import { cleanEnv, str } from 'envalid'

export default cleanEnv(process.env, {
  GITHUB_PERSONAL_ACCESS_TOKEN: str(),
  ASSETS_DIRECTORY: str(),
})
