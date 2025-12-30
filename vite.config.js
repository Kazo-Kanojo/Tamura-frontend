import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      // As configurações do manifesto são puxadas automaticamente do arquivo public/manifest.json
      // Mas precisamos garantir que o service worker seja gerado corretamente
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024 // 6 MB
      },
      devOptions: {
        enabled: true // Permite testar o PWA em ambiente de desenvolvimento
      }
    })
  ],
  server: {
    host: '0.0.0.0',
  }
})
