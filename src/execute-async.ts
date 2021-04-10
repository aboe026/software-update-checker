import { exec, ExecOptions } from 'child_process'

export default async function (command: string, options?: ExecOptions): Promise<ExecuteResponse> {
  return new Promise((resolve, reject) => {
    exec(command, options || {}, (error, stdout, stderr) => {
      if (error) {
        if (stderr) {
          reject(stderr.trim())
        } else {
          reject(error)
        }
        reject(error)
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

interface ExecuteResponse {
  stdout: string
  stderr: string
}
