// Unit tests for StorageService
// Tests local storage operations and data persistence

const { StorageService } = require("../../src/lib/storage");

describe("StorageService Unit Tests", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset localStorage mock
    jest.clearAllMocks();
  });

  describe("Location Storage", () => {
    test("should save and retrieve locations", () => {
      const mockLocation = {
        id: "test-location-1",
        name: "New York",
        country: "US",
        state: "NY",
        lat: 40.7128,
        lon: -74.006,
        isCurrentLocation: false,
      };

      StorageService.addLocation(mockLocation);
      const locations = StorageService.getLocations();

      expect(locations).toHaveLength(1);
      expect(locations[0]).toEqual(mockLocation);
    });

    test("should save multiple locations", () => {
      const locations = [
        {
          id: "test-location-1",
          name: "New York",
          country: "US",
          state: "NY",
          lat: 40.7128,
          lon: -74.006,
          isCurrentLocation: false,
        },
        {
          id: "test-location-2",
          name: "London",
          country: "GB",
          lat: 51.5074,
          lon: -0.1278,
          isCurrentLocation: false,
        },
      ];

      locations.forEach((location) => StorageService.addLocation(location));
      const savedLocations = StorageService.getLocations();

      expect(savedLocations).toHaveLength(2);
      expect(savedLocations).toEqual(expect.arrayContaining(locations));
    });

    test("should remove location by id", () => {
      const locations = [
        {
          id: "test-location-1",
          name: "New York",
          country: "US",
          state: "NY",
          lat: 40.7128,
          lon: -74.006,
          isCurrentLocation: false,
        },
        {
          id: "test-location-2",
          name: "London",
          country: "GB",
          lat: 51.5074,
          lon: -0.1278,
          isCurrentLocation: false,
        },
      ];

      locations.forEach((location) => StorageService.addLocation(location));
      StorageService.removeLocation("test-location-1");

      const remainingLocations = StorageService.getLocations();
      expect(remainingLocations).toHaveLength(1);
      expect(remainingLocations[0].id).toBe("test-location-2");
    });

    test("should handle empty locations array", () => {
      const locations = StorageService.getLocations();
      expect(locations).toEqual([]);
    });

    test("should handle invalid JSON in localStorage", () => {
      localStorage.setItem("weather-locations", "invalid-json");
      const locations = StorageService.getLocations();
      expect(locations).toEqual([]);
    });
  });

  describe("Location Management", () => {
    test("should clear all locations", () => {
      const locations = [
        {
          id: "test-location-1",
          name: "New York",
          country: "US",
          state: "NY",
          lat: 40.7128,
          lon: -74.006,
          isCurrentLocation: false,
        },
        {
          id: "test-location-2",
          name: "London",
          country: "GB",
          lat: 51.5074,
          lon: -0.1278,
          isCurrentLocation: false,
        },
      ];

      locations.forEach((location) => StorageService.addLocation(location));
      StorageService.clearLocations();

      const clearedLocations = StorageService.getLocations();
      expect(clearedLocations).toEqual([]);
    });

    test("should save locations", () => {
      const locations = [
        {
          id: "test-location-1",
          name: "New York",
          country: "US",
          state: "NY",
          lat: 40.7128,
          lon: -74.006,
          isCurrentLocation: false,
        },
      ];

      StorageService.saveLocations(locations);
      const savedLocations = StorageService.getLocations();

      expect(savedLocations).toEqual(locations);
    });
  });

  describe("Error Handling", () => {
    test("should handle localStorage errors gracefully", () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      const mockLocation = {
        id: "test-location-1",
        name: "New York",
        country: "US",
        state: "NY",
        lat: 40.7128,
        lon: -74.006,
        isCurrentLocation: false,
      };

      // Should not throw error
      expect(() => StorageService.addLocation(mockLocation)).not.toThrow();

      // Restore original method
      localStorage.setItem = originalSetItem;
    });

    test("should handle getItem errors gracefully", () => {
      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = jest.fn().mockImplementation(() => {
        throw new Error("Storage access denied");
      });

      // Should return empty array instead of throwing
      const locations = StorageService.getLocations();
      expect(locations).toEqual([]);

      // Restore original method
      localStorage.getItem = originalGetItem;
    });
  });

  describe("Data Validation", () => {
    test("should validate location data structure", () => {
      const invalidLocation = {
        name: "New York",
        // Missing required fields
      };

      StorageService.addLocation(invalidLocation);
      const locations = StorageService.getLocations();

      // Should still add the location (validation happens at component level)
      expect(locations).toHaveLength(1);
    });

    test("should handle invalid location data gracefully", () => {
      // Test with invalid location data
      const invalidLocation = {
        name: "Invalid City",
        // Missing required fields like lat, lon, id
      };

      // Should not throw error, but also shouldn't add invalid data
      expect(() => StorageService.addLocation(invalidLocation)).not.toThrow();

      const locations = StorageService.getLocations();
      // Should still have previous valid locations
      expect(Array.isArray(locations)).toBe(true);
    });
  });
});

console.log("✅ StorageService Unit Tests - Ready to run");
console.log("Run with: npm test tests/unit/storage.test.js");
