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
const { StorageService } = require("../../src/lib/storage");

describe("WeatherContext Integration Tests", () => {
  let mockWeatherAPI;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock WeatherAPI
    mockWeatherAPI = {
      getCurrentWeather: jest.fn().mockResolvedValue({
        id: 1,
        name: "Default",
        weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
        main: { temp: 20, feels_like: 22, temp_min: 15, temp_max: 25, pressure: 1013, humidity: 60 },
        wind: { speed: 5, deg: 180 },
        visibility: 10000,
        clouds: { all: 0 },
        dt: 1640995200,
        sys: { country: "US", sunrise: 1640952000, sunset: 1640991600 },
      }),
      searchCities: jest.fn(),
      get5DayForecast: jest.fn().mockResolvedValue([]),
      processForecastData: jest.fn().mockReturnValue([]),
    };
    WeatherAPI.getInstance = jest.fn().mockReturnValue(mockWeatherAPI);

    // Mock StorageService
    StorageService.getLocations = jest.fn().mockReturnValue([]);
    StorageService.addLocation = jest.fn();
    StorageService.removeLocation = jest.fn();
    StorageService.saveLocations = jest.fn();
    StorageService.clearLocations = jest.fn();
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

      // Initial state has default cities loaded when StorageService returns []
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
      StorageService.getLocations.mockReturnValue(savedLocations);

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
        expect(StorageService.addLocation).toHaveBeenCalledWith(mockLocation);
      });
    });

    test("should remove location successfully", () => {
      const TestComponent = () => {
        const { removeLocation } = useWeather();

        return (
          <button
            onClick={() => removeLocation("location-1")}
            data-testid="remove-location"
          >
            Remove Location
          </button>
        );
      };

      render(
        <WeatherProvider>
          <TestComponent />
        </WeatherProvider>
      );

      fireEvent.click(screen.getByTestId("remove-location"));

      expect(StorageService.removeLocation).toHaveBeenCalledWith("location-1");
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

      const TestComponent = () => {
        const { setCurrentLocation, currentLocation } = useWeather();

        return (
          <div>
            <button
              onClick={() => setCurrentLocation(mockLocation)}
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
        -74.006,
        "metric"
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
          coord: { lat: 40.7128, lon: -74.006 },
          weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
          main: { temp: 20, feels_like: 22, temp_min: 15, temp_max: 25, pressure: 1013, humidity: 60 },
          wind: { speed: 5, deg: 180 },
          visibility: 10000,
          clouds: { all: 0 },
          dt: 1640995200,
          sys: { country: "US", sunrise: 1640952000, sunset: 1640991600 },
        },
      ];

      mockWeatherAPI.searchCities.mockResolvedValue(mockSearchResults);

      const TestComponent = () => {
        const { searchCities } = useWeather();
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

      expect(mockWeatherAPI.searchCities).toHaveBeenCalledWith(
        "New York",
        "metric"
      );
    });
  });

  describe("Error Handling", () => {
    test("should handle API errors gracefully", async () => {
      mockWeatherAPI.getCurrentWeather.mockRejectedValue(
        new Error("API Error")
      );

      const TestComponent = () => {
        const { addLocation, error } = useWeather();

        return (
          <div>
            <button
              onClick={() =>
                addLocation({
                  id: "test",
                  name: "Test",
                  country: "US",
                  lat: 40.7128,
                  lon: -74.006,
                })
              }
              data-testid="trigger-error"
            >
              Trigger Error
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

      fireEvent.click(screen.getByTestId("trigger-error"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).not.toHaveTextContent("None");
      });
    });
  });
});
