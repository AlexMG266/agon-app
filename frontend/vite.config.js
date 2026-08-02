import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      clientPort: 5173,
    },
    host: true,
    strictPort: true,
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    env: {
      VITE_BACKEND_URL: 'http://backend.test'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/**/*.test.js', 'src/test/**', 'src/main.tsx', 'src/i18n/**']
    }
  }
})
