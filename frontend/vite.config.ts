import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import manifest from './manifest.json';
import fs from 'fs';
import { execSync } from 'child_process';

const env = process.env.VITE_ENV || 'development';
const isProduction = process.env.DEPLOY_ENV === 'production';

// Get current Git branch directly
let gitBranch = 'unknown';
try {
  gitBranch = execSync('git branch --show-current').toString().trim();
} catch (error) {
  console.warn('Could not determine Git branch:', error);
}

export default defineConfig({
  mode: isProduction ? 'production' : env,
  optimizeDeps: {
    exclude: ['chunk-UTMPNLEB', 'chunk-7FFZVRZD'],
  },
  plugins: [
    react(),
    VitePWA({
      manifest,
      includeAssets: ['./public/favicon.ico', './public/favicon.svg', './public/robots.txt', './public/apple-touch-icon.png'],
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
  define: {
    'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(gitBranch)
  },
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './jest.setup.ts')],
    root: path.resolve(__dirname, './src'),
  },
});