import { logger, withSign } from './utils'
import type { ResolvedWSHEConfig, WSHEMessage } from './types'

export function send<T>(ws: WebSocket, config: ResolvedWSHEConfig, eventName: string, data?: T) {
  if (config.debugging) {
    // start debug logging
    const timeout = 100
    logger.group(eventName, data)
    // stop debug logging
    setTimeout(() => {
      logger.groupEnd()
    }, timeout)
  }

  // if the connection is not open, do not send the message
  if (ws.readyState !== WebSocket.OPEN) {
    return
  }

  ws.send(withSign(JSON.stringify({
    event: eventName,
    data,
    createAt: Date.now(),
  } satisfies WSHEMessage)))
}
