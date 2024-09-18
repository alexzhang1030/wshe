import type { WSHEConfig } from './types'
import { heartbeatStop } from './heartbeat'

export function close(
  ws: WebSocket,
  config: WSHEConfig,
  ...[code = 1000, reason]: Parameters<WebSocket['close']>
): void {
  if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING)
    return
  if (config.heartbeat)
    heartbeatStop()
  ws.close(code, reason)
}
