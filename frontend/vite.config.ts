/// <reference types="vitest" />
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
      includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
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
  // Vitest configuration:
  test: {
    // Use jsdom to simulate the browser environment
    environment: 'jsdom',

    // Set up a custom test setup file (if you have one)
    setupFiles: [path.resolve(__dirname, './src/setupTests.ts')],

    // You can still specify the root if you want tests relative to /src
    root: path.resolve(__dirname, './src'),
  },
});
