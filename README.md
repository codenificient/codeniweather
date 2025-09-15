# CodeniWeather 🌤️

A modern, responsive weather application built with Next.js 14, featuring real-time weather data, interactive weather maps, 7-day forecasts, and a beautiful glass-morphism UI with dark/light theme support.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local:
# - NEXT_PUBLIC_OPENWEATHER_API_KEY (for weather data)
# - NEXT_PUBLIC_MAPTILER_API_KEY (for maps and geocoding)

# Run development server
npm run dev

# Build for production
npm run build
```

> 📖 **Need detailed setup instructions?** Check out our [Setup Guide](SETUP.md) for step-by-step instructions and troubleshooting tips.

## 📁 Project Structure

```
codeniweather/
├── src/                    # Source code
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── lib/              # Utility libraries
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── docs/                # Documentation
│   ├── README.md
│   ├── FEATURE_SPEC.md
│   ├── TESTING_SUMMARY.md
│   └── ...
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   ├── e2e/           # End-to-end tests
│   └── scripts/       # Test scripts
├── scripts/            # Build and utility scripts
└── setup.sh           # Environment setup script
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.32 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **Animations**: Framer Motion 10.18.0
- **Icons**: Lucide React 0.294.0
- **Maps**: MapTiler SDK 3.7.0 & Weather 3.1.1
- **APIs**:
  - OpenWeatherMap (weather data)
  - MapTiler (maps, geocoding, weather layers)
- **Testing**: Jest 29.7.0
- **UI Components**: Radix UI, Shadcn/ui

## 📚 Documentation

- [Setup Guide](SETUP.md) - Quick start and troubleshooting
- [Project Summary](docs/PROJECT_SUMMARY.md) - Comprehensive project overview
- [Feature Specification](docs/FEATURE_SPEC.md) - Detailed feature documentation
- [Changelog](CHANGELOG.md) - Version history and updates
- [Testing Summary](docs/TESTING_SUMMARY.md) - Testing documentation
- [Environment Setup](docs/ENVIRONMENT_SETUP.md) - Detailed setup instructions
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run test scripts
node tests/scripts/run-all-tests.js
```

## 🎨 Features

### 🌤️ Weather Data

- Real-time weather data from OpenWeatherMap
- 7-day weather forecast with detailed hourly data
- Current location detection and management
- Multiple location support with favorites
- Temperature unit conversion (Celsius/Fahrenheit)

### 🗺️ Interactive Maps

- Interactive weather maps powered by MapTiler
- Multiple weather layers (temperature, precipitation, wind, pressure, clouds, radar)
- Animated weather data with play/pause controls
- State-level weather aggregation with badges
- Fullscreen map view
- Zoom to location functionality

### 🎨 UI/UX

- Responsive glass-morphism design
- Dark/light theme support with system preference detection
- Smooth animations and transitions with Framer Motion
- Mobile-first responsive design
- Loading states and error handling
- Accessibility features

### 🔧 Technical Features

- Next.js 14 with App Router
- TypeScript for type safety
- Context-based state management
- Local storage for user preferences
- WebGL weather layer rendering
- Progressive Web App (PWA) ready

## 🆕 Recent Updates

### v0.1.0 (Latest)

- **Interactive Weather Maps**: Added MapTiler-powered weather maps with multiple layers
- **Animation Controls**: Play/pause/reset controls for weather data animation
- **State Weather Badges**: Real-time weather aggregation by US states
- **Fullscreen Map View**: Dedicated fullscreen map page with enhanced controls
- **Current Location Management**: Set and manage current location across the app
- **Theme System**: Complete dark/light theme implementation
- **Favicon & Branding**: Custom weather-themed favicon and consistent branding
- **Security Updates**: Updated to Next.js 14.2.32 with security fixes
- **Package Updates**: All dependencies updated to latest stable versions

### Key Features Added

- 🗺️ Interactive weather maps with 7 different weather layers
- ⏯️ Animated weather data with timeline controls
- 🏠 Current location management system
- 🌙 Dark/light theme with system preference detection
- 📱 Fullscreen map experience
- 🎯 State-level weather aggregation
- 🔒 Security vulnerability fixes

## 📄 License

MIT License - see LICENSE file for details
