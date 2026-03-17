// Unit tests for GeolocationService
// Tests geolocation functionality and error handling

const { GeolocationService } = require("../../src/lib/geolocation");

describe("GeolocationService Unit Tests", () => {
  let mockGetCurrentPosition;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentPosition = jest.fn();
    // Use defineProperty to safely set/replace navigator.geolocation
    Object.defineProperty(global.navigator, "geolocation", {
      value: {
        getCurrentPosition: mockGetCurrentPosition,
        watchPosition: jest.fn(),
        clearWatch: jest.fn(),
      },
      writable: true,
      configurable: true,
    });
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

      // Mock fetch for reverse geocoding
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            { name: "New York", state: "NY", country: "US" },
          ]),
      });

      mockGetCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await GeolocationService.getCurrentPosition();

      expect(result).toHaveProperty("lat", 40.7128);
      expect(result).toHaveProperty("lon", -74.006);
      expect(result).toHaveProperty("isCurrentLocation", true);
      expect(result).toHaveProperty("name", "New York");
    });

    test("should reject when both accuracy attempts fail", async () => {
      const posError = {
        code: 2,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: "Position unavailable",
      };

      mockGetCurrentPosition.mockImplementation((success, error) => {
        error(posError);
      });

      await expect(GeolocationService.getCurrentPosition()).rejects.toThrow();
    });

    test("should reject when geolocation is not supported", async () => {
      Object.defineProperty(global.navigator, "geolocation", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      await expect(GeolocationService.getCurrentPosition()).rejects.toThrow(
        "Geolocation is not supported by this browser"
      );
    });

    test("should use fallback coordinates when reverse geocoding fails", async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
      };

      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      mockGetCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await GeolocationService.getCurrentPosition();

      expect(result).toHaveProperty("lat", 40.7128);
      expect(result).toHaveProperty("lon", -74.006);
      expect(result).toHaveProperty("isCurrentLocation", true);
      expect(result).toHaveProperty("country", "Unknown");
    });

    test("should try low accuracy fallback when high accuracy fails", async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 100,
        },
      };

      const posError = {
        code: 2,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: "Position unavailable",
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            { name: "New York", state: "NY", country: "US" },
          ]),
      });

      let callCount = 0;
      mockGetCurrentPosition.mockImplementation((success, error) => {
        callCount++;
        if (callCount === 1) {
          error(posError);
        } else {
          success(mockPosition);
        }
      });

      const result = await GeolocationService.getCurrentPosition();

      expect(callCount).toBe(2);
      expect(result).toHaveProperty("lat", 40.7128);
      expect(result).toHaveProperty("isCurrentLocation", true);
    });
  });

  describe("getCurrentPositionWithIPFallback", () => {
    test("should fall back to IP geolocation when browser geolocation fails", async () => {
      const posError = {
        code: 2,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: "Position unavailable",
      };

      mockGetCurrentPosition.mockImplementation((success, error) => {
        error(posError);
      });

      global.fetch = jest.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            city: "New York",
            region: "NY",
            country_name: "US",
            latitude: 40.7128,
            longitude: -74.006,
          }),
      });

      const result =
        await GeolocationService.getCurrentPositionWithIPFallback();

      expect(result).toHaveProperty("name", "New York");
      expect(result).toHaveProperty("state", "NY");
      expect(result).toHaveProperty("country", "US");
      expect(result).toHaveProperty("lat", 40.7128);
      expect(result).toHaveProperty("lon", -74.006);
      expect(result).toHaveProperty("isCurrentLocation", true);
    });

    test("should reject when both geolocation and IP fallback fail", async () => {
      const posError = {
        code: 2,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: "Position unavailable",
      };

      mockGetCurrentPosition.mockImplementation((success, error) => {
        error(posError);
      });

      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(
        GeolocationService.getCurrentPositionWithIPFallback()
      ).rejects.toThrow(
        "Unable to determine your location. Please search for a city manually."
      );
    });
  });
});
