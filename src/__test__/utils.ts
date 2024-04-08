import type { AddressInfo, WebSocket } from 'ws'
import { WebSocketServer } from 'ws'

export function createMockWSServer() {
  const server = new WebSocketServer({ port: 0 })

  let wsClient: WebSocket | null = null

  server.on('connection', (ws) => {
    wsClient = ws
    ws.on('message', (data) => {
      const parsedData = JSON.parse(data.toString())

      const message = { ...parsedData, timeSended: Date.now() }
      ws.send(JSON.stringify(message))
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
