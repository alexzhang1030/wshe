import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createWSHE } from '..'
import { createMockWSServer } from './utils'

describe('heartbeat', () => {
  const date = new Date(2000, 1, 1)
  let mockWSServer: ReturnType<typeof createMockWSServer>

  beforeEach(() => {
    mockWSServer = createMockWSServer()
  })

  afterEach(() => {
    mockWSServer.server.close()
  })

  it('should send a ping event and receive a pong response', async () => {
    const ping = 'ping'
    const interval = 1000
    const pingSpy = vi.fn()

    let message: any

    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, {
      immediate: true,
      heartbeat: {
        interval,
        pingMessage: ping,
      },
    })

    await vi.waitFor(() => {
      vi.setSystemTime(date)
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('WebSocket not open')
    })

    wshe.subscribe(ping, (m) => {
      pingSpy()
      message = m
    })

    await vi.waitFor(() => {
      if (message === undefined)
        throw new Error('No message received')
    }, {
      timeout: interval + 100,
    })

    expect(message).toBe(message)
    expect(pingSpy).toHaveBeenCalledTimes(1)

    message = undefined
    mockWSServer.ws?.send(JSON.stringify({ event: 'pong' }))
    await vi.waitFor(() => {
      if (message === undefined)
        throw new Error('No message received')
    }, { timeout: interval + 100 })

    expect(pingSpy).toHaveBeenCalledTimes(2)
  })

  it('must close the connection if no response is received from the server', async () => {
    const interval = 100
    const timeout = 200

    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, {
      immediate: true,
      heartbeat: {
        interval,
        timeout,
      },
    })
    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('WebSocket not open')
    })

    await vi.waitFor(
      () => {
        if (wshe.ws?.readyState !== window.WebSocket.CLOSED)
          throw new Error('WebSocket didn\'t close after timeout')
      },
    )

    // Assert
    expect(wshe.ws?.readyState).toBe(window.WebSocket.CLOSED)
  })
})
