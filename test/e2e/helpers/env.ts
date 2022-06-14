import 'dotenv/config'
import { cleanEnv, num } from 'envalid'

export default cleanEnv(process.env, {
  E2E_EXEC_MIN_QUIET_PERIOD: num({
    desc: 'The minimum amount of time (in milliseconds) that the E2E interactive execution should wait before sending prompt responses',
    default: 250,
  }),
})
