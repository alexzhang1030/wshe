import type { AddressInfo, WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import { isWithSign, omitSign, withSign } from '../utils'

export function createMockWSServer() {
  const server = new WebSocketServer({ port: 0 })

  let wsClient: WebSocket | null = null

  server.on('connection', (ws) => {
    wsClient = ws
    ws.on('message', (data) => {
      try {
        const stringData = data.toString()
        const parsedData = JSON.parse(isWithSign(stringData) ? omitSign(stringData) : stringData)
        const message = { ...parsedData, timeSended: Date.now() }
        ws.send(withSign(JSON.stringify(message)))
      }
      catch {
        ws.send(data)
      }
    })
  })

  return {
    server,
    port: (server.address() as AddressInfo).port,
    get ws() {
      return wsClient
    },
  }
}
