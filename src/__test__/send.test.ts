import { createWSHE } from '..'
import { createMockWSServer } from './utils'

describe('send', () => {
  const date = new Date(2000, 1, 1)
  let mockWSServer: ReturnType<typeof createMockWSServer>

  beforeEach(() => {
    vi.useFakeTimers()
    mockWSServer = createMockWSServer()
  })

  afterEach(() => {
    mockWSServer.server.close()
    vi.restoreAllMocks()
  })

  it('don\'t send if the connection is not open', async () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, { immediate: true })
    wshe.close()
    wshe.send('eventName', { text: 'Hello, world!' })
    vi.advanceTimersByTime(100)
    expect(wshe.ws?.readyState).not.toBe(window.WebSocket.OPEN)
  })

  it('should send an event to the server', async () => {
    const eventName = 'eventName'
    const eventData = { text: 'Hello World!' }

    let event: any

    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, { immediate: true })
    await vi.waitFor(() => {
      vi.setSystemTime(date)
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('a')
    })

    wshe.subscribe(eventName, ev => (event = ev))
    wshe.send(eventName, eventData)
    await vi.waitFor(() => {
      vi.setSystemTime(date)
      if (event === undefined)
        throw new Error('Message not received back')
    })

    expect(event).toStrictEqual(eventData)
  })

  it('should output logs to the console if debugging is enabled', async () => {
    const groupSpy = vi.spyOn(console, 'group')
    const groupEndSpy = vi.spyOn(console, 'groupEnd')

    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, {
      debugging: true,
      immediate: true,
    })
    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('WebSocket not open')
    })

    wshe.send('eventName', { text: 'Hello, world!' })
    vi.advanceTimersByTime(100)

    expect(groupSpy).toHaveBeenCalledWith('eventName', { text: 'Hello, world!' })
    expect(groupEndSpy).toHaveBeenCalled()
  })

  it('send but not connected, should nothing happened', async () => {
    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, { immediate: false })

    wshe.send('eventName', { text: 'Hello, world!' })
    vi.advanceTimersByTime(100)

    wshe.sendRaw(new Uint8Array())
    wshe.subscribeRaw(() => {})

    expect(wshe.ws).toBeNull()
  })

  it('should work with a custom WebSocket instance', async () => {
    const ws = new WebSocket(`ws://localhost:${mockWSServer.port}`)
    const wshe = createWSHE(ws, { immediate: true })
    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('WebSocket not open')
    })

    wshe.send('eventName', { text: 'Hello, world!' })
    vi.advanceTimersByTime(100)

    expect(wshe.ws).toBe(ws)
  })
  it('should emit events when custom ws instance is opened / closed', async () => {
    const ws = new WebSocket(`ws://localhost:${mockWSServer.port}`)
    const onConnected = vi.fn()
    const onDisconnected = vi.fn()
    const wshe = createWSHE(ws, { immediate: true, onConnected, onDisconnected })

    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('WebSocket not open')
    })

    ws.close()
    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.CLOSED)
        throw new Error('WebSocket not closed')
    })

    expect(onConnected).toHaveBeenCalled()
    expect(onDisconnected).toHaveBeenCalled()
  })

  it('should support binary data', async () => {
    const eventData = new Uint8Array([1, 2, 3, 4, 5])

    let event: any

    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, { immediate: true })
    await vi.waitFor(() => {
      vi.setSystemTime(date)
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('a')
    })

    const unsubscribe = wshe.subscribeRaw(ev => (event = ev))
    wshe.sendRaw(eventData)
    await vi.waitFor(() => {
      vi.setSystemTime(date)
      if (event === undefined)
        throw new Error('Binary Data not received back')
    })

    expect(event).instanceof(Blob)
    expect(event).toStrictEqual(new Blob([eventData]))

    event = undefined
    unsubscribe()
    wshe.sendRaw(eventData)
    await expect(new Promise<void>((_, reject) => {
      vi.waitFor(() => {
        vi.setSystemTime(date)
        if (event === undefined)
          reject(new Error('Binary Data received back'))
      })
    })).rejects.toThrow()
  })
})
