import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import concat from 'concat-stream'
import os from 'os'

import E2eConfig from './e2e-config'
import env from './env'
import jestConfig from '../../../jest.config.e2e'

export default async function ({
  args = [],
  inputs = [],
  timeoutMs = jestConfig.testTimeout,
  minQuietPeriodMs = env.E2E_EXEC_MIN_QUIET_PERIOD,
  maxQuietPeriodMs = 1000,
  directory,
  file,
  verboseToFile = true,
  debugRecordAndReplyChunk,
}: {
  args?: string[]
  inputs?: (KEYS | string)[]
  timeoutMs?: number
  minQuietPeriodMs?: number
  maxQuietPeriodMs?: number
  directory?: string
  file?: string
  verboseToFile?: boolean
  debugRecordAndReplyChunk?: string
}): Promise<ExecutableResponse> {
  const workingDirectory = directory || E2eConfig.DIRECTORY.Executables
  let executable = file || getExecutableName()
  if (!executable.startsWith('./') && os.platform() !== 'win32') {
    executable = `./${executable}`
  }
  if (verboseToFile) {
    await E2eConfig.appendToDebugLog(`Directory: ${directory}`)
    await E2eConfig.appendToDebugLog(`File: ${executable}`)
    await E2eConfig.appendToDebugLog(`Arguments: ${JSON.stringify(args, null, 2)}`)
    await E2eConfig.appendToDebugLog(`Inputs: ${JSON.stringify(inputs, null, 2)}`)
    await E2eConfig.appendToDebugLog('Output:')
  }
  const chunks: string[] = []
  let inputIndex = 0

  let proc: ChildProcessWithoutNullStreams | undefined = undefined
  if (!debugRecordAndReplyChunk) {
    proc = spawn(executable, args, {
      stdio: [null, null, null],
      cwd: workingDirectory,
    })
    proc.stdin.setDefaultEncoding('utf-8')
  }

  let minQuietTimer: NodeJS.Timeout
  let maxQuietTimer: NodeJS.Timeout
  let timeoutTimer: NodeJS.Timeout

  if (proc) {
    timeoutTimer = setTimeout(() => {
      if (proc?.stdin) {
        proc.stdin.end()
        throw Error(`Process exceeded timeout of '${timeoutMs}' milliseconds.`)
      }
    }, timeoutMs)
  }

  if (proc) {
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
  }

  if (debugRecordAndReplyChunk) {
    recordAndReply(`"${debugRecordAndReplyChunk}"`, '')
    console.log(`chunks: "${JSON.stringify(chunks, null, 2)}"`)
  }

  function printOutDebug(key: string, value: string | boolean | number) {
    if (debugRecordAndReplyChunk) {
      console.log(`${key}: "${value}"`)
    }
  }

  function recordAndReply(chunk: string, prefix: string) {
    if (verboseToFile) {
      E2eConfig.appendToDebugLog(`${prefix}: ${JSON.stringify(chunk.toString())}`) // for some reason if this is awaited, chunks get read in incorrect order (stdout vs stderr)
    }
    const line = escapeChunk(chunk.toString(), !debugRecordAndReplyChunk)
    printOutDebug('line', line)
    if (line !== '' && line !== '\n') {
      const nlCommandTypes = line.split(/(Command types:\\n)|(\\nCommand types:)/) // sometimes the "Command types:" does not get output to its own line
      printOutDebug('nlCommandTypes', JSON.stringify(nlCommandTypes, null, 2))
      for (let i = 0; i < nlCommandTypes.length; i++) {
        const nlCommandType = nlCommandTypes[i]
        printOutDebug('nlCommandType', nlCommandType)
        if (nlCommandType) {
          const nlPeriods = nlCommandType.split(/\.\\n(?=[^a-z])/) // sometimes multiple string outputs get added to same line. Don't split if next character on newline is lowercase letter (most likely an accidental newline)
          printOutDebug('nlPeriods', JSON.stringify(nlPeriods, null, 2))
          for (let j = 0; j < nlPeriods.length; j++) {
            let nlPeriod = nlPeriods[j]
            printOutDebug('nlPeriod', nlPeriod)
            if (nlPeriods.length > 1 && !nlPeriod.endsWith('.') && !nlPeriod.startsWith('?')) {
              printOutDebug('adding period to nlPeriod', true)
              nlPeriod += '.'
            }
            let k: number = j + 1
            let nonDigitMet = false // sometimes digits split across mulitple lines when they should not be
            while (k < nlPeriods.length && !nonDigitMet) {
              printOutDebug('k', k)
              printOutDebug('nlPeriods[j]', nlPeriods[k])
              if (new RegExp(/\d+/).test(nlPeriods[k])) {
                printOutDebug('new RegExp(/\\d+/).test(nlPeriods[j])', true)
                nlPeriod += `${nlPeriod.endsWith('.') ? '' : '.'}${nlPeriods[k]}`
                j++
              } else {
                printOutDebug('nonDigitMet', true)
                nonDigitMet = true
              }
              k++
            }
            const nlColons = nlPeriod.split(/(?<!\)):\\n/) // sometimes multiple string outputs get added to same line (ignore "):\n", as that can occur right after an example)
            printOutDebug('nlColons', JSON.stringify(nlColons, null, 2))
            for (let nlColon of nlColons) {
              printOutDebug('nlColon', nlColon)
              if (nlColon) {
                if (nlColons.length > 1 && !(nlColon.endsWith(':') || nlColon.endsWith('.') || nlColon.endsWith(']'))) {
                  printOutDebug('adding colon to nlColon', true)
                  nlColon += ':'
                }
                const questionChunks = nlColon.split(/(?<!^)(\? (?!\(|Yes|No))/) // sometimes multiple lines come in a single chunk. Split on those (but not boolean questions or choices)
                printOutDebug('questionChunks', JSON.stringify(questionChunks, null, 2))
                chunks.push(escapeChunk(questionChunks[0]))
                if (questionChunks.length > 1) {
                  for (let m = 2; m < questionChunks.length; m = m + 2) {
                    chunks.push(escapeChunk(`${questionChunks[m - 1]}${questionChunks[m]}`))
                  }
                }
                if (proc) {
                  if (inputIndex < inputs.length) {
                    delayReply(inputs[inputIndex])
                  } else {
                    setTimeout(() => {
                      proc?.stdin?.end()
                    }, maxQuietPeriodMs)
                  }
                }
              }
            }
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
    if (proc) {
      proc.stdout.pipe(
        concat(async (result: Buffer) => {
          if (verboseToFile) {
            await E2eConfig.appendToDebugLog(`Chunks: ${JSON.stringify(chunks, null, 2)}`)
          }
          resolve({
            stdout: result.toString(),
            chunks: chunks.filter((chunk) => chunk !== ''),
          })
        })
      )
    }
  })
}

export function getExecutableName(): string {
  let name = 'software-update-checker-'
  if (os.platform() === 'win32') {
    name = `${name}win.exe`
  } else if (os.platform() === 'darwin') {
    name = `${name}macos`
  } else {
    name = `${name}linux`
  }
  return name
}

function escapeChunk(chunk: string, stringify = true): string {
  let escapedChunk = `${stripAnsiChars(stringify ? JSON.stringify(chunk) : chunk)}`
  escapedChunk = escapedChunk.substring(1, escapedChunk.length - 1) // remove enclosing double quotes from stringify
  escapedChunk = escapedChunk.replace(/\\n\\n/g, '\\n \\n') // separate out consecutive newlines so subsequent newline removal does not effect them
  escapedChunk = escapedChunk.replace(/([a-zA-Z])\\n([a-zA-Z])/, '$1$2') // remove newlines that are next to letters
  escapedChunk = escapedChunk.replace(/\\n \\n/g, '\\n\\n') // re-join consecutive newlines to undo separation from above
  escapedChunk = escapedChunk.replace(/\\+n$/, '') // if ends in newline, remove newline
  escapedChunk = escapedChunk.replace(/❯/g, '>') // some shells print out strange symbol, convert it to standard
  escapedChunk = escapedChunk.replace(/\\+"/g, '"') // remove escape chars in front of double quotes
  return escapedChunk.trimEnd()
}

function stripAnsiChars(words: string): string {
  let strippedWords = words.replace(/[\\u001b\[39m]?\ \\u001b\[31m/g, ` ${ANSI_CHAR_REPLACEMENT.Red}`) // replace leading indicator for red to pick up in tests
  strippedWords = strippedWords.replace(/[\\u001b\[39m]?\ \\u001b\[32m/g, ` ${ANSI_CHAR_REPLACEMENT.Green}`) // replace leading indicator for greed to pick up in tests
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
