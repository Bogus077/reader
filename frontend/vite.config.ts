import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // dev-сервер: npm run dev
  server: {
    host: true,            // слушать 0.0.0.0
    port: 3020,
    strictPort: true,
    allowedHosts: ['reader.sharkovv.ru'],  // ← разрешаем домен
    // если заходишь на dev через HTTPS reverse proxy — включи HMR по wss:
    // (если прямо открываешь http://<ip>:5173 — этот блок можно закомментировать)
    hmr: {
      protocol: 'wss',             // wss для HTTPS-прокси
      host: 'reader.sharkovv.ru',  // твой домен
      port: 443,
    },
    origin: 'https://reader.sharkovv.ru', // абсолютный origin для ассетов/HMR за прокси
  },

  // preview-сервер: npm run preview
  preview: {
    host: true,
    port: 3020,
    strictPort: true,
    allowedHosts: ['reader.sharkovv.ru'], // ← ошибка как раз про это поле
  },
})
