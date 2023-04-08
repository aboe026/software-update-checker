import 'dotenv/config'
import { cleanEnv, num, str } from 'envalid'

export default cleanEnv(process.env, {
  E2E_EXEC_MIN_QUIET_PERIOD: num({
    desc: 'The minimum amount of time (in milliseconds) that the E2E interactive execution should wait before sending prompt responses',
    default: 250,
  }),
  E2E_LOCAL_IP_ADDRESS: str({
    desc: 'The IP address of the machine running the E2E tests',
    default: '127.0.0.1',
    example: '::1',
  }),
})
