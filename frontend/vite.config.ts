import * as path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import manifest from './manifest.json';
import { execSync } from 'child_process';
import { Plugin } from 'vite';
import fs from 'fs';

const env = process.env.VITE_ENV || 'development';
const isProduction = process.env.DEPLOY_ENV === 'prod';
console.log(
  `env: ${env}, isProduction: ${isProduction}, process.env.DEPLOY_ENV: ${process.env.DEPLOY_ENV}, process.env.VITE_ENV: ${process.env.VITE_ENV}`,
);

// Get the env-provided app version or create one in the format: YYMMDD.HHMM.hash
let appVersion = process.env.VITE_APP_VERSION || '';

if (!appVersion) {
  // Generate version in the same format as CI: YYMMDD.HHMM.hash
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
  const timeStr = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
  
  let gitHash = 'unknown';
  try {
    gitHash = execSync('git rev-parse --short HEAD').toString().trim();
  } catch (error) {
    console.warn('Could not determine Git hash:', error);
  }
  
  appVersion = `${dateStr}.${timeStr}.${gitHash}`;
  console.log(`Generated app version: ${appVersion}`);
}

// For service worker updates, we need a simple timestamp 
const buildTimestamp = new Date().toISOString();

// Get current Git branch directly
let gitBranch = 'unknown';
try {
  gitBranch = execSync('git branch --show-current').toString().trim();
} catch (error) {
  console.warn('Could not determine Git branch:', error);
}

// Create version.txt during build
const generateVersionFile = (): Plugin => {
  return {
    name: 'generate-version-file',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      // For version checking, we use a timestamp that will change with every build
      fs.writeFileSync(path.join(distDir, 'version.txt'), buildTimestamp);
      console.log(`Version file created with timestamp: ${buildTimestamp}`);
      
      // Also write the display version for debugging
      fs.writeFileSync(path.join(distDir, 'display-version.txt'), appVersion);
      console.log(`Display version file created: ${appVersion}`);
    },
  };
};

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
    generateVersionFile(),
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
        // Add version.txt as an additional manifest entry with the current timestamp
        // This will force the service worker to update when the version changes
        additionalManifestEntries: [
          { url: '/version.txt', revision: buildTimestamp }
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
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    // Also make the build timestamp available for internal tracking
    'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(buildTimestamp),
  },
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './jest.setup.ts')],
    root: path.resolve(__dirname, './src'),
  },
});
