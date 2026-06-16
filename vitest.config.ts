import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/**/*.ts', 'shared/**/*.ts'],
      thresholds: {
        statements: 40,
        branches: 40,
        functions: 40,
        lines: 40
      }
    }
  }
});
