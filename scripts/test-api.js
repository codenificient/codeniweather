#!/usr/bin/env node

/**
 * API Test Script
 * This script tests the OpenWeatherMap API key and endpoints
 */

require("dotenv").config({ path: ".env.local" });

const axios = require("axios");

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

console.log("🔧 Testing OpenWeatherMap API...\n");

// Check if API key is set
if (!API_KEY || API_KEY === "your_openweather_api_key_here") {
  console.log("❌ API key not found or not configured");
  console.log("   Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in .env.local");
  process.exit(1);
}

console.log(`✅ API key found: ${API_KEY.substring(0, 8)}...`);

// Test API key with a simple request
async function testAPIKey() {
  try {
    console.log("\n🌡️  Testing API key with current weather request...");

    // Test with London coordinates
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat: 51.5074,
        lon: -0.1278,
        appid: API_KEY,
        units: "metric",
      },
    });

    console.log("✅ API key is valid!");
    console.log(
      `   Location: ${response.data.name}, ${response.data.sys.country}`
    );
    console.log(`   Temperature: ${Math.round(response.data.main.temp)}°C`);
    console.log(`   Weather: ${response.data.weather[0].description}`);
  } catch (error) {
    console.log("❌ API key test failed:");

    if (error.response?.status === 401) {
      console.log("   Invalid API key. Please check your key at:");
      console.log("   https://openweathermap.org/api");
    } else if (error.response?.status === 429) {
      console.log("   Rate limit exceeded. Please try again later.");
    } else {
      console.log(
        `   Error: ${error.response?.data?.message || error.message}`
      );
    }
    return false;
  }
  return true;
}

// Test geocoding API
async function testGeocodingAPI() {
  try {
    console.log("\n🔍 Testing geocoding API...");

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

    if (response.data && response.data.length > 0) {
      console.log("✅ Geocoding API is working!");
      console.log(
        `   Found: ${response.data[0].name}, ${response.data[0].country}`
      );
      console.log(
        `   Coordinates: ${response.data[0].lat}, ${response.data[0].lon}`
      );
    } else {
      console.log("⚠️  Geocoding API returned no results");
    }
  } catch (error) {
    console.log("❌ Geocoding API test failed:");
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
  return true;
}

// Test city search functionality
async function testCitySearch() {
  try {
    console.log("\n🏙️  Testing city search functionality...");

    // First get geocoding results
    const geocodingResponse = await axios.get(
      "https://api.openweathermap.org/geo/1.0/direct",
      {
        params: {
          q: "New York",
          limit: 1,
          appid: API_KEY,
        },
      }
    );

    if (geocodingResponse.data && geocodingResponse.data.length > 0) {
      const location = geocodingResponse.data[0];

      // Then get weather for that location
      const weatherResponse = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat: location.lat,
          lon: location.lon,
          appid: API_KEY,
          units: "metric",
        },
      });

      console.log("✅ City search is working!");
      console.log(
        `   City: ${weatherResponse.data.name}, ${weatherResponse.data.sys.country}`
      );
      console.log(
        `   Temperature: ${Math.round(weatherResponse.data.main.temp)}°C`
      );
      console.log(`   Weather: ${weatherResponse.data.weather[0].description}`);
    } else {
      console.log("⚠️  No geocoding results found for New York");
    }
  } catch (error) {
    console.log("❌ City search test failed:");
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
  return true;
}

// Run all tests
async function runTests() {
  const apiKeyValid = await testAPIKey();

  if (apiKeyValid) {
    await testGeocodingAPI();
    await testCitySearch();

    console.log("\n🎉 All API tests completed!");
    console.log("   Your OpenWeatherMap API key is working correctly.");
    console.log("   You can now use the weather app without issues.");
  } else {
    console.log("\n⚠️  Please fix the API key issue before using the app.");
    console.log("   See ENVIRONMENT_SETUP.md for detailed instructions.");
  }
}

runTests().catch(console.error);
