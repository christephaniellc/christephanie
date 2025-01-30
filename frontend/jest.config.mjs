// jest.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  preset: 'ts-jest',
  clearMocks: true,
  // The key fix below: close the parenthesis properly
  setupFilesAfterEnv: [path.resolve(__dirname, './jest.setup.mjs')],
  collectCoverageFrom: [
    './src/**/*.{ts,tsx}',
    '!./src/**/*.d.ts'
  ],
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useEsm: true }],
  },
  // Tell Jest we want to treat certain extensions as ESM
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.mjs'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
