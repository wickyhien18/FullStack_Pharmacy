
// ================================================================
// jest.config.js — Cấu hình Jest / Jest configuration
//
// Tại sao cần --experimental-vm-modules?
// Why --experimental-vm-modules?
//   Project dùng ES modules (import/export) — Jest mặc định dùng CommonJS
//   Project uses ES modules — Jest defaults to CommonJS
// ================================================================
export default {
  testEnvironment: 'node',

  // Chỉ chạy file .test.js trong thư mục tests/
  // Only run .test.js files in tests/ directory
  testMatch: ['**/tests/**/*.test.js'],

  // Timeout 30 giây vì có DB query / 30s timeout for DB queries
  testTimeout: 30000,

  // Hiển thị chi tiết từng test / Show detailed output per test
  verbose: true,
};
