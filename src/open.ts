export function open(url: string) {
  const ws = new WebSocket(url)
  ws.binaryType = 'arraybuffer'
  return ws
}
