import concat from 'concat-stream'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

export default function ({
  inputs,
  timeoutMs = 12000,
  minQuietPeriodMs = 200,
  maxQuietPeriodMs = 1000,
}: {
  inputs: (KEYS | string)[]
  timeoutMs?: number
  minQuietPeriodMs?: number
  maxQuietPeriodMs?: number
}): Promise<ExecutableResponse> {
  const chunks: string[] = []
  let inputIndex = 0

  const proc = spawn(getExecutableName(), [], {
    stdio: [null, null, null],
    cwd: path.join(__dirname, '../../../dist'),
  })
  proc.stdin.setDefaultEncoding('utf-8')

  let minQuietTimer: NodeJS.Timeout
  let maxQuietTimer: NodeJS.Timeout
  const timeoutTimer: NodeJS.Timeout = setTimeout(() => {
    proc.stdin.end()
  }, timeoutMs)

  proc.stdout.on('data', (chunk: Buffer) => {
    recordAndReply(chunk.toString())
  })
  proc.stderr.on('data', (chunk: Buffer) => {
    recordAndReply(chunk.toString())
  })
  proc.stdout.on('close', () => {
    cleanUp()
  })
  proc.stderr.on('close', () => {
    cleanUp()
  })

  function recordAndReply(chunk: string): void {
    const line = escapeChunk(chunk.toString())
    if (line !== '' && line !== '\n') {
      const lineChunks = line.split(/(?<!^)(\? [^\(YN])/) // sometimes multiple lines come in a single chunk. Split on those (but not boolean questions or choices)
      if (lineChunks.length === 1) {
        chunks.push(escapeChunk(lineChunks[0]))
      } else {
        for (let i = 2; i < lineChunks.length; i = i + 2) {
          chunks.push(escapeChunk(`${lineChunks[i - 1]}${lineChunks[i]}`))
        }
      }
      if (inputIndex < inputs.length) {
        delayReply(inputs[inputIndex])
      } else {
        setTimeout(() => {
          proc.stdin.end()
        }, maxQuietPeriodMs)
      }
    }
  }

  function delayReply(input: string) {
    clearTimeouts()
    minQuietTimer = setTimeout(() => {
      inputIndex++
      maxQuietTimer = setTimeout(() => {
        delayReply(inputs[inputIndex])
      }, maxQuietPeriodMs)
      proc?.stdin?.write(input)
    }, minQuietPeriodMs)
  }

  function clearTimeouts() {
    clearTimeout(minQuietTimer)
    clearTimeout(maxQuietTimer)
  }

  function cleanUp() {
    clearTimeouts()
    clearTimeout(timeoutTimer)
  }

  return new Promise(function (resolve) {
    proc.stdout.pipe(
      concat((result: Buffer) => {
        resolve({
          stdout: result.toString(),
          chunks,
        })
      })
    )
  })
}

function getExecutableName() {
  let name = 'software-update-checker-'
  if (os.platform() === 'win32') {
    name += 'win.exe'
  } else if (os.platform() === 'darwin') {
    name += 'macos'
  } else {
    name += 'linux'
  }
  return name
}

function escapeChunk(chunk: string): string {
  let escapedChunk = `${stripAnsiChars(JSON.stringify(chunk))}`
  escapedChunk = escapedChunk.substring(1, escapedChunk.length - 1) // remove enclosing double quotes from stringify
  escapedChunk = escapedChunk.replace(/\\+n$/, '') // if ends in newline, remove newline
  return escapedChunk
}

function stripAnsiChars(words: string): string {
  let strippedWords = words.replace(/\\u001b\[39m\ \\u001b\[31m/g, ` ${ANSI_CHAR_REPLACEMENT.Red}`) // replace leading indicator for red to pick up in tests
  strippedWords = strippedWords.replace(/\\u001b\[39m\ \\u001b\[32m/g, ` ${ANSI_CHAR_REPLACEMENT.Green}`) // replace leading indicator for greed to pick up in tests
  strippedWords = strippedWords.replace(/\\u001b\[\d?\d?\d?\w/g, '') // remove ansi chars
  return strippedWords
}

interface ExecutableResponse {
  stdout: string
  chunks: string[]
}

// https://tldp.org/LDP/abs/html/escapingsection.html
export enum KEYS {
  Up = '\x1B\x5B\x41',
  Down = '\x1B\x5B\x42',
  Enter = '\x0D',
  Space = '\x20',
  BACK_SPACE = '\x7f',
}

export enum ANSI_CHAR_REPLACEMENT {
  Red = '<red>',
  Green = '<green>',
}
