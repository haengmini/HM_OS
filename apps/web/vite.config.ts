import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Milestone 0: base Vite + React + PWA scaffold only.
 * Milestone 5 fills in the real manifest/service-worker asset list and
 * Tailscale-hostname-aware config; kept intentionally minimal here so
 * lint/typecheck/build succeed from day one.
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'HM OS',
        short_name: 'HM OS',
        description: 'Server-centered personal OS pixel office',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0f14',
        theme_color: '#0b0f14',
        icons: [],
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});
