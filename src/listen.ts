import type { Emitters, ResolvedWSHEConfig, WSHEMessage } from './types'
import { destr } from 'destr'
import { RAW_EVENT } from './constants'
import { heartbeatListen, heartbeatStart, heartbeatStop } from './heartbeat'
import { isWithSign, logger, omitSign } from './utils'

export function listen(ws: WebSocket, config: ResolvedWSHEConfig, emitter: Emitters): void {
  ws.onopen = (ev) => {
    config.onConnected(ws, ev)
    heartbeatStart(ws, config)
  }

  ws.onmessage = (e: MessageEvent<any>): any => {
    let message: WSHEMessage
    let data: any = e.data
    // Normalize Node `ws` Buffer / TypedArray to ArrayBuffer for browser-parity
    if (typeof data !== 'string') {
      if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
        data = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      }
      else if (ArrayBuffer.isView(data)) {
        data = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      }
    }

    if (typeof data !== 'string' || !isWithSign(data)) {
      emitter.emit(RAW_EVENT, data)
      return
    }

    try {
      message = destr<WSHEMessage>(omitSign(data))
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
