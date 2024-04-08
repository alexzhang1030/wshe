import { close } from './close'
import { send } from './send'
import type { ResolvedWSHEConfig, WSHEMessage } from './types'

let heartbeatTimeoutWait: ReturnType<typeof setTimeout> | undefined

export function heartbeatStart(ws: WebSocket, config: ResolvedWSHEConfig): void {
  const { pingMessage, interval, timeout } = config.heartbeat
  setTimeout(() => {
    send(ws, config, pingMessage, pingMessage)
    heartbeatTimeoutWait = setTimeout(() => {
      close(ws, config, 1000, 'Heartbeat timeout')
    }, interval + timeout)
  }, interval)
}

export function heartbeatListen(ws: WebSocket, config: ResolvedWSHEConfig, e: WSHEMessage): void {
  const { pongMessage } = config.heartbeat
  if (e.event !== pongMessage)
    return
  heartbeatStop()
  heartbeatStart(ws, config)
}

export function heartbeatStop(): void {
  clearTimeout(heartbeatTimeoutWait)
  heartbeatTimeoutWait = undefined
}
