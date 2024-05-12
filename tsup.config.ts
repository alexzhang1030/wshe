import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['src/index.ts', 'src/server.ts'],
  target: 'esnext',
  format: ['esm', 'cjs'],
  dts: true,
})
