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

  it('should not auto reconnect when the connection is closed', async () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, {
      immediate: true,
    })

    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('WebSocket not open')
    })

    mockWSServer.ws?.close()

    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.CLOSED)
        throw new Error('WebSocket not closed')
    })
  })

  it('should auto reconnect when the connection is closed', async () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, {
      immediate: true,
      autoReconnect: true,
    })

    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('WebSocket not open')
    })

    mockWSServer.ws?.close()

    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('WebSocket not open')
    })
  })

  it('should not reconnect when manual close', async () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, {
      immediate: true,
      autoReconnect: true,
    })

    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('WebSocket not open')
    })

    wshe.close()

    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.CLOSED)
        throw new Error('WebSocket not closed')
    })

    mockWSServer.ws?.close()

    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.CLOSED)
        throw new Error('WebSocket not closed')
    })

    wshe.open()

    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('WebSocket not open')
    })
  })
})
