// @ts-check
import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel'
import { VitePWA } from 'vite-plugin-pwa'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  integrations: [tailwind()],
  server: {
    port: 4322,
    host: true,
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.discogs\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'discogs-api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24, // 24 heures
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 1000,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
                },
              },
            },
          ],
        },
        includeAssets: [
          'favicon.svg',
          'default-avatar.svg',
          'default-vinyl-cover.svg',
        ],
        manifest: {
          name: 'VinylVault - Gestionnaire de Collection Vinyle',
          short_name: 'VinylVault',
          description:
            'Gérez votre collection de vinyles avec VinylVault. Recherchez, organisez et suivez vos disques préférés.',
          theme_color: '#059669',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          lang: 'fr',
          categories: ['music', 'lifestyle', 'productivity'],
          icons: [
            {
              src: 'pwa-192x192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
            },
            {
              src: 'pwa-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
            },
            {
              src: 'favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Rechercher des vinyles',
              short_name: 'Recherche',
              description: 'Rechercher des vinyles sur Discogs',
              url: '/search',
              icons: [{ src: 'pwa-192x192.svg', sizes: '192x192' }],
            },
            {
              name: 'Mon Dashboard',
              short_name: 'Dashboard',
              description: 'Accéder à votre tableau de bord',
              url: '/dashboard',
              icons: [{ src: 'pwa-192x192.svg', sizes: '192x192' }],
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: 'index.html',
        },
      }),
    ],
    optimizeDeps: {
      include: ['bcryptjs', 'jsonwebtoken', '@prisma/client'],
    },
    define: {
      global: 'globalThis',
    },
  },
})
