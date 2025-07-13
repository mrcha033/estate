module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\.(ts|tsx)$': ['@swc/jest'],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library/react|@testing-library/jest-dom)/)',
    '^.+\.module\.(css|sass|scss)$',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
