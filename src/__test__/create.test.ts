import { createWSHE } from '..'
import { createMockWSServer } from './utils'

describe('create', () => {
  let mockWSServer: ReturnType<typeof createMockWSServer>

  beforeEach(() => {
    mockWSServer = createMockWSServer()
  })

  afterEach(() => {
    mockWSServer.server.close()
  })

  it('should not create WebSocket if not passing immediate', () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`)

    expect(wshe.ws).toBeNull()
  })

  it('should create a WebSocket, and connect to the server when immediate = true', () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, {
      immediate: true,
    })

    expect(wshe.ws).toBeInstanceOf(window.WebSocket)
    expect(wshe.ws?.readyState).toBe(window.WebSocket.CONNECTING)
  })

  it('should not create WebSocket when immediate = false', () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, {
      immediate: false,
    })

    expect(wshe.ws).toBeNull()
  })
})
