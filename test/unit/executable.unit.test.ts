import fs from 'fs-extra'

import { getDynamicExecutable, isStatic } from '../../src/software/executable'

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
    it('object with regex is dynamic', () => {
      expect(
        isStatic({
          regex: 'world',
        })
      ).toBe(false)
    })
    it('object with command and regex is static', () => {
      expect(
        isStatic({
          command: 'ciao',
          regex: 'bella',
        })
      ).toBe(true)
    })
  })
  describe('getDynamicExecutable', () => {
    describe('directory specified', () => {
      it('nonexistent explicit directory throws error', async () => {
        const directory = 'uruk'
        fs.pathExists = jest.fn().mockResolvedValue(false)
        await expect(
          getDynamicExecutable({
            directory,
            regex: 'hai',
          })
        ).rejects.toThrow(`Directory specified "${directory}" does not exist. Please specify a valid path.`)
      })
      it('no file matching explicit directory throws error', async () => {
        const directory = 'hobbit'
        const regex = 'hole'
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue(['dwarf', 'cave'])
        await expect(
          getDynamicExecutable({
            directory,
            regex,
          })
        ).rejects.toThrow(`Could not find any file in directory "${directory}" matching regex pattern "${regex}"`)
      })
      it('match from single with explicit directory gets returned', async () => {
        const file = 'tower'
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue([file])
        await expect(
          getDynamicExecutable({
            directory: 'wizard',
            regex: 'tow.*',
          })
        ).resolves.toBe(file)
      })
      it('match first of many with explicit directory gets returned', async () => {
        const file = 'tonic'
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue([file, 'rum', 'coke'])
        await expect(
          getDynamicExecutable({
            directory: 'gin',
            regex: 'to.*',
          })
        ).resolves.toBe(file)
      })
      it('match middle of many with explicit directory gets returned', async () => {
        const file = 'peanut'
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue(['butter', file, 'jelly'])
        await expect(
          getDynamicExecutable({
            directory: 'sandwhich',
            regex: 'pea.*',
          })
        ).resolves.toBe(file)
      })
      it('match last of many with explicit directory gets returned', async () => {
        const file = 'halloween'
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue(['thanksgiving', 'newyears', file])
        await expect(
          getDynamicExecutable({
            directory: 'independence',
            regex: 'hal.*',
          })
        ).resolves.toBe(file)
      })
      it('subsequent match gets ignored with explicit directory', async () => {
        const file = 'chain'
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue([file, `${file}2`])
        await expect(
          getDynamicExecutable({
            directory: 'ball',
            regex: 'ch.*',
          })
        ).resolves.toBe(file)
      })
    })
    describe('no directory', () => {
      it('nonexistent implicit directory throws error', async () => {
        const directory = 'tick'
        jest.spyOn(process, 'cwd').mockReturnValue(directory)
        fs.pathExists = jest.fn().mockResolvedValue(false)
        await expect(
          getDynamicExecutable({
            regex: 'tock',
          })
        ).rejects.toThrow(`Directory specified "${directory}" does not exist. Please specify a valid path.`)
      })
      it('no file matching implicit directory throws error', async () => {
        const directory = 'walk'
        const regex = 'the.*'
        jest.spyOn(process, 'cwd').mockReturnValue(directory)
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue(['plank'])
        const filesSpy = jest.spyOn(fs, 'readdir')
        await expect(
          getDynamicExecutable({
            directory,
            regex,
          })
        ).rejects.toThrow(`Could not find any file in directory "${directory}" matching regex pattern "${regex}"`)
        expect(filesSpy).toHaveBeenCalledWith(directory)
      })
      it('match from single with implicit directory gets returned', async () => {
        const directory = 'yo'
        const file = 'ho'
        jest.spyOn(process, 'cwd').mockReturnValue(directory)
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue([file])
        const filesSpy = jest.spyOn(fs, 'readdir')
        await expect(
          getDynamicExecutable({
            regex: 'h.*',
          })
        ).resolves.toBe(file)
        expect(filesSpy).toHaveBeenCalledWith(directory)
      })
      it('match first of many with implicit directory gets returned', async () => {
        const directory = 'shiver'
        const file = 'me'
        jest.spyOn(process, 'cwd').mockReturnValue(directory)
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue([file, 'timbers', 'matey'])
        const filesSpy = jest.spyOn(fs, 'readdir')
        await expect(
          getDynamicExecutable({
            regex: 'm.*',
          })
        ).resolves.toBe(file)
        expect(filesSpy).toHaveBeenCalledWith(directory)
      })
      it('match middle of many with implicit directory gets returned', async () => {
        const directory = 'avast'
        const file = 'thar'
        jest.spyOn(process, 'cwd').mockReturnValue(directory)
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue(['she', file, 'blows'])
        const filesSpy = jest.spyOn(fs, 'readdir')
        await expect(
          getDynamicExecutable({
            regex: 'th.*',
          })
        ).resolves.toBe(file)
        expect(filesSpy).toHaveBeenCalledWith(directory)
      })
      it('match last of many with implicit directory gets returned', async () => {
        const directory = 'davy'
        const file = 'jones'
        jest.spyOn(process, 'cwd').mockReturnValue(directory)
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue(['locker', 'savvy', file])
        const filesSpy = jest.spyOn(fs, 'readdir')
        await expect(
          getDynamicExecutable({
            regex: 'jo.*',
          })
        ).resolves.toBe(file)
        expect(filesSpy).toHaveBeenCalledWith(directory)
      })
      it('subsequent match gets ignored with implicit directory', async () => {
        const directory = 'land'
        const file = 'ho'
        jest.spyOn(process, 'cwd').mockReturnValue(directory)
        fs.pathExists = jest.fn().mockResolvedValue(true)
        fs.readdir = jest.fn().mockResolvedValue([file, `${file}2`])
        const filesSpy = jest.spyOn(fs, 'readdir')
        await expect(
          getDynamicExecutable({
            regex: 'ho.*',
          })
        ).resolves.toBe(file)
        expect(filesSpy).toHaveBeenCalledWith(directory)
      })
    })
  })
})
