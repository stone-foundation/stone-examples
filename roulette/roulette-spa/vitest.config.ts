import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['./tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      include: ['app/**/*.ts', 'app/**/*.tsx'],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        100: true
      },
      watermarks: {
        statements: [60, 80],
        functions: [60, 80],
        branches: [60, 80],
        lines: [60, 80]
      }
    },
  }
});
