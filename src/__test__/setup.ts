import { WebSocket as WsWebSocket } from 'ws'

// Node 22+ ships undici WebSocket which conflicts with jsdom's EventTarget
// (ERR_INVALID_ARG_TYPE: event must be instance of Event). Use `ws` instead.
const WS = WsWebSocket as unknown as typeof globalThis.WebSocket

// @ts-expect-error assign test polyfill
globalThis.WebSocket = WS

if (typeof window !== 'undefined') {
  // @ts-expect-error jsdom window
  window.WebSocket = WS
}
