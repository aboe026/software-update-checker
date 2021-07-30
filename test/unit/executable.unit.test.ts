import fs from 'fs-extra'
import path from 'path'

import { getDynamicExecutable, isStatic } from '../../src/executable'

jest.mock('fs-extra')

describe('Executable Unit Tests', () => {
  describe('isStatic', () => {
    it('object with command is static', () => {
      expect(
        isStatic({
          command: 'hello',
        })
      ).toBe(true)
    })
    it('object with directory and regex is dynamic', () => {
      expect(
        isStatic({
          directory: 'hello',
          regex: 'world',
        })
      ).toBe(false)
    })
    it('object with command, directory and regex is static', () => {
      expect(
        isStatic({
          command: 'ciao',
          directory: 'foo',
          regex: 'bar',
        })
      ).toBe(true)
    })
  })
  describe('getDynamicExecutable', () => {
    it('Nonexistent directory throws error', async () => {
      const directory = 'uruk'
      fs.pathExists = jest.fn().mockResolvedValue(false)
      await expect(
        getDynamicExecutable({
          directory,
          regex: 'v(.*)',
        })
      ).rejects.toThrow(`Directory specified "${directory}" does not exist. Please specify a valid path.`)
    })
    it('No directory matching regex throws error', async () => {
      const directory = 'hobbit'
      const regex = 'hole'
      fs.pathExists = jest.fn().mockResolvedValue(true)
      fs.readdir = jest.fn().mockResolvedValue(['hello', 'world'])
      await expect(
        getDynamicExecutable({
          directory,
          regex,
        })
      ).rejects.toThrow(`Could not find any file in directory "${directory}" matching regex pattern "${regex}"`)
    })
    it('Single match gets returned', async () => {
      const directory = 'dwarf'
      const matchingDir = 'cavern'
      fs.pathExists = jest.fn().mockResolvedValue(true)
      fs.readdir = jest.fn().mockResolvedValue([matchingDir, 'world'])
      await expect(
        getDynamicExecutable({
          directory,
          regex: 'cav.*',
        })
      ).resolves.toBe(path.join(directory, matchingDir))
    })
    it('Second match gets ignored', async () => {
      const directory = 'gondorian'
      const matchingDir = 'citadel'
      fs.pathExists = jest.fn().mockResolvedValue(true)
      fs.readdir = jest.fn().mockResolvedValue([matchingDir, `${matchingDir}2`])
      await expect(
        getDynamicExecutable({
          directory,
          regex: 'cit.*',
        })
      ).resolves.toBe(path.join(directory, matchingDir))
    })
    it('First file not matching regex gets ignored', async () => {
      const directory = 'haradrim '
      const matchingDir = 'mumakil'
      fs.pathExists = jest.fn().mockResolvedValue(true)
      fs.readdir = jest.fn().mockResolvedValue(['hello', matchingDir])
      await expect(
        getDynamicExecutable({
          directory,
          regex: 'mum.*',
        })
      ).resolves.toBe(path.join(directory, matchingDir))
    })
  })
})
