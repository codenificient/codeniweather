// Unit tests for GeolocationService
// Tests geolocation functionality and error handling

const { GeolocationService } = require("../../src/lib/geolocation");

describe("GeolocationService Unit Tests", () => {
  // Mock geolocation API
  const mockGeolocation = {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock global navigator
    global.navigator = {
      geolocation: mockGeolocation,
    };
  });

  describe("getCurrentPosition", () => {
    test("should resolve with location data when geolocation succeeds", async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await GeolocationService.getCurrentPosition();

      expect(result).toHaveProperty("lat", 40.7128);
      expect(result).toHaveProperty("lon", -74.006);
      expect(result).toHaveProperty("isCurrentLocation", true);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.any(Object)
      );
    });

    test("should reject when geolocation fails", async () => {
      const mockError = new Error("Geolocation error");
      mockGeolocation.getCurrentPosition.mockImplementation(
        (success, error) => {
          error(mockError);
        }
      );

      await expect(GeolocationService.getCurrentPosition()).rejects.toThrow(
        "Geolocation error"
      );
    });

    test("should reject when geolocation is not supported", async () => {
      global.navigator = {};

      await expect(GeolocationService.getCurrentPosition()).rejects.toThrow(
        "Geolocation is not supported by this browser"
      );
    });

    test("should reject when geolocation times out", async () => {
      mockGeolocation.getCurrentPosition.mockImplementation(
        (success, error) => {
          setTimeout(() => {
            error(new Error("Geolocation timeout"));
          }, 100);
        }
      );

      await expect(GeolocationService.getCurrentPosition()).rejects.toThrow(
        "Geolocation timeout"
      );
    });
  });

  describe("getLocationByIP", () => {
    test("should resolve with location data from IP", async () => {
      // Mock fetch for IP geolocation
      global.fetch = jest.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            city: "New York",
            region: "NY",
            country: "US",
            lat: 40.7128,
            lon: -74.006,
          }),
      });

      const result = await GeolocationService.getLocationByIP();

      expect(result).toHaveProperty("name", "New York");
      expect(result).toHaveProperty("state", "NY");
      expect(result).toHaveProperty("country", "US");
      expect(result).toHaveProperty("lat", 40.7128);
      expect(result).toHaveProperty("lon", -74.006);
      expect(result).toHaveProperty("isCurrentLocation", true);
    });

    test("should reject when IP geolocation fails", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(GeolocationService.getLocationByIP()).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("reverseGeocodeWithTimeout", () => {
    test("should resolve with location data from coordinates", async () => {
      // Mock fetch for reverse geocoding
      global.fetch = jest.fn().mockResolvedValue({
        json: () =>
          Promise.resolve([
            {
              name: "New York",
              state: "NY",
              country: "US",
            },
          ]),
      });

      const result = await GeolocationService.reverseGeocodeWithTimeout(
        40.7128,
        -74.006
      );

      expect(result).toHaveProperty("name", "New York");
      expect(result).toHaveProperty("state", "NY");
      expect(result).toHaveProperty("country", "US");
      expect(result).toHaveProperty("lat", 40.7128);
      expect(result).toHaveProperty("lon", -74.006);
      expect(result).toHaveProperty("isCurrentLocation", true);
    });

    test("should reject when reverse geocoding fails", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("API error"));

      await expect(
        GeolocationService.reverseGeocodeWithTimeout(40.7128, -74.006)
      ).rejects.toThrow("API error");
    });

    test("should reject when reverse geocoding times out", async () => {
      global.fetch = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 6000))
        );

      await expect(
        GeolocationService.reverseGeocodeWithTimeout(40.7128, -74.006)
      ).rejects.toThrow("Reverse geocoding timeout");
    });
  });
});

console.log("✅ GeolocationService Unit Tests - Ready to run");
console.log("Run with: npm test tests/unit/geolocation.test.js");
