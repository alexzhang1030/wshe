import { createWSHE } from '..'
import { createMockWSServer } from './utils'

describe('close', () => {
  let mockWSServer: ReturnType<typeof createMockWSServer>

  beforeEach(() => {
    mockWSServer = createMockWSServer()
  })

  afterEach(() => {
    mockWSServer.server.close()
  })

  it('should close the WebSocket', () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`)
    wshe.open()
    wshe.close()

    expect(wshe.ws).toBeInstanceOf(window.WebSocket)
    expect(wshe.ws?.readyState).toBe(window.WebSocket.CLOSING)
  })

  it('should not close the WebSocket if it is already closed', () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`)
    wshe.open()
    wshe.close()
    wshe.close()

    expect(wshe.ws).toBeInstanceOf(window.WebSocket)
    expect(wshe.ws?.readyState).toBe(window.WebSocket.CLOSING)
  })
})
