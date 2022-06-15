import 'dotenv/config'
import { cleanEnv, str } from 'envalid'

export default cleanEnv(process.env, {
  GITHUB_PERSONAL_ACCESS_TOKEN: str({
    desc: 'The Personal Access Token to authenticate with GitHub',
  }),
  ASSETS_DIRECTORY: str({
    desc: 'The directory containing software-update-checker binaries to upload to the release',
  }),
})
