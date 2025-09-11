#!/usr/bin/env node

/**
 * Environment Configuration Test
 * This script tests if the environment variables are properly configured
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Testing Environment Configuration...\n");

// Check if .env.local exists
const envLocalPath = path.join(__dirname, "..", ".env.local");
const envExamplePath = path.join(__dirname, "..", ".env.example");

if (!fs.existsSync(envLocalPath)) {
  console.log("❌ .env.local file not found");
  console.log("   Run: cp .env.example .env.local");
  console.log("   Then edit .env.local with your API key\n");
  process.exit(1);
}

console.log("✅ .env.local file exists");

// Load environment variables
require("dotenv").config({ path: envLocalPath });

// Check required variables
const requiredVars = ["NEXT_PUBLIC_OPENWEATHER_API_KEY"];

const missingVars = [];
const invalidVars = [];

requiredVars.forEach((varName) => {
  const value = process.env[varName];

  if (!value) {
    missingVars.push(varName);
  } else if (value.includes("your_") || value.includes("_here")) {
    invalidVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log("❌ Missing required environment variables:");
  missingVars.forEach((varName) => {
    console.log(`   - ${varName}`);
  });
  console.log("");
}

if (invalidVars.length > 0) {
  console.log("❌ Environment variables need to be updated:");
  invalidVars.forEach((varName) => {
    console.log(`   - ${varName} (still contains placeholder value)`);
  });
  console.log("");
}

if (missingVars.length === 0 && invalidVars.length === 0) {
  console.log("✅ All required environment variables are configured");

  // Test API key format
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (apiKey && apiKey.length >= 32) {
    console.log("✅ API key format looks valid");
  } else {
    console.log(
      "⚠️  API key format might be invalid (should be 32+ characters)"
    );
  }
}

// Check optional variables
const optionalVars = [
  "NEXT_PUBLIC_IPAPI_KEY",
  "NEXT_PUBLIC_WEATHER_ALERTS_API_KEY",
  "NEXT_PUBLIC_ANALYTICS_ID",
  "NEXT_PUBLIC_CACHE_DURATION",
  "NEXT_PUBLIC_RATE_LIMIT",
];

const configuredOptional = optionalVars.filter((varName) => {
  const value = process.env[varName];
  return value && !value.includes("your_") && !value.includes("_here");
});

if (configuredOptional.length > 0) {
  console.log("✅ Optional variables configured:");
  configuredOptional.forEach((varName) => {
    console.log(`   - ${varName}`);
  });
}

console.log("\n📋 Configuration Summary:");
console.log("========================");
console.log(
  `Required variables: ${
    requiredVars.length - missingVars.length - invalidVars.length
  }/${requiredVars.length}`
);
console.log(
  `Optional variables: ${configuredOptional.length}/${optionalVars.length}`
);

if (missingVars.length === 0 && invalidVars.length === 0) {
  console.log("\n🎉 Environment configuration is ready!");
  console.log("   You can now run: npm run dev");
} else {
  console.log(
    "\n⚠️  Please fix the issues above before running the application"
  );
  console.log("   See ENVIRONMENT_SETUP.md for detailed instructions");
}
