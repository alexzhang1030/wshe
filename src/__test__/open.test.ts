import { createWSHE } from '..'
import { createMockWSServer } from './utils'

describe('open', () => {
  let mockWSServer: ReturnType<typeof createMockWSServer>

  beforeEach(() => {
    mockWSServer = createMockWSServer()
  })

  afterEach(() => {
    mockWSServer.server.close()
  })

  it('should open WebSocket when immediate = false, but the open method is called', () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, {
      immediate: false,
    })

    wshe.open()

    expect(wshe.ws).toBeInstanceOf(window.WebSocket)
    expect(wshe.ws?.readyState).toBe(window.WebSocket.CONNECTING)
    expect(wshe.ws?.url).toBe(`ws://localhost:${mockWSServer.port}/`)
  })
})
