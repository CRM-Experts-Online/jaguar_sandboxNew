const SuiteCloudJestConfiguration = require(
  "@oracle/suitecloud-unit-testing/jest-configuration/SuiteCloudJestConfiguration"
);

// Build the SuiteCloud base config (stubs, transforms, module resolution).
const baseConfig = SuiteCloudJestConfiguration.build({
  projectFolder: "src",                                     // your SDF project folder
  projectType: SuiteCloudJestConfiguration.ProjectType.ACP, // or .SUITEAPP
  // rootDir: "."  // optional; auto-detected for monorepos
});

module.exports = {
  ...baseConfig,

  // Turn on coverage collection.
  collectCoverage: true,

  // Which files count toward coverage. Point this at your SuiteScript source,
  // and exclude anything you don't want measured (libs, generated, tests).
  collectCoverageFrom: [
    "src/FileCabinet/SuiteScripts/**/*.js",
    "!src/FileCabinet/SuiteScripts/**/*.test.js",
    "!**/node_modules/**",
  ],

  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov"],

  // Build fails if any metric drops below these. Start modest and raise over time.
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
};
