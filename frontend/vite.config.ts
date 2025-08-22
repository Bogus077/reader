import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 3020,
    host: true,
    strictPort: true,
    allowedHosts: ['reader.sharkovv.ru']
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    allowedHosts: ['reader.sharkovv.ru']
  }
})
