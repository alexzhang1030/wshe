import { formatMs, formatString } from '@/utils'

describe('helpers', () => {
  describe('formatString', () => {
    it('should correspond to the specified length', () => {
      const string = formatString('eventName', 10)

      expect(string).toHaveLength(10)
    })

    it('should contain the original content', () => {
      const string = formatString('eventName', 10)

      expect(string).toContain('eventName')
    })

    it('should return a string, exactly as expected', () => {
      const string = formatString('eventName', 10)

      expect(string).toBe('eventName ')
    })
  })

  describe('fromMsToUp', () => {
    it('should return milliseconds', () => {
      const { value, unit } = formatMs(1)

      expect(value).toBe(1)
      expect(unit).toBe('ms')
    })

    it('should round milliseconds to seconds', () => {
      const { value, unit } = formatMs(1000)

      expect(value).toBe(1)
      expect(unit).toBe('s')
    })

    it('should round milliseconds to minutes', () => {
      const { value, unit } = formatMs(60000)

      expect(value).toBe(1)
      expect(unit).toBe('m')
    })

    it('should round milliseconds to hours', () => {
      const { value, unit } = formatMs(3600000)

      expect(value).toBe(1)
      expect(unit).toBe('h')
    })
  })
})
