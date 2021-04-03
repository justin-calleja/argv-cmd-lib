module.exports = {
  roots: ['<rootDir>/__tests__'],
  setupFilesAfterEnv: [],
  testMatch: ['**/?(*.)+(spec|test).+(ts|js)'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
};
