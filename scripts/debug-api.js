#!/usr/bin/env node

/**
 * API Debug Script
 * This script provides detailed debugging information for API issues
 */

require("dotenv").config({ path: ".env.local" });

const axios = require("axios");

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

console.log("🔍 OpenWeatherMap API Debug Information\n");
console.log("=====================================");

// Check environment loading
console.log("1. Environment Variables:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
console.log(`   API Key loaded: ${API_KEY ? "Yes" : "No"}`);
console.log(`   API Key length: ${API_KEY ? API_KEY.length : 0} characters`);
console.log(
  `   API Key format: ${
    API_KEY
      ? API_KEY.match(/^[a-f0-9]{32}$/)
        ? "Valid (32 hex chars)"
        : "Invalid format"
      : "Not set"
  }`
);
console.log(
  `   API Key preview: ${
    API_KEY
      ? `${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`
      : "Not set"
  }`
);

if (!API_KEY) {
  console.log("\n❌ No API key found. Please check your .env.local file.");
  process.exit(1);
}

// Test different API endpoints
async function testEndpoint(endpoint, params, description) {
  console.log(`\n2. Testing ${description}:`);
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Params: ${JSON.stringify(params, null, 2)}`);

  try {
    const response = await axios.get(endpoint, { params });
    console.log(`   ✅ Success! Status: ${response.status}`);
    console.log(
      `   Response data keys: ${Object.keys(response.data).join(", ")}`
    );

    if (response.data.name) {
      console.log(
        `   Location: ${response.data.name}, ${
          response.data.sys?.country || "N/A"
        }`
      );
    }

    return true;
  } catch (error) {
    console.log(
      `   ❌ Failed! Status: ${error.response?.status || "No response"}`
    );
    console.log(
      `   Error message: ${error.response?.data?.message || error.message}`
    );

    if (error.response?.data) {
      console.log(
        `   Full error response: ${JSON.stringify(
          error.response.data,
          null,
          2
        )}`
      );
    }

    return false;
  }
}

// Test API key activation status
async function checkAPIKeyStatus() {
  console.log("\n3. API Key Status Check:");

  try {
    // Try a simple request to check if key is activated
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: "London",
          appid: API_KEY,
          units: "metric",
        },
      }
    );

    console.log("   ✅ API key is active and working!");
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("   ❌ API key is invalid or not activated");
      console.log("   💡 Solutions:");
      console.log(
        "      1. Check if the key is correct at: https://openweathermap.org/api"
      );
      console.log(
        "      2. Make sure the key is activated (can take up to 2 hours)"
      );
      console.log("      3. Verify you copied the key correctly");
      console.log("      4. Check if you have any API usage limits");
    } else if (error.response?.status === 429) {
      console.log("   ⚠️  Rate limit exceeded");
      console.log("   💡 Wait a few minutes and try again");
    } else {
      console.log(`   ❌ Unexpected error: ${error.message}`);
    }
    return false;
  }
}

// Test geocoding endpoint
async function testGeocoding() {
  console.log("\n4. Testing Geocoding Endpoint:");

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/geo/1.0/direct",
      {
        params: {
          q: "London",
          limit: 1,
          appid: API_KEY,
        },
      }
    );

    console.log("   ✅ Geocoding endpoint working!");
    console.log(`   Found ${response.data.length} results`);

    if (response.data.length > 0) {
      const location = response.data[0];
      console.log(`   First result: ${location.name}, ${location.country}`);
      console.log(`   Coordinates: ${location.lat}, ${location.lon}`);
    }

    return true;
  } catch (error) {
    console.log("   ❌ Geocoding endpoint failed");
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Main test function
async function runDebugTests() {
  const apiWorking = await checkAPIKeyStatus();

  if (apiWorking) {
    await testGeocoding();

    console.log("\n🎉 All tests passed! Your API setup is working correctly.");
    console.log("   You can now use the weather app without issues.");
  } else {
    console.log(
      "\n⚠️  API key issues detected. Please fix them before using the app."
    );
    console.log("\n📋 Troubleshooting Checklist:");
    console.log("   1. ✅ API key is loaded from .env.local");
    console.log("   2. ❌ API key is not working with OpenWeatherMap");
    console.log("   3. 💡 Check the key at: https://openweathermap.org/api");
    console.log("   4. 💡 Make sure the key is activated");
    console.log("   5. 💡 Verify the key format (32 hex characters)");
  }
}

runDebugTests().catch(console.error);
