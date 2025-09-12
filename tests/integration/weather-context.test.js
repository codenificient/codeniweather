// Integration tests for WeatherContext
// Tests the complete weather context functionality and state management

const React = require("react");
const {
  render,
  screen,
  fireEvent,
  waitFor,
} = require("@testing-library/react");
const {
  WeatherProvider,
  useWeather,
} = require("../../src/contexts/WeatherContext");

// Mock the API services
jest.mock("../../src/lib/weather-api");
jest.mock("../../src/lib/geolocation");
jest.mock("../../src/lib/storage");

const { WeatherAPI } = require("../../src/lib/weather-api");
const { GeolocationService } = require("../../src/lib/geolocation");
const { StorageService } = require("../../src/lib/storage");

describe("WeatherContext Integration Tests", () => {
  let mockWeatherAPI;
  let mockGeolocationService;
  let mockStorageService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock WeatherAPI
    mockWeatherAPI = {
      getCurrentWeather: jest.fn(),
      searchCities: jest.fn(),
      get5DayForecast: jest.fn(),
      processForecastData: jest.fn(),
    };
    WeatherAPI.getInstance = jest.fn().mockReturnValue(mockWeatherAPI);

    // Mock GeolocationService
    mockGeolocationService = {
      getCurrentPosition: jest.fn(),
      getLocationByIP: jest.fn(),
    };
    GeolocationService.getCurrentPosition =
      mockGeolocationService.getCurrentPosition;
    GeolocationService.getLocationByIP = mockGeolocationService.getLocationByIP;

    // Mock StorageService
    mockStorageService = {
      getLocations: jest.fn().mockReturnValue([]),
      addLocation: jest.fn(),
      removeLocation: jest.fn(),
      saveCurrentLocation: jest.fn(),
      getCurrentLocation: jest.fn().mockReturnValue(null),
    };
    Object.assign(StorageService, mockStorageService);
  });

  describe("Context Provider", () => {
    test("should provide weather context to children", () => {
      const TestComponent = () => {
        const { locations, currentLocation, loading, error } = useWeather();
        return (
          <div>
            <div data-testid="locations-count">{locations.length}</div>
            <div data-testid="current-location">
              {currentLocation?.name || "None"}
            </div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="error">{error?.message || "None"}</div>
          </div>
        );
      };

      render(
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      );

      expect(screen.getByTestId("locations-count")).toHaveTextContent("0");
      expect(screen.getByTestId("current-location")).toHaveTextContent("None");
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("error")).toHaveTextContent("None");
    });

    test("should load saved locations on mount", () => {
      const savedLocations = [
        {
          id: "location-1",
          name: "New York",
          country: "US",
          state: "NY",
          lat: 40.7128,
          lon: -74.006,
          isCurrentLocation: false,
        },
      ];
      mockStorageService.getLocations.mockReturnValue(savedLocations);

      const TestComponent = () => {
        const { locations } = useWeather();
        return <div data-testid="locations-count">{locations.length}</div>;
      };

      render(
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      );

      expect(screen.getByTestId("locations-count")).toHaveTextContent("1");
    });
  });

  describe("Location Management", () => {
    test("should add location successfully", async () => {
      const mockLocation = {
        id: "location-1",
        name: "New York",
        country: "US",
        state: "NY",
        lat: 40.7128,
        lon: -74.006,
        isCurrentLocation: false,
      };

      const mockWeather = {
        id: 1,
        name: "New York",
        country: "US",
        state: "NY",
        coord: { lat: 40.7128, lon: -74.006 },
        weather: [
          { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
        ],
        main: {
          temp: 20,
          feels_like: 22,
          temp_min: 15,
          temp_max: 25,
          pressure: 1013,
          humidity: 60,
        },
        wind: { speed: 5, deg: 180 },
        visibility: 10000,
        clouds: { all: 0 },
        dt: 1640995200,
        sys: { country: "US", sunrise: 1640952000, sunset: 1640991600 },
      };

      mockWeatherAPI.getCurrentWeather.mockResolvedValue(mockWeather);

      const TestComponent = () => {
        const { addLocation, locations } = useWeather();

        const handleAddLocation = async () => {
          await addLocation(mockLocation);
        };

        return (
          <div>
            <button onClick={handleAddLocation} data-testid="add-location">
              Add Location
            </button>
            <div data-testid="locations-count">{locations.length}</div>
          </div>
        );
      };

      render(
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      );

      fireEvent.click(screen.getByTestId("add-location"));

      await waitFor(() => {
        expect(screen.getByTestId("locations-count")).toHaveTextContent("1");
      });

      expect(mockStorageService.addLocation).toHaveBeenCalledWith(mockLocation);
      expect(mockWeatherAPI.getCurrentWeather).toHaveBeenCalledWith(
        40.7128,
        -74.006
      );
    });

    test("should remove location successfully", () => {
      const TestComponent = () => {
        const { removeLocation, locations } = useWeather();

        const handleRemoveLocation = () => {
          removeLocation("location-1");
        };

        return (
          <div>
            <button
              onClick={handleRemoveLocation}
              data-testid="remove-location"
            >
              Remove Location
            </button>
            <div data-testid="locations-count">{locations.length}</div>
          </div>
        );
      };

      render(
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      );

      fireEvent.click(screen.getByTestId("remove-location"));

      expect(mockStorageService.removeLocation).toHaveBeenCalledWith(
        "location-1"
      );
    });
  });

  describe("Current Location Management", () => {
    test("should set current location successfully", async () => {
      const mockLocation = {
        id: "current-location-1",
        name: "New York",
        country: "US",
        state: "NY",
        lat: 40.7128,
        lon: -74.006,
        isCurrentLocation: true,
      };

      const mockWeather = {
        id: 1,
        name: "New York",
        country: "US",
        state: "NY",
        coord: { lat: 40.7128, lon: -74.006 },
        weather: [
          { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
        ],
        main: {
          temp: 20,
          feels_like: 22,
          temp_min: 15,
          temp_max: 25,
          pressure: 1013,
          humidity: 60,
        },
        wind: { speed: 5, deg: 180 },
        visibility: 10000,
        clouds: { all: 0 },
        dt: 1640995200,
        sys: { country: "US", sunrise: 1640952000, sunset: 1640991600 },
      };

      const mockForecast = [
        {
          date: "2022-01-01",
          dayOfWeek: "Sat",
          temp_max: 25,
          temp_min: 15,
          weather: {
            id: 800,
            main: "Clear",
            description: "clear sky",
            icon: "01d",
          },
          pop: 10,
          rain: 0.5,
        },
      ];

      mockWeatherAPI.getCurrentWeather.mockResolvedValue(mockWeather);
      mockWeatherAPI.get5DayForecast.mockResolvedValue([]);
      mockWeatherAPI.processForecastData.mockReturnValue(mockForecast);

      const TestComponent = () => {
        const { setCurrentLocation, currentLocation } = useWeather();

        const handleSetCurrentLocation = async () => {
          await setCurrentLocation(mockLocation);
        };

        return (
          <div>
            <button
              onClick={handleSetCurrentLocation}
              data-testid="set-current-location"
            >
              Set Current Location
            </button>
            <div data-testid="current-location">
              {currentLocation?.name || "None"}
            </div>
          </div>
        );
      };

      render(
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      );

      fireEvent.click(screen.getByTestId("set-current-location"));

      await waitFor(() => {
        expect(screen.getByTestId("current-location")).toHaveTextContent(
          "New York"
        );
      });

      expect(mockWeatherAPI.getCurrentWeather).toHaveBeenCalledWith(
        40.7128,
        -74.006
      );
      expect(mockWeatherAPI.get5DayForecast).toHaveBeenCalledWith(
        40.7128,
        -74.006
      );
    });
  });

  describe("Search Functionality", () => {
    test("should search cities successfully", async () => {
      const mockSearchResults = [
        {
          id: 1,
          name: "New York",
          country: "US",
          state: "NY",
          coord: { lat: 40.7128, lon: -74.006 },
          weather: [
            { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
          ],
          main: {
            temp: 20,
            feels_like: 22,
            temp_min: 15,
            temp_max: 25,
            pressure: 1013,
            humidity: 60,
          },
          wind: { speed: 5, deg: 180 },
          visibility: 10000,
          clouds: { all: 0 },
          dt: 1640995200,
          sys: { country: "US", sunrise: 1640952000, sunset: 1640991600 },
        },
      ];

      mockWeatherAPI.searchCities.mockResolvedValue(mockSearchResults);

      const TestComponent = () => {
        const { searchCities, loading } = useWeather();
        const [results, setResults] = React.useState([]);

        const handleSearch = async () => {
          const searchResults = await searchCities("New York");
          setResults(searchResults);
        };

        return (
          <div>
            <button onClick={handleSearch} data-testid="search-cities">
              Search Cities
            </button>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="results-count">{results.length}</div>
          </div>
        );
      };

      render(
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      );

      fireEvent.click(screen.getByTestId("search-cities"));

      await waitFor(() => {
        expect(screen.getByTestId("results-count")).toHaveTextContent("1");
      });

      expect(mockWeatherAPI.searchCities).toHaveBeenCalledWith("New York");
    });
  });

  describe("Error Handling", () => {
    test("should handle API errors gracefully", async () => {
      const mockError = new Error("API Error");
      mockWeatherAPI.getCurrentWeather.mockRejectedValue(mockError);

      const TestComponent = () => {
        const { getCurrentLocation, error } = useWeather();

        const handleGetCurrentLocation = async () => {
          await getCurrentLocation();
        };

        return (
          <div>
            <button
              onClick={handleGetCurrentLocation}
              data-testid="get-current-location"
            >
              Get Current Location
            </button>
            <div data-testid="error">{error?.message || "None"}</div>
          </div>
        );
      };

      render(
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      );

      fireEvent.click(screen.getByTestId("get-current-location"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("API Error");
      });
    });
  });
});

console.log("✅ WeatherContext Integration Tests - Ready to run");
console.log("Run with: npm test tests/integration/weather-context.test.js");
