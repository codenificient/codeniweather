// Unit tests for WeatherAPI class
// Tests all API methods and data processing functions

const { WeatherAPI } = require("../../src/lib/weather-api");

describe("WeatherAPI Unit Tests", () => {
  let weatherAPI;

  beforeEach(() => {
    weatherAPI = WeatherAPI.getInstance();
  });

  describe("API Key Validation", () => {
    test("should throw error when API key is not set", async () => {
      const originalKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      delete process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

      await expect(
        weatherAPI.getCurrentWeather(40.7128, -74.006)
      ).rejects.toThrow("OpenWeatherMap API key is not configured");

      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY = originalKey;
    });

    test("should throw error when API key is default placeholder", async () => {
      const originalKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY = "your-api-key-here";

      await expect(
        weatherAPI.getCurrentWeather(40.7128, -74.006)
      ).rejects.toThrow("OpenWeatherMap API key is not configured");

      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY = originalKey;
    });
  });

  describe("Data Formatting Methods", () => {
    test("formatTemperature should format temperature correctly", () => {
      expect(weatherAPI.formatTemperature(25.7)).toBe("26°C");
      expect(weatherAPI.formatTemperature(0)).toBe("0°C");
      expect(weatherAPI.formatTemperature(-5.3)).toBe("-5°C");
    });

    test("formatWindSpeed should convert m/s to km/h", () => {
      expect(weatherAPI.formatWindSpeed(10)).toBe("36 km/h");
      expect(weatherAPI.formatWindSpeed(5.5)).toBe("20 km/h");
      expect(weatherAPI.formatWindSpeed(0)).toBe("0 km/h");
    });

    test("formatHumidity should format humidity correctly", () => {
      expect(weatherAPI.formatHumidity(75)).toBe("75%");
      expect(weatherAPI.formatHumidity(0)).toBe("0%");
      expect(weatherAPI.formatHumidity(100)).toBe("100%");
    });

    test("formatPressure should format pressure correctly", () => {
      expect(weatherAPI.formatPressure(1013)).toBe("1013 hPa");
      expect(weatherAPI.formatPressure(1000)).toBe("1000 hPa");
    });

    test("formatVisibility should convert meters to kilometers", () => {
      expect(weatherAPI.formatVisibility(10000)).toBe("10 km");
      expect(weatherAPI.formatVisibility(5000)).toBe("5 km");
      expect(weatherAPI.formatVisibility(1000)).toBe("1 km");
    });

    test("getWindDirection should return correct direction", () => {
      expect(weatherAPI.getWindDirection(0)).toBe("N");
      expect(weatherAPI.getWindDirection(90)).toBe("E");
      expect(weatherAPI.getWindDirection(180)).toBe("S");
      expect(weatherAPI.getWindDirection(270)).toBe("W");
      expect(weatherAPI.getWindDirection(45)).toBe("NE");
      expect(weatherAPI.getWindDirection(135)).toBe("SE");
      expect(weatherAPI.getWindDirection(225)).toBe("SW");
      expect(weatherAPI.getWindDirection(315)).toBe("NW");
    });

    test("getTimeFromTimestamp should format time correctly", () => {
      const timestamp = 1640995200; // 2022-01-01 00:00:00 UTC
      const result = weatherAPI.getTimeFromTimestamp(timestamp);
      expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
    });
  });

  describe("Weather Icon URL Generation", () => {
    test("getWeatherIconUrl should generate correct URL", () => {
      const iconCode = "01d";
      const expectedUrl = "https://openweathermap.org/img/wn/01d@2x.png";
      expect(weatherAPI.getWeatherIconUrl(iconCode)).toBe(expectedUrl);
    });
  });

  describe("Forecast Data Processing", () => {
    test("processForecastData should group data by day", () => {
      const mockForecastData = [
        {
          dt: 1640995200, // 2022-01-01 00:00:00
          main: {
            temp: 20,
            temp_min: 15,
            temp_max: 25,
            humidity: 60,
            pressure: 1013,
          },
          weather: [
            { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
          ],
          wind: { speed: 5, deg: 180 },
          pop: 0.1,
          rain: { "3h": 0.5 },
        },
        {
          dt: 1641006000, // 2022-01-01 03:00:00
          main: {
            temp: 18,
            temp_min: 15,
            temp_max: 25,
            humidity: 65,
            pressure: 1012,
          },
          weather: [
            { id: 800, main: "Clear", description: "clear sky", icon: "01n" },
          ],
          wind: { speed: 4, deg: 200 },
          pop: 0.2,
          rain: { "3h": 0.3 },
        },
      ];

      const result = weatherAPI.processForecastData(mockForecastData);

      // The method always returns 7 days of forecast data
      expect(result).toHaveLength(7);
      expect(result[0].date).toBe("2022-01-01");
      expect(result[0].dayOfWeek).toBe("Fri");
      expect(result[0].temp_max).toBe(20);
      expect(result[0].temp_min).toBe(18);
      expect(result[0].pop).toBe(15); // Average of 10% and 20% = 15%
      expect(result[0].rain).toBe(0.8); // Sum of 0.5 and 0.3
    });

    test("processForecastData should handle multiple days", () => {
      const mockForecastData = [
        {
          dt: 1640995200, // 2022-01-01 00:00:00
          main: {
            temp: 20,
            temp_min: 15,
            temp_max: 25,
            humidity: 60,
            pressure: 1013,
          },
          weather: [
            { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
          ],
          wind: { speed: 5, deg: 180 },
          pop: 0.1,
        },
        {
          dt: 1641081600, // 2022-01-02 00:00:00
          main: {
            temp: 22,
            temp_min: 18,
            temp_max: 28,
            humidity: 70,
            pressure: 1014,
          },
          weather: [
            { id: 801, main: "Clouds", description: "few clouds", icon: "02d" },
          ],
          wind: { speed: 6, deg: 190 },
          pop: 0.3,
        },
      ];

      const result = weatherAPI.processForecastData(mockForecastData);

      // The method always returns 7 days of forecast data
      expect(result).toHaveLength(7);
      expect(result[0].date).toBe("2022-01-01");
      expect(result[1].date).toBe("2022-01-02");
    });

    test("processForecastData should handle snow data", () => {
      const mockForecastData = [
        {
          dt: 1640995200,
          main: {
            temp: -5,
            temp_min: -10,
            temp_max: 0,
            humidity: 80,
            pressure: 1020,
          },
          weather: [
            { id: 600, main: "Snow", description: "light snow", icon: "13d" },
          ],
          wind: { speed: 3, deg: 270 },
          pop: 0.8,
          snow: { "3h": 2.5 },
        },
      ];

      const result = weatherAPI.processForecastData(mockForecastData);

      expect(result[0].snow).toBe(2.5);
      expect(result[0].rain).toBeUndefined();
    });
  });
});

console.log("✅ WeatherAPI Unit Tests - Ready to run");
console.log("Run with: npm test tests/unit/weather-api.test.js");
