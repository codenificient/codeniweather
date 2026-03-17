// Unit tests for StorageService
// Tests local storage operations and data persistence

const { StorageService } = require("../../src/lib/storage");

describe("StorageService Unit Tests", () => {
  let store;

  beforeEach(() => {
    store = {};
    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: (key) => store[key] ?? null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
      },
      writable: true,
      configurable: true,
    });
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
      store["codeniweather-locations"] = "invalid-json";
      const locations = StorageService.getLocations();
      expect(locations).toEqual([]);
    });
  });

  describe("Location Management", () => {
    test("should clear all locations", () => {
      StorageService.addLocation({
        id: "test-1", name: "NY", country: "US", lat: 40.7, lon: -74.0,
      });
      StorageService.addLocation({
        id: "test-2", name: "London", country: "GB", lat: 51.5, lon: -0.1,
      });
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
    test("should handle localStorage setItem errors gracefully", () => {
      Object.defineProperty(global, "localStorage", {
        value: {
          getItem: () => null,
          setItem: () => { throw new Error("Storage quota exceeded"); },
          removeItem: () => {},
          clear: () => {},
        },
        writable: true,
        configurable: true,
      });

      expect(() =>
        StorageService.addLocation({
          id: "test-1", name: "NY", country: "US", lat: 40.7, lon: -74.0,
        })
      ).not.toThrow();
    });

    test("should handle getItem errors gracefully", () => {
      Object.defineProperty(global, "localStorage", {
        value: {
          getItem: () => { throw new Error("Storage access denied"); },
          setItem: () => {},
          removeItem: () => {},
          clear: () => {},
        },
        writable: true,
        configurable: true,
      });

      const locations = StorageService.getLocations();
      expect(locations).toEqual([]);
    });
  });

  describe("Data Validation", () => {
    test("should not add duplicate locations with same coordinates", () => {
      const location = {
        id: "test-location-1",
        name: "New York",
        country: "US",
        lat: 40.7128,
        lon: -74.006,
      };

      StorageService.addLocation(location);
      StorageService.addLocation(location);
      const locations = StorageService.getLocations();

      expect(locations).toHaveLength(1);
    });

    test("should handle location data without throwing", () => {
      expect(() =>
        StorageService.addLocation({ name: "Invalid City" })
      ).not.toThrow();

      const locations = StorageService.getLocations();
      expect(Array.isArray(locations)).toBe(true);
    });
  });
});
