import alias from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [alias()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__test__/setup.ts'],
    includeSource: ['src/*'],
    testTimeout: 10000,
    globals: true,
  },
})
