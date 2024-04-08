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

  it('should open WebSocket when immediate = true', () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, { immediate: true })

    expect(wshe.ws).toBeInstanceOf(window.WebSocket)
    expect(wshe.ws?.readyState).toBe(window.WebSocket.CONNECTING)
    expect(wshe.ws?.url).toBe(`ws://localhost:${mockWSServer.port}/`)
  })

  it('should open WebSocket when immediate = false, but the open method is called', () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`)

    wshe.open()

    expect(wshe.ws).toBeInstanceOf(window.WebSocket)
    expect(wshe.ws?.readyState).toBe(window.WebSocket.CONNECTING)
    expect(wshe.ws?.url).toBe(`ws://localhost:${mockWSServer.port}/`)
  })

  it('should not open WebSocket twice', async () => {
    const spy = vi.fn()

    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, {
      immediate: true,
      onConnected: spy,
    })

    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('WebSocket not open')
    })

    wshe.open()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
