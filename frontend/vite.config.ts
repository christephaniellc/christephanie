import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import manifest from './manifest.json';
import { execSync } from 'child_process';
import { Plugin } from 'vite';

const env = process.env.VITE_ENV || 'development';
const isProduction = process.env.DEPLOY_ENV === 'prod';
console.log(
  `env: ${env}, isProduction: ${isProduction}, process.env.DEPLOY_ENV: ${process.env.DEPLOY_ENV}, process.env.VITE_ENV: ${process.env.VITE_ENV}`,
);
const appVersion = new Date().toISOString();

// Get current Git branch directly
let gitBranch = 'unknown';
try {
  gitBranch = execSync('git branch --show-current').toString().trim();
} catch (error) {
  console.warn('Could not determine Git branch:', error);
}

// Custom plugin to inject Lucky Orange script in production builds only
const injectProductionScripts = (): Plugin => {
  return {
    name: 'inject-production-scripts',
    transformIndexHtml(html) {
      if (isProduction) {
        // Add Lucky Orange script before closing body tag
        return html.replace(
          '</body>',
          `  <script async defer src="https://tools.luckyorange.com/core/lo.js?site-id=0d258834"></script>\n  </body>`,
        );
      }
      return html;
    },
  };
};

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
        // Don't cache based on revision by default
        dontCacheBustURLsMatching: /\.\w{8}\./,
        // Skip waiting so updates are applied immediately
        skipWaiting: true,
        // Enable clients claim to take control immediately
        clientsClaim: true,
        // Clean old caches
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        additionalManifestEntries: [
          { url: '/version.txt', revision: appVersion },
        ],
      },
      registerType: 'prompt',
      // Check for updates more frequently
      injectRegister: 'auto',
      // Set a shorter interval (every 10 minutes = 10 * 60 * 1000)
      registerWebManifestOptions: {
        updateInterval: 10 * 60 * 1000,
      }
    }),
    injectProductionScripts(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_GIT_BRANCH': JSON.stringify(gitBranch),
  },
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './jest.setup.ts')],
    root: path.resolve(__dirname, './src'),
  },
});
