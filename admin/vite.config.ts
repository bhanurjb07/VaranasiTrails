import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5174,
      // In dev the API is reached through this proxy (VITE_API_URL=/api), which keeps the
      // refresh-token cookie same-origin. Point VITE_DEV_PROXY_TARGET at your API's PORT.
      proxy: { '/api': env.VITE_DEV_PROXY_TARGET || 'http://localhost:5001' },
    },
    build: {
      rolldownOptions: {
        output: {
          // Keep the big, rarely-changing libraries out of the main bundle.
          codeSplitting: {
            groups: [
              { name: 'charts', test: /node_modules[\\/](recharts|d3-|victory-vendor|decimal\.js-light)/ },
              { name: 'dnd', test: /node_modules[\\/]@dnd-kit/ },
            ],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
    },
  }
})
