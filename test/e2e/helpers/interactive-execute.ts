import concat from 'concat-stream'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

import E2eConfig from './e2e-config'

export default async function ({
  args = [],
  inputs = [],
  timeoutMs = 12000,
  minQuietPeriodMs = 200,
  maxQuietPeriodMs = 1000,
}: {
  args?: string[]
  inputs?: (KEYS | string)[]
  timeoutMs?: number
  minQuietPeriodMs?: number
  maxQuietPeriodMs?: number
}): Promise<ExecutableResponse> {
  await E2eConfig.appendToDebugLog(`Arguments: ${JSON.stringify(args, null, 2)}`)
  await E2eConfig.appendToDebugLog(`Inputs: ${JSON.stringify(inputs, null, 2)}`)
  await E2eConfig.appendToDebugLog('Output:')
  const chunks: string[] = []
  let inputIndex = 0

  const proc = spawn(getExecutableName(), args, {
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
    recordAndReply(chunk.toString(), 'stdout')
  })
  proc.stderr.on('data', (chunk: Buffer) => {
    recordAndReply(chunk.toString(), 'stderr')
  })
  proc.stdout.on('close', () => {
    cleanUp()
  })
  proc.stderr.on('close', () => {
    cleanUp()
  })

  function recordAndReply(chunk: string, prefix: string) {
    E2eConfig.appendToDebugLog(`${prefix}: ${JSON.stringify(chunk.toString())}`) // for some reason if this is awaited, chunks get read in incorrect order (stdout vs stderr)
    const line = escapeChunk(chunk.toString())
    if (line !== '' && line !== '\n') {
      const newlinePeriods = line.split(/\.\\n/) // sometimes multiple string outputs get added to same line
      for (let i = 0; i < newlinePeriods.length; i++) {
        let newlinePeriod = newlinePeriods[i]
        if (newlinePeriods.length > 1 && !newlinePeriod.endsWith('.')) {
          newlinePeriod += '.'
        }
        let j = i + 1
        let nonDigitMet = false // sometimes digits split across mulitple lines when they should not be
        while (j < newlinePeriods.length && !nonDigitMet) {
          if (new RegExp(/\d+/).test(newlinePeriods[j])) {
            newlinePeriod += `${newlinePeriod.endsWith('.') ? '' : '.'}${newlinePeriods[j]}`
            i++
          } else {
            nonDigitMet = true
          }
          j++
        }
        const newlineColons = newlinePeriod.split(/:\\n/) // sometimes multiple string outputs get added to same line
        for (let newlineColon of newlineColons) {
          if (
            newlineColons.length > 1 &&
            !(newlineColon.endsWith(':') || newlineColon.endsWith('.') || newlineColon.endsWith(']'))
          ) {
            newlineColon += ':'
          }
          const questionChunks = newlineColon.split(/(?<!^)(\? (?!\(|Yes|No))/) // sometimes multiple lines come in a single chunk. Split on those (but not boolean questions or choices)
          chunks.push(escapeChunk(questionChunks[0]))
          if (questionChunks.length > 1) {
            for (let i = 2; i < questionChunks.length; i = i + 2) {
              chunks.push(escapeChunk(`${questionChunks[i - 1]}${questionChunks[i]}`))
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
      concat(async (result: Buffer) => {
        await E2eConfig.appendToDebugLog(`Chunks: ${JSON.stringify(chunks, null, 2)}`)
        resolve({
          stdout: result.toString(),
          chunks: chunks.filter((chunk) => chunk !== ''),
        })
      })
    )
  })
}

export function getExecutableName(): string {
  let name = 'software-update-checker-'
  if (os.platform() === 'win32') {
    name = `${name}win.exe`
  } else if (os.platform() === 'darwin') {
    name = `./${name}macos`
  } else {
    name = `./${name}linux`
  }
  return name
}

function escapeChunk(chunk: string): string {
  let escapedChunk = `${stripAnsiChars(JSON.stringify(chunk))}`
  escapedChunk = escapedChunk.substring(1, escapedChunk.length - 1) // remove enclosing double quotes from stringify
  escapedChunk = escapedChunk.replace(/\\+n$/, '') // if ends in newline, remove newline
  escapedChunk = escapedChunk.replace(/❯/g, '>') // some shells print out strange symbol, convert it to standard
  escapedChunk = escapedChunk.replace(/\\+"/g, '"') // remove escape chars in front of double quotes
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
