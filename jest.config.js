module.exports = {
  roots: ['<rootDir>/src/__tests__'],
  setupFilesAfterEnv: [],
  testMatch: ['**/?(*.)+(spec|test).+(ts|js)'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
};
