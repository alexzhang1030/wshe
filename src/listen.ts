import { destr } from 'destr'
import { RAW_EVENT } from './constants'
import { heartbeatListen, heartbeatStart, heartbeatStop } from './heartbeat'
import { isWithSign, logger, omitSign } from './utils'
import type { Emitters, ResolvedWSHEConfig, WSHEMessage } from './types'

export function listen(ws: WebSocket, config: ResolvedWSHEConfig, emitter: Emitters): void {
  ws.onopen = (ev) => {
    config.onConnected(ws, ev)
    heartbeatStart(ws, config)
  }

  ws.onmessage = (e: MessageEvent<any>): any => {
    let message: WSHEMessage

    if (typeof e.data !== 'string' || !isWithSign(e.data)) {
      emitter.emit(RAW_EVENT, e.data)
      return
    }

    try {
      message = destr<WSHEMessage>(omitSign(e.data))
      /* c8 ignore start */
    }
    catch (e) {
      if (config.debugging)
        logger.error(e)
      return
    }
    /* c8 ignore stop */

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
