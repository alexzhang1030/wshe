import mitt from 'mitt'
import { listen } from './listen'
import { open } from './open'
import type { BinaryDataTypes, DefaultEmittersType, WSHEConfig, WSHEMessage } from './types'
import { formatMs, formatString, logger, resolveRawConfig } from './utils'
import { send } from './send'
import { close } from './close'
import { BINARY_EVENT } from './constants'

export function createWSHE<
  EventsType extends Record<string, any> = DefaultEmittersType,
  Event extends keyof EventsType = keyof EventsType,
>(urlOrWsInstance: string | WebSocket, config: WSHEConfig = {}) {
  const resolvedConfig = resolveRawConfig(config)

  const emitter = mitt<DefaultEmittersType>()
  let ws: WebSocket | null = typeof urlOrWsInstance === 'string' ? null : urlOrWsInstance
  const url = typeof urlOrWsInstance === 'string' ? urlOrWsInstance : ''

  if (resolvedConfig.immediate) {
    if (!ws)
      ws = open(url)
    listen(ws, resolvedConfig, emitter)
  }

  return {
    get ws() {
      return ws
    },
    open() {
      if (ws)
        return
      ws = open(url)
      listen(ws, resolvedConfig, emitter)
    },
    close() {
      if (!ws)
        return
      close(ws, resolvedConfig)
    },
    send(event: Event, data: EventsType[Event]) {
      if (!ws)
        return
      send(ws, resolvedConfig, event as string, data)
    },
    /**
     * With this function to send binary data, but cannot subscribe to events now.
     */
    sendBinaryData(data: BinaryDataTypes) {
      if (!ws)
        return
      ws.send(data)
    },
    /**
     * With this function to subscribe to binary data.
     */
    subscribeBinaryData<T extends BinaryDataTypes>(callback: (data: T) => void) {
      if (!ws)
        return
      emitter.on(BINARY_EVENT, callback)
    },
    /**
     * You can use this method to subscribe to events.
     * @param event The event name.
     * @param callback The callback function.
     * @param once default is `false`, If true, the callback will be removed after the first call.
     * @returns cleanup fn
     */
    subscribe(event: Event, callback: (data?: EventsType[Event]) => void, once = false) {
      const cleanup = () => {
        emitter.off(event as string, fn)
      }
      function fn(data: WSHEMessage<EventsType[Event]>) {
        const receivedAt = Date.now()
        const timeDiff = formatMs(receivedAt - data.createAt)
        if (resolvedConfig.debugging) {
          logger.log(
            `%c${new Date(data.createAt).toLocaleTimeString()} %c${formatString(`${timeDiff.value + timeDiff.unit}`, 5)}%c ${formatString(event as string, 30)}`,
            'color: gray',
            'color: green',
            '',
            data,
          )
        }
        callback(data.data)
        if (once)
          cleanup()
      }
      emitter.on(event as string, fn)
      return cleanup
    },
  }
}

export type {
  WSHEConfig,
  WSHEMessage,
  WSHEHeartbeatConfig,
} from './types'
