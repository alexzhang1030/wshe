# wshe

**WS He**lper

<a href="https://www.npmjs.com/package/wshe" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/v/wshe" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/wshe" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/dt/wshe" alt="NPM Downloads" /></a>
<a href="https://github.com/alexzhang1030/wshe/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/alexzhang1030/wshe" alt="License" /></a>
<a href="https://codecov.io/gh/alexzhang1030/wshe" ><img src="https://codecov.io/gh/alexzhang1030/wshe/graph/badge.svg?token=I4FQDYAOMN"/></a>

A simple yet modern websocket client.

## Installation

```bash
pnpm i wshe
```

## Usage

```ts
import { createWSHE } from 'wshe'

const wshe = createWSHE('wss://echo.websocket.org', {
  // Pass this to automatically connect on creation
  immediate: true
})

// You can also connect manually
wshe.connect()

// You can send something
wshe.send('<eventName>', '<eventPayload>')

// or send raw data
wshe.sendRaw('<rawData>')
wshe.subscribeRaw((data) => {})

// You can listen to messages
const unsubscribe = wshe.subscribe('<eventName>', (payload) => {})
```

## Server implementation

You should implement a server to transfer messages between clients.

And do this on `onmessage` to handle heartbeat requests:

```ts
import { getHeartbeatResponse, isHeartbeatRequest } from 'wshe/server'

ws.onmessage = (message) => {
  if (isHeartbeatRequest(message)) {
    ws.send(getHeartbeatResponse(message))
    return
  }
  // do your own logic here..., e.g.
  JSON.parse(message)
}
```

## TypeScript Support

This library is written in TypeScript and provides good support for it.

Set message type will be like this:

```ts
const wshe = createWSHE<{
  foo: {
    bar: string
  }
  baz: {
    qux: number
  }
}>('...')

wshe.subscribe('foo', (payload) => {
  //                   ^? { bar: string }
})

wshe.subscribe('baz', (payload) => {
  //                   ^? { qux: number }
})
```

## Credits

This project is highly inspired by [wsgo](https://github.com/melishev/wsgo).

## License

MIT
