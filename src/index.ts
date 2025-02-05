import mitt from 'mitt'
import type { DataTypes, DefaultEmittersType, WSHEConfig, WSHEMessage } from './types'
import { close } from './close'
import { RAW_EVENT } from './constants'
import { listen } from './listen'
import { open } from './open'
import { send } from './send'
import { formatMs, formatString, logger, resolveRawConfig } from './utils'

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

  let manualClose = false

  if (config.autoReconnect && ws)
    bindReconnect(ws)

  function bindReconnect(ws: WebSocket) {
    ws.addEventListener('close', () => {
      if (manualClose)
        return
      ws = open(url)
      listen(ws, resolvedConfig, emitter)
    })
  }

  return {
    get ws() {
      return ws
    },
    open() {
      if (ws && !manualClose)
        return
      manualClose = false
      ws = open(url)
      listen(ws, resolvedConfig, emitter)
      if (config.autoReconnect)
        bindReconnect(ws)
    },
    close() {
      if (!ws)
        return
      manualClose = true
      close(ws, resolvedConfig)
    },
    send(event: Event, data: EventsType[Event]) {
      if (!ws)
        return
      send(ws, resolvedConfig, event as string, data)
    },
    /**
     * With this function to send raw data, but cannot subscribe to events.
     */
    sendRaw(data: DataTypes) {
      if (!ws)
        return
      ws.send(data)
    },
    /**
     * With this function to subscribe to raw data.
     * @returns unsubscribe function
     */
    subscribeRaw<T extends DataTypes>(callback: (data: T) => void) {
      emitter.on(RAW_EVENT, callback)
      return () => {
        emitter.off(RAW_EVENT, callback)
      }
    },
    /**
     * You can use this method to subscribe to events.
     * @param event The event name.
     * @param callback The callback function.
     * @param once default is `false`, If true, the callback will be removed after the first call.
     * @returns unsubscribe function
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

export type WSHE = ReturnType<typeof createWSHE>

export type {
  DataTypes as BinaryDataTypes,
  TypedArray,
  WSHEConfig,
  WSHEHeartbeatConfig,
  WSHEMessage,
} from './types'
