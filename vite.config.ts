import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const isGitHubPages = process.env.GITHUB_ACTIONS === 'true' && mode === 'production';
  const isDev = mode === 'development';
  return {
    base: isGitHubPages ? '/issa-academy/' : '/',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
        includeAssets: ['icons/*.png'],
        manifest: {
          id: isGitHubPages ? '/issa-academy/' : '/',
          name: isDev ? 'Issa Academy [DEV]' : 'Issa Academy - Ensino Musical CCB',
          short_name: isDev ? 'Issa (Dev)' : 'Issa Academy',
          description: 'Plataforma gratuita de ensino musical gamificado focada no método MSA da CCB. Simulados, leitura rítmica e solfejo.',
          lang: 'pt-BR',
          theme_color: isDev ? '#d97706' : '#1a3c5a',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'any',
          start_url: isGitHubPages ? '/issa-academy/' : '/',
          scope: isGitHubPages ? '/issa-academy/' : '/',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['index.html', 'manifest.webmanifest', 'icons/*.png'],
          runtimeCaching: [
            {
              urlPattern: /\.(?:js|css|json|png|svg|ico|woff2?)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'issa-app-assets',
                expiration: {
                  maxEntries: 120,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            },
            {
              urlPattern: /^https:\/\/www\.youtube\.com\/.*/i,
              handler: 'NetworkOnly'
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
