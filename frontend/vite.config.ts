import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const apiProxy = {
  '/api': {
    target: 'http://localhost:4000',
    changeOrigin: true,
  },
  '/uploads': {
    target: 'http://localhost:4000',
    changeOrigin: true,
  },
} as const

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: false,
    // Same-origin /api in dev → avoids CORS issues when frontend and backend use different ports
    proxy: { ...apiProxy },
  },
  preview: {
    port: 5174,
    proxy: { ...apiProxy },
  },
})
