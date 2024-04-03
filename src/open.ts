export function open(url: string) {
  const ws = new WebSocket(url)
  return ws
}
