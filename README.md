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

// You can listen to messages
const unsubscribe = wshe.subscribe('<eventName>', (payload) => {})
```

Noticed that wshe will send `ping` message every 5 seconds for keep the connection alive. You need response `pong`.

```ts
// _$WSHE is required for auto JSON.parse
ws.send(`_$WHSE${JSON.stringify({
  event: 'pong',
  createAt: Date.now(),
})}`)
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
