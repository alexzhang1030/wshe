import type { ResolvedWSHEConfig, WSHEMessage } from './types'
import { logger } from './utils'

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

  ws.send(JSON.stringify({
    event: eventName,
    data,
    createAt: Date.now(),
  } satisfies WSHEMessage))
}
