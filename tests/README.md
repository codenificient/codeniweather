# Weather App Testing Suite

This directory contains a comprehensive testing suite for the CodeniWeather application, covering unit tests, integration tests, and end-to-end tests.

## 📁 Directory Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── weather-api.test.js  # WeatherAPI class tests
│   ├── geolocation.test.js  # GeolocationService tests
│   └── storage.test.js      # StorageService tests
├── integration/             # Integration tests
│   └── weather-context.test.js # WeatherContext integration tests
├── e2e/                     # End-to-end tests
│   └── weather-app.test.js  # Complete app workflow tests
├── scripts/                 # Test runner scripts
│   ├── run-all-tests.js     # Run all test suites
│   ├── run-unit-tests.js    # Run only unit tests
│   ├── run-integration-tests.js # Run only integration tests
│   ├── run-e2e-tests.js     # Run only E2E tests
│   └── test-forecast-feature.js # Test forecast feature specifically
├── setup.js                 # Jest setup configuration
└── README.md               # This file
```

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm run test:all
```

### Run Specific Test Types

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only (requires app running)
npm run test:e2e

# Forecast feature tests
npm run test:forecast
```

## 🧪 Test Types

### Unit Tests

Test individual functions and components in isolation.

**Files:**

- `weather-api.test.js` - API methods and data processing
- `geolocation.test.js` - Geolocation functionality
- `storage.test.js` - Local storage operations

**Run:**

```bash
npm run test:unit
```

### Integration Tests

Test component interactions and context management.

**Files:**

- `weather-context.test.js` - WeatherContext state management

**Run:**

```bash
npm run test:integration
```

### End-to-End Tests

Test complete user workflows and app functionality.

**Files:**

- `weather-app.test.js` - Complete app testing

**Prerequisites:**

- App must be running on `http://localhost:3000`
- Start with: `npm run dev`

**Run:**

```bash
npm run test:e2e
```

## 🎯 Test Coverage

The test suite covers:

### Core Functionality

- ✅ Weather API integration
- ✅ Geolocation services
- ✅ Local storage operations
- ✅ Weather context management
- ✅ Search functionality
- ✅ Location management

### 7-Day Forecast Feature

- ✅ OpenWeatherMap 5-day forecast API
- ✅ Data processing (3-hour to daily averages)
- ✅ Forecast data caching
- ✅ ForecastPanel component display
- ✅ Weather icons and temperature ranges
- ✅ Precipitation indicators

### User Experience

- ✅ Search and location selection
- ✅ Weather data display
- ✅ Forecast panel functionality
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design

### Performance

- ✅ API call optimization
- ✅ Data caching
- ✅ Loading times
- ✅ Memory usage

## 🔧 Configuration

### Jest Configuration

The testing environment is configured in `jest.config.js`:

- **Test Environment:** jsdom (for React components)
- **Coverage Threshold:** 80% for all metrics
- **Timeout:** 10 seconds per test
- **Setup File:** `tests/setup.js`

### Test Setup

The `tests/setup.js` file provides:

- React Testing Library matchers
- Next.js router mocking
- Framer Motion mocking
- Local storage mocking
- Geolocation API mocking
- Console method mocking
- Global test utilities

## 📊 Coverage Reports

Generate coverage reports:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory:

- HTML report: `coverage/lcov-report/index.html`
- LCOV report: `coverage/lcov.info`

## 🐛 Debugging Tests

### Watch Mode

Run tests in watch mode for development:

```bash
npm run test:watch
```

### Verbose Output

Get detailed test output:

```bash
npm test -- --verbose
```

### Debug Specific Tests

Run a specific test file:

```bash
npm test tests/unit/weather-api.test.js
```

## 🚨 Common Issues

### E2E Tests Failing

**Issue:** E2E tests fail with connection errors
**Solution:** Ensure the app is running on `http://localhost:3000`

```bash
# Terminal 1: Start the app
npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e
```

### Mock Issues

**Issue:** Tests fail due to missing mocks
**Solution:** Check that all required mocks are defined in `tests/setup.js`

### Coverage Issues

**Issue:** Coverage below threshold
**Solution:** Add more tests or adjust threshold in `jest.config.js`

## 📈 Adding New Tests

### Unit Test Template

```javascript
// tests/unit/new-component.test.js
describe("NewComponent", () => {
  beforeEach(() => {
    // Setup
  });

  test("should do something", () => {
    // Test implementation
  });
});
```

### Integration Test Template

```javascript
// tests/integration/new-integration.test.js
describe("New Integration", () => {
  test("should integrate components correctly", async () => {
    // Test implementation
  });
});
```

### E2E Test Template

```javascript
// tests/e2e/new-e2e.test.js
describe("New E2E Feature", () => {
  test("should work end-to-end", async () => {
    // Test implementation
  });
});
```

## 🔄 Continuous Integration

The test suite is designed to work with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm install
    npm run test:all
    npm run test:coverage
```

## 📝 Test Data

Test utilities are available in `tests/setup.js`:

```javascript
// Create mock location
const location = global.testUtils.createMockLocation({
  name: "Custom City",
  lat: 40.7128,
  lon: -74.006,
});

// Create mock weather data
const weather = global.testUtils.createMockWeather({
  temp: 25,
  description: "sunny",
});

// Create mock forecast data
const forecast = global.testUtils.createMockForecast({
  temp_max: 30,
  temp_min: 20,
});
```

## 🎉 Success Criteria

A successful test run should show:

- ✅ All unit tests passing
- ✅ All integration tests passing
- ✅ All E2E tests passing
- ✅ Coverage above 80%
- ✅ No console errors
- ✅ All forecast features working

## 📞 Support

If you encounter issues with the test suite:

1. Check the console output for specific error messages
2. Verify all dependencies are installed
3. Ensure the app is running for E2E tests
4. Check Jest configuration
5. Review test setup and mocks

---

**Happy Testing! 🧪✨**
