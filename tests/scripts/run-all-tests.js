#!/usr/bin/env node

// Script to run all tests in the project
// This script runs unit, integration, and e2e tests

const { execSync } = require("child_process");
const path = require("path");

console.log("🧪 Running All Weather App Tests");
console.log("=================================");

const testSuites = [
  {
    name: "Unit Tests",
    command: "npm test tests/unit/",
    description: "Testing individual components and functions",
  },
  {
    name: "Integration Tests",
    command: "npm test tests/integration/",
    description: "Testing component interactions and context",
  },
  {
    name: "E2E Tests",
    command: "npm test tests/e2e/",
    description: "Testing complete user workflows",
  },
];

async function runTests() {
  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of testSuites) {
    console.log(`\n📋 Running ${suite.name}...`);
    console.log(`   ${suite.description}`);
    console.log("   " + "=".repeat(50));

    try {
      const startTime = Date.now();
      execSync(suite.command, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      const duration = Date.now() - startTime;

      console.log(`✅ ${suite.name} passed in ${duration}ms`);
      totalPassed++;
    } catch (error) {
      console.log(`❌ ${suite.name} failed`);
      console.log(`   Error: ${error.message}`);
      totalFailed++;
    }
  }

  console.log("\n📊 Test Summary");
  console.log("================");
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📈 Total: ${totalPassed + totalFailed}`);

  if (totalFailed === 0) {
    console.log(
      "\n🎉 All tests passed! The weather app is ready for production."
    );
    process.exit(0);
  } else {
    console.log("\n⚠️  Some tests failed. Please review the errors above.");
    process.exit(1);
  }
}

// Check if required dependencies are installed
function checkDependencies() {
  const requiredPackages = [
    "jest",
    "@testing-library/react",
    "@testing-library/jest-dom",
    "playwright",
  ];

  console.log("🔍 Checking dependencies...");

  for (const pkg of requiredPackages) {
    try {
      require.resolve(pkg);
      console.log(`   ✅ ${pkg}`);
    } catch (error) {
      console.log(`   ❌ ${pkg} - Please install with: npm install ${pkg}`);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  try {
    checkDependencies();
    await runTests();
  } catch (error) {
    console.error("💥 Test runner failed:", error.message);
    process.exit(1);
  }
}

main();
