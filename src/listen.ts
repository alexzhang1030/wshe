import { destr } from 'destr'
import { heartbeatListen, heartbeatStart, heartbeatStop } from './heartbeat'
import type { Emitters, ResolvedWSHEConfig, WSHEMessage } from './types'
import { logger } from './utils'

export function listen(ws: WebSocket, config: ResolvedWSHEConfig, emitter: Emitters): void {
  ws.onopen = (ev) => {
    config.onConnected(ws, ev)
    heartbeatStart(ws, config)
  }

  ws.onmessage = (e: MessageEvent<any>): any => {
    let message: WSHEMessage

    try {
      message = destr<WSHEMessage>(e.data)
    }
    catch (e) {
      if (config.debugging)
        logger.error(e)
      return
    }

    heartbeatListen(ws, config, message)
    emitter.emit(message.event, message)
  }

  ws.onerror = (ev) => {
    config.onError?.(ws, ev)
  }

  ws.onclose = (ev) => {
    config.onDisconnected?.(ws, ev)
    heartbeatStop()
  }
}
