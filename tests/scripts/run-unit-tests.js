#!/usr/bin/env node

// Script to run only unit tests
// Fast execution for development workflow

const { execSync } = require("child_process");

console.log("🔬 Running Unit Tests");
console.log("====================");

const unitTestFiles = [
  "tests/unit/weather-api.test.js",
  "tests/unit/geolocation.test.js",
  "tests/unit/storage.test.js",
];

async function runUnitTests() {
  let passed = 0;
  let failed = 0;

  for (const testFile of unitTestFiles) {
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

  console.log("\n📊 Unit Test Summary");
  console.log("====================");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log("\n🎉 All unit tests passed!");
    process.exit(0);
  } else {
    console.log("\n⚠️  Some unit tests failed.");
    process.exit(1);
  }
}

runUnitTests().catch((error) => {
  console.error("💥 Unit test runner failed:", error.message);
  process.exit(1);
});

