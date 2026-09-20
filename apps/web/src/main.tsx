import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/gowun-dodum/400.css';
import '@fontsource/press-start-2p/400.css';
import { App } from './App.js';
import { initServiceWorker } from './registerSW.js';

const container = document.getElementById('root');
if (!container) {
  throw new Error('root element not found');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Only register a real service worker in a real PWA build/serve, not
// under `vite dev` (no virtual:pwa-register module there) or in unit
// tests (jsdom has no serviceWorker; App.test.tsx never imports this
// file directly).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  initServiceWorker();
}
