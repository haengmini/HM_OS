import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Milestone 5: real installable-PWA manifest (icons, standalone
 * display, real theme colors matching apps/web/src/styles/office.css)
 * and a real service worker precache/runtime-cache strategy for API
 * calls, wired to the actual HM OS pixel-office dark theme.
 *
 * `injectRegister: null` + apps/web/src/registerSW.ts: this project
 * registers the generated service worker manually (instead of
 * VitePWA's auto-injected <script>) so App.tsx can surface an
 * "update available" prompt through the same AuthGate-wrapped shell
 * instead of a silent background reload.
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      workbox: {
        // Never cache API calls with a stale-while-revalidate/cache-first
        // strategy: HM OS status/files/terminal must always hit the real
        // server. NetworkOnly here just means "don't let Workbox serve a
        // cached response"; it still lets normal fetch/WebSocket through.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: {
        name: 'HM OS',
        short_name: 'HM OS',
        description: 'Server-centered personal OS: real-time pixel office over Agent OS, system, and knowledge state, with full terminal/file control after Tailscale + PIN authentication.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        lang: 'ko',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8767',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
