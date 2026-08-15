# CodeniWeather 🌤️

[![CodeniWeather Preview](https://api.microlink.io/?url=https://codeniweather.afrotomation.com&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1200&viewport.height=630&waitForTimeout=5000)](https://codeniweather.afrotomation.com)

<!-- waitForTimeout is load-bearing: weather and map tiles are fetched client
     side, so capturing immediately yields an empty shell. Five seconds is
     enough for conditions, the forecast and the map layer to paint. -->


**Live:** [codeniweather.afrotomation.com](https://codeniweather.afrotomation.com)

A weather companion built with Next.js and React, featuring real-time conditions,
7-day and 3-hourly forecasts, interactive MapTiler weather layers, and an
instrument-panel interface that shares one token set across light and dark.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local:
# - NEXT_PUBLIC_OPENWEATHER_API_KEY (weather data)
# - NEXT_PUBLIC_MAPTILER_API_KEY (maps, weather layers, geocoding)

# Run development server
bun run dev

# Build for production
bun run build
```

> 📖 **Need detailed setup instructions?** Check out our [Setup Guide](SETUP.md) for step-by-step instructions and troubleshooting tips.

> ⚠️ A freshly created OpenWeatherMap key returns `401` for up to a couple of
> hours while it activates, even though the dashboard already shows it as
> Active. If weather lookups fail on a brand-new key, verify it directly with
> `curl "https://api.openweathermap.org/data/2.5/weather?lat=0&lon=0&appid=YOUR_KEY"`
> before assuming the app is misconfigured.

## 🌐 Deployment

Self-hosted on **Coolify**, behind a Cloudflare tunnel.

- **Production:** https://codeniweather.afrotomation.com
- **Build:** the repository `Dockerfile` (Next.js `output: 'standalone'`)
- **Deploys:** pushing to `master` fires a Coolify webhook and ships in ~2 minutes
- **Health check:** `GET /api/health`

`NEXT_PUBLIC_*` variables are inlined by Next.js at **build** time, so changing a
key requires a redeploy — restarting the container is not enough.

## 📁 Project Structure

```
codeniweather/
├── src/                    # Source code
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── contexts/          # ThemeContext, WeatherContext
│   ├── lib/               # Utility libraries
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
├── docs/                  # Documentation
├── tests/                 # Unit, integration and e2e tests
├── scripts/               # Build and utility scripts
└── Dockerfile             # Production image
```

### Routes

| Route | Screen |
| --- | --- |
| `/` | Now — current conditions, surface readouts, map preview, hourly strip |
| `/cities` | Saved cities, ranked by temperature |
| `/city/[id]` | City detail (full-bleed, no navigation rail) |
| `/map` | Radar map with seven weather layers |
| `/map/fullscreen` | Fullscreen map framing every saved city |
| `/settings` | Appearance, units, privacy, data sources |

Every route segment has its own `error.tsx` and `loading.tsx`, plus a custom
`not-found.tsx`.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 3.4 over CSS custom properties
- **Typography**: Geist (interface) + JetBrains Mono (readouts)
- **Animations**: Framer Motion 12
- **Icons**: Lucide React
- **Maps**: MapTiler SDK 3.7 & MapTiler Weather 3.1
- **Analytics**: `@codenificient/analytics-sdk`
- **APIs**:
  - OpenWeatherMap (conditions and forecast)
  - MapTiler (basemap, weather layers, geocoding)
- **Testing**: Jest
- **Package manager**: bun

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
bun run test

# Run specific test suites
bun run test:unit
bun run test:integration
bun run test:e2e
```

## 🎨 Features

### 🌤️ Weather Data

- Real-time conditions from OpenWeatherMap
- 7-day forecast and a 3-hourly strip with precipitation probability
- Browser geolocation with MapTiler reverse geocoding
- Multiple saved locations, ranked by temperature
- Metric/imperial switching across every panel
- Dew point derived from temperature and humidity (Magnus-Tetens)

### 🗺️ Interactive Maps

- MapTiler basemap that follows the active theme
- Seven weather layers: radar, temperature, precipitation, wind, pressure,
  cloud cover and snow
- Map preview on the Now screen, a dedicated radar screen, and a fullscreen view
- Saved cities listed beside the map with live temperatures

### 🎨 UI/UX

- Instrument-panel interface: hairline rules, flat panels, mono readouts
- Light and dark share a single token set, so both stay in step
- Mono numerals keep temperature columns aligned across panels
- Dark/light theme with system preference detection
- Per-route error boundaries, loading skeletons and a custom 404
- Mobile-first responsive layout with an off-canvas navigation rail

### 🔧 Technical Features

- Next.js App Router with React 19
- TypeScript throughout
- Context-based state management
- Local storage for saved cities and preferences — no account required
- WebGL weather layer rendering
- Web app manifest and custom favicons

### Reporting honesty

Readouts the free OpenWeatherMap tier does not provide are shown as `—` rather
than estimated. UV index has no source on the current plan, and wind gusts
appear only when the station actually reports one.

## 🆕 Recent Updates

### Instrument-panel redesign (2026-08)

- Rebuilt all six screens on a shared light/dark token set
- Replaced Inter with Geist + JetBrains Mono, mono reserved for numeric readouts
- Ported the error boundaries, loading skeletons and added a custom 404
- Fixed C/F switching, which refetched using the previous unit and left Celsius
  values captioned °F
- Fixed a map that rebuilt itself on every render and an invalid MapTiler style
  id, both of which left the map blank

## 📄 License

MIT License - see LICENSE file for details
