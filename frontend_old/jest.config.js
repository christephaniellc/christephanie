module.exports = {
  preset: 'ts-jest', // Use ts-jest for TypeScript support
  testEnvironment: 'jsdom', // Simulate browser environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Setup file
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
    '^@/(.*)$': '<rootDir>/src/$1', // Adjust based on your alias
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files
  },
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
  collectCoverage: true, // Enable coverage collection
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
};
