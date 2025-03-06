module.exports = {
  // Two test environments:
  // - jsdom for React components
  // - node for API and database tests
  projects: [
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/*.test.js'],
      transform: {
        '^.+\\.jsx?$': 'babel-jest',
      },
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
    },
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/*.test.js', '<rootDir>/src/db/*.test.js'],
    },
  ],
  // Ignore node_modules and build directories
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
