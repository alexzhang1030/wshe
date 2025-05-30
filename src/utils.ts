import type { ResolvedWSHEConfig, ResolvedWSHEHeartbeatConfig, WSHEConfig } from './types'
import destr from 'destr'
import { SIGN } from './constants'

export function noop() {}

export function resolveRawConfig(config: WSHEConfig): ResolvedWSHEConfig {
  const {
    debugging = false,
    immediate = false,

    onError = noop,
    onConnected = noop,
    onDisconnected = noop,
    autoReconnect = false,

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
    onError,
    onConnected,
    onDisconnected,
    heartbeat: resolveHeartbeat,
    autoReconnect,
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

export function withSign(data: string): string {
  return `${SIGN}${data}`
}

export function isWithSign(data: string): boolean {
  return data.startsWith(SIGN)
}

export function omitSign(data: string): string {
  return data.slice(SIGN.length)
}

/* c8 ignore start */
export function jsonStringify(data: any): string {
  try {
    return JSON.stringify(data)
  }
  catch {
    return ''
  }
}

export function jsonParse<T>(data: string): T {
  return destr<T>(data)
}

/**
 * @returns [parsedData, isParsed]
 */
export function tryToParseRawMessage<T>(rawData: any): [T | null, boolean] {
  const str = typeof rawData === 'string' ? rawData : rawData.toString()
  if (!isWithSign(str))
    return [null, false]
  try {
    const res = jsonParse<T>(omitSign(str))
    return [res, true]
  }
  catch {
    return [null, false]
  }
}
/* c8 ignore stop */
