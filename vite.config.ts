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
      includeAssets: [
        'icon_600.png',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
        'thumbnail_square.png',
        'thumbnail_landscape.png'
      ],
      manifest: {
        name: '머지 머니 타이쿤',
        short_name: '머지머니',
        description: '같은 돈을 합쳐서 부자가 되어보세요. 중독성 있는 머지 머니 타이쿤 게임.',
        id: '/AIP_merge-to-rich/',
        start_url: '/AIP_merge-to-rich/',
        scope: '/AIP_merge-to-rich/',
        lang: 'ko',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
