import alias from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [alias()],
  test: {
    environment: 'jsdom',
    includeSource: ['src/*'],
    testTimeout: 10000,
    globals: true,
  },
})
