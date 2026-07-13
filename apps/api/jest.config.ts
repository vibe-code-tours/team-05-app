import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.service.ts", "!**/*.module.ts", "!main.ts"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "../../node_modules"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/../$1",
  },
};

export default config;
