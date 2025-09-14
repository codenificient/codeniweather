#!/usr/bin/env node

// Script to run only integration tests
// Tests component interactions and context

const { execSync } = require("child_process");

console.log("🔗 Running Integration Tests");
console.log("============================");

const integrationTestFiles = ["tests/integration/weather-context.test.js"];

async function runIntegrationTests() {
  let passed = 0;
  let failed = 0;

  for (const testFile of integrationTestFiles) {
    console.log(`\n📝 Running ${testFile}...`);

    try {
      const startTime = Date.now();
      execSync(`npm test ${testFile}`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      const duration = Date.now() - startTime;

      console.log(`✅ ${testFile} passed in ${duration}ms`);
      passed++;
    } catch (error) {
      console.log(`❌ ${testFile} failed`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }

  console.log("\n📊 Integration Test Summary");
  console.log("============================");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log("\n🎉 All integration tests passed!");
    process.exit(0);
  } else {
    console.log("\n⚠️  Some integration tests failed.");
    process.exit(1);
  }
}

runIntegrationTests().catch((error) => {
  console.error("💥 Integration test runner failed:", error.message);
  process.exit(1);
});

