import { createWSHE } from '..'
import { createMockWSServer } from './utils'

describe('subscribe', () => {
  const date = new Date(2000, 1, 1)
  let mockWSServer: ReturnType<typeof createMockWSServer>

  beforeEach(() => {
    mockWSServer = createMockWSServer()
  })

  afterEach(() => {
    mockWSServer.server.close()
  })

  it('should subscribe to event', async () => {
    const eventName = 'eventName'
    const eventData = { text: 'Hello World!' }

    let event: any

    const wshe = createWSHE<{
      eventName: {
        text: string
      }
    }>(`ws://localhost:${mockWSServer.port}`, { immediate: true })
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
        throw new Error('a')
    })

    expect(event).toStrictEqual(eventData)
  })

  it('should output log to the console if debugging is enabled', async () => {
    const logSpy = vi.spyOn(console, 'log')
    let event: any

    const wshe = createWSHE(`ws://localhost:${mockWSServer.port}`, {
      immediate: true,
      debugging: true,
    })
    await vi.waitFor(() => {
      if (wshe.ws?.readyState !== window.WebSocket.OPEN)
        throw new Error('a')
    })

    wshe.subscribe('eventName', e => (event = e))
    wshe.ws?.send(JSON.stringify({ event: 'eventName', data: 'Hello world!' }))
    await vi.waitFor(() => {
      if (event === undefined)
        throw new Error('a')
    })

    expect(logSpy).toHaveBeenCalled()
  })
})
