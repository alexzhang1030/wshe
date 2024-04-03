import mitt from 'mitt'
import { listen } from './listen'
import { open } from './open'
import type { DefaultEmittersType, WSHEConfig, WSHEMessage } from './types'
import { formatMs, formatString, logger, resolveRawConfig } from './utils'
import { send } from './send'
import { close } from './close'

export function createWSHE<
  EventsType extends Record<string, any> = DefaultEmittersType,
  Event extends keyof EventsType = keyof EventsType,
>(url: string, config: WSHEConfig = {}) {
  const resolvedConfig = resolveRawConfig(config)

  const emitter = mitt<DefaultEmittersType>()
  let ws: WebSocket | null = null

  if (resolvedConfig.immediate) {
    ws = open(url)
    listen(ws, resolvedConfig, emitter)
  }

  return {
    get ws() {
      return ws
    },
    open() {
      ws = open(url)
      if (ws)
        return
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
     * You can use this method to subscribe to events.
     * @param event The event name.
     * @param callback The callback function.
     * @param once default is `false`, If true, the callback will be removed after the first call.
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

export { heartbeatResponse } from './heartbeat'