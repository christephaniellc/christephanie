import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import manifest from './manifest.json';

export default defineConfig({
  optimizeDeps: {
    exclude: ['chunk-UTMPNLEB'],
  },
  plugins: [
    react(),
    VitePWA({
      manifest,
      includeAssets: ['./public/favicon.svg', './public/favicon.ico', './public/robots.txt', './public/apple-touch-icon.png'],
      devOptions: {
        enabled: false,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html}', '**/*.{svg,png,jpg,gif}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './jest.setup.ts')],
    root: path.resolve(__dirname, './src'),
  },
});