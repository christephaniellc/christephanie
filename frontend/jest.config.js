// jest.config.js
export default {
  // Use the default-esm preset for ESM support
  preset: 'ts-jest/presets/default-esm',
  clearMocks: true,
  // Point to your TypeScript setup file
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    './src/**/*.{ts,tsx}',
    '!./src/**/*.d.ts',
    '!./src/main.tsx',
    '!./src/vite-env.d.ts',
    '!./src/**/*.stories.{ts,tsx}',
    '!./src/**/**/index.{ts,tsx}',
    '!./src/types/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    // Only transform TypeScript files – remove ".js" if you don't need it
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
  },
  // Tell Jest to treat .ts and .tsx as ESM modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
};