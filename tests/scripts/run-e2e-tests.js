#!/usr/bin/env node

// Script to run only end-to-end tests
// Tests complete user workflows

const { execSync } = require("child_process");

console.log("🌐 Running E2E Tests");
console.log("====================");

const e2eTestFiles = ["tests/e2e/weather-app.test.js"];

async function runE2ETests() {
  console.log(
    "⚠️  Note: Make sure the app is running on http://localhost:3000"
  );
  console.log("   Start the app with: npm run dev\n");

  let passed = 0;
  let failed = 0;

  for (const testFile of e2eTestFiles) {
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

  console.log("\n📊 E2E Test Summary");
  console.log("====================");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log("\n🎉 All E2E tests passed!");
    process.exit(0);
  } else {
    console.log("\n⚠️  Some E2E tests failed.");
    process.exit(1);
  }
}

runE2ETests().catch((error) => {
  console.error("💥 E2E test runner failed:", error.message);
  process.exit(1);
});

