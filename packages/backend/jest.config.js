/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^shared/(.*)$': '<rootDir>/../shared/src/$1',
    '^shared$': '<rootDir>/../shared/src',
  },
};
