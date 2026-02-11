// jest.config.ts

import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePathIgnorePatterns: ["<rootDir>/dist"],
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/types/**",
    "!src/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html", "json-summary"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    "^@/commands/(.*)$": "<rootDir>/src/commands/$1",
    "^@/services/(.*)$": "<rootDir>/src/services/$1",
    "^@/models/(.*)$": "<rootDir>/src/models/$1",
    "^@/repositories/(.*)$": "<rootDir>/src/repositories/$1",
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/types/(.*)$": "<rootDir>/src/types/$1",
  },
  verbose: true,
  testTimeout: 10000,
};

export default config;
