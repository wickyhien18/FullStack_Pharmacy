// ================================================================
// jest.config.js — Cấu hình Jest / Jest configuration
// ================================================================
export default {
  testEnvironment: "node",
  testMatch: ["**/src/tests/**/*.test.js"],
  testTimeout: 30000,
  verbose: true,
  runInBand: true,
};
