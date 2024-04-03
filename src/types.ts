import type { Emitter } from 'mitt'

export interface WSHEConfig {
  /**
   * onConnected event callback
   * @default
   * () => {}
   */
  onConnected?: (ws: WebSocket, event: Event) => void
  /**
   * onDisconnected event callback
   * @default
   * () => {}
   */
  onDisconnected?: (ws: WebSocket, event: CloseEvent) => void
  /**
   * onMessage event callback
   * @default
   * () => {}
   */
  onError?: (ws: WebSocket, event: Event) => void

  /**
   * Debugging log
   * @default false
   */
  debugging?: boolean
  /**
   * Connection ws immediately
   * @default false
   */
  immediate?: boolean
  /**
   * Heartbeat configuration
   * @default
   */
  heartbeat?: WSHEHeartbeatConfig
  /**
   * Retry times when disconnected
   * @default 5
   */
  retryTimes?: number
}

export type ResolvedWSHEConfig = Required<WSHEConfig> & {
  heartbeat: ResolvedWSHEHeartbeatConfig
}

export interface WSHEHeartbeatConfig {
  /**
   * @default 5000
   */
  interval?: number
  /**
   * @default "ping"
   */
  pingMessage?: string
  /**
   * @default "pong"
   */
  pongMessage?: string
  /**
   * @default 10000
   */
  timeout?: number
}

export type ResolvedWSHEHeartbeatConfig = Required<WSHEHeartbeatConfig>

export interface WSHEMessage<T = unknown> {
  event: string
  data?: T
  createAt: number
}

export type DefaultEmittersType = Record<string, any>

export type Emitters = Emitter<DefaultEmittersType>
