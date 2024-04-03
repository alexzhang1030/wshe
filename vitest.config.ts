import { defineConfig } from 'vitest/config'
import alias from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [alias()],
  test: {
    environment: 'jsdom',
    includeSource: ['src/*'],
    testTimeout: 10000,
    globals: true,
  },
})
