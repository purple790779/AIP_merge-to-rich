import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/AIP_merge-to-rich/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon_600.png'],
      manifest: {
        name: '머지 머니 타이쿤',
        short_name: '머지머니',
        description: '돈을 합쳐서 부자가 되세요! 중독성 있는 머지 머니 타이쿤 게임.',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        icons: [
          {
            src: 'icon_600.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon_600.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon_600.png',
            sizes: '600x600',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
