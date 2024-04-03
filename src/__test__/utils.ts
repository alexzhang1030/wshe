import type { AddressInfo } from 'ws'
import { WebSocketServer } from 'ws'

export function createMockWSServer(): { server: WebSocketServer, port: number, turnHeartbeat: () => void } {
  const server = new WebSocketServer({ port: 0 })
  let heartbeatDisabled = false

  server.on('connection', (ws) => {
    ws.on('message', (data, isBinary) => {
      const parsedData = isBinary
        ? data
        : (JSON.parse(data.toString()))

      if (parsedData.event === 'ping' && !heartbeatDisabled) {
        const message = { event: 'pong', timeSended: Date.now() }
        ws.send(JSON.stringify(message))
      }

      const message = { ...parsedData, timeSended: Date.now() }
      ws.send(JSON.stringify(message))
    })
  })

  return {
    server,
    port: (server.address() as AddressInfo).port,

    turnHeartbeat: () => (heartbeatDisabled = !heartbeatDisabled),
  }
}
