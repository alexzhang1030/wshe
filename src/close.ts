import { heartbeatStop } from './heartbeat'
import type { WSHEConfig } from './types'

export function close(
  ws: WebSocket,
  config: WSHEConfig,
  ...[code = 1000, reason]: Parameters<WebSocket['close']>
): void {
  if (config.heartbeat)
    heartbeatStop()
  ws.close(code, reason)
}
