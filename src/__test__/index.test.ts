describe('main', () => {
  it('should be a browser env', () => {
    expect(typeof window).not.toBe('undefined')
  })
})
