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
})
