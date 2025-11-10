/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@chatterealm/shared$': '<rootDir>/../shared/src',
    '^@chatterealm/shared/(.*)$': '<rootDir>/../shared/src/$1',
  },
};
