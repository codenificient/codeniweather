// Jest setup file for testing environment configuration
// This file runs before each test file

// Import testing library matchers
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockedImage({ src, alt, ...props }) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock Framer Motion
jest.mock("framer-motion", () => ({
  motion: {
    div: "div",
    button: "button",
    span: "span",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    p: "p",
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};
global.navigator.geolocation = mockGeolocation;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  createMockLocation: (overrides = {}) => ({
    id: "test-location-1",
    name: "Test City",
    country: "US",
    state: "CA",
    lat: 37.7749,
    lon: -122.4194,
    isCurrentLocation: false,
    ...overrides,
  }),

  createMockWeather: (overrides = {}) => ({
    id: 1,
    name: "Test City",
    country: "US",
    state: "CA",
    coord: { lat: 37.7749, lon: -122.4194 },
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
    ...overrides,
  }),

  createMockForecast: (overrides = {}) => ({
    date: "2022-01-01",
    dayOfWeek: "Sat",
    temp_max: 25,
    temp_min: 15,
    weather: { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
    pop: 10,
    rain: 0.5,
    ...overrides,
  }),
};

console.log("🧪 Jest setup completed - Testing environment ready");
