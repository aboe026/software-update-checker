import express from 'express'
import { Server } from 'http'

const app = express()
app.get('/', function (req, res) {
  res.send(req.query.text)
})
app.get('/error', function (req, res) {
  res.status(500).send()
})

export default class Website {
  private static server: Server

  static start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!Website.server || !Website.server.address()) {
        Website.server = app
          .listen(() => {
            resolve()
          })
          .on('error', (err) => {
            reject(err)
          })
      } else {
        resolve()
      }
    })
  }

  static stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (Website.server && Website.server.address()) {
        Website.server.close((err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }

  static getBaseUrl(): string {
    if (Website.server && Website.server.address()) {
      const addressInfo = Website.server.address()
      if (typeof addressInfo === 'string') {
        throw Error('Could not get port from address info')
      } else {
        return `http://localhost:${addressInfo?.port.toString()}`
      }
    } else {
      throw Error('Server not started, address not assigned')
    }
  }

  static getResponseUrl(response: string): string {
    return `${Website.getBaseUrl()}?text=${encodeURIComponent(response)}`
  }

  static getErrorUrl(): string {
    return `${Website.getBaseUrl()}/error`
  }
}
