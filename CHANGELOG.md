# Changelog

All notable changes to CodeniWeather will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-27

### Added

- **Interactive Weather Maps**

  - MapTiler SDK integration for interactive maps
  - 7 weather layers: temperature, precipitation, wind, pressure, clouds, radar, snow
  - Animated weather data with timeline controls
  - Fullscreen map view with dedicated page
  - Zoom to location functionality
  - State-level weather aggregation with badges

- **Current Location Management**

  - Set current location from cities page
  - Current location indicator on map
  - Location selector dropdown on landing page
  - Visual styling for current location cards

- **Theme System**

  - Complete dark/light theme implementation
  - System preference detection
  - Theme persistence in localStorage
  - Consistent theming across all components

- **UI/UX Enhancements**

  - Custom weather-themed favicon (SVG + ICO)
  - Consistent branding throughout the app
  - Enhanced glass-morphism design
  - Improved mobile responsiveness
  - Better loading states and error handling

- **Technical Improvements**
  - WebGL weather layer rendering
  - State weather data aggregation
  - Custom event system for map controls
  - Enhanced error handling for WebGL contexts
  - Progressive Web App (PWA) readiness

### Changed

- **Footer Credits**: Updated from "Powered by OpenWeather" to "Powered by MapTiler"
- **Package Dependencies**: Updated all packages to latest stable versions
- **Security**: Fixed Next.js security vulnerabilities (14.0.4 → 14.2.32)
- **Map Controls**: Moved animation controls to bottom-left of map
- **Location Cards**: Enhanced visual styling for current location indication

### Fixed

- **Temperature Conversion**: Fixed Celsius/Fahrenheit conversion on landing page
- **Unit Refresh**: Fixed unit changes not refreshing all weather cards
- **WebGL Errors**: Added comprehensive WebGL error handling
- **Map Movement**: Fixed unexpected map movement on fullscreen page
- **Text Cutoff**: Fixed text cutoff in location cards (increased line height)
- **Favicon Loading**: Fixed favicon not loading in browsers

### Security

- Updated Next.js from 14.0.4 to 14.2.32 to fix critical security vulnerabilities
- Resolved all security vulnerabilities in dependencies
- Enhanced error handling for external API calls

### Dependencies Updated

- **Next.js**: 14.0.4 → 14.2.32
- **Tailwind CSS**: 3.3.0 → 3.4.17
- **Framer Motion**: 10.16.16 → 10.18.0
- **Axios**: 1.6.2 → 1.12.2
- **TypeScript**: Updated to latest stable
- **All dev dependencies**: Updated to latest compatible versions

## [0.0.1] - 2024-12-XX

### Added

- Initial project setup
- Basic weather data display
- City search and management
- Responsive design
- Basic error handling

---

## Development Notes

### API Keys Required

- `NEXT_PUBLIC_OPENWEATHER_API_KEY`: For weather data from OpenWeatherMap
- `NEXT_PUBLIC_MAPTILER_API_KEY`: For maps and geocoding from MapTiler

### Browser Support

- Modern browsers with WebGL support
- ES2020+ JavaScript features
- CSS Grid and Flexbox support

### Performance Considerations

- Weather layers require WebGL support
- Large datasets may impact performance on older devices
- Map animations can be resource-intensive
