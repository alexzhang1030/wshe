import type { ResolvedWSHEConfig, ResolvedWSHEHeartbeatConfig, WSHEConfig } from './types'

export function noop() {}

export function resolveRawConfig(config: WSHEConfig): ResolvedWSHEConfig {
  const {
    debugging = false,
    immediate = false,
    retryTimes = 5,

    onError = noop,
    onConnected = noop,
    onDisconnected = noop,

    heartbeat,
  } = config

  const resolveHeartbeat: ResolvedWSHEHeartbeatConfig = {
    interval: heartbeat?.interval ?? 5000,
    pingMessage: heartbeat?.pingMessage ?? 'ping',
    pongMessage: heartbeat?.pongMessage ?? 'pong',
    timeout: heartbeat?.timeout ?? 10000,
  }

  return {
    debugging,
    immediate,
    retryTimes,
    onError,
    onConnected,
    onDisconnected,
    heartbeat: resolveHeartbeat,
  }
}

export const logger = console

/**
 * Envelopes the content in a string of a certain length
 */
export function formatString(text: string, count: number): string {
  const spaceString = ' '.repeat(count)
  return text + spaceString.substring(text.length)
}

/**
 * Converts milliseconds into a conveniently readable unit
 */
export function formatMs(ms: number): { value: number, unit: 'ms' | 's' | 'm' | 'h' } {
  if (ms < 1000)
    return { value: ms, unit: 'ms' }
  if (ms < 60000)
    return { value: ms / 1000, unit: 's' }
  if (ms < 3600000)
    return { value: ms / 60000, unit: 'm' }

  return { value: ms / 3600000, unit: 'h' }
}
