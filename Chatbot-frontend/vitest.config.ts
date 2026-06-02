import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.test.{js,ts,tsx}', 'src/**/*.spec.{js,ts,tsx}', 'src/__tests__/**/*.ts', 'src/__tests__/**/*.tsx'],
    exclude: ['playwright/**', '.github/**', 'node_modules/**'],
  },
})
