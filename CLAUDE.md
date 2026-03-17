# CodeniWeather — Project Conventions

## Overview
CodeniWeather is a Next.js weather companion app using OpenWeatherMap for weather data and MapTiler for maps/geocoding. Built with the App Router, React 19, TypeScript, and Tailwind CSS.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 3 + custom glass-card CSS classes
- **Maps:** MapTiler SDK + MapTiler Weather layers
- **Animations:** Framer Motion
- **Analytics:** @codenificient/analytics-sdk + Umami
- **Testing:** Jest + Testing Library (unit/integration), Playwright (e2e)
- **Package Manager:** bun

## Project Structure
```
src/
  app/             # Next.js App Router pages and API routes
    api/analytics/ # Analytics proxy API routes
    cities/        # Saved cities list
    city/[id]/     # City detail (dynamic route)
    map/           # Weather map + fullscreen variant
    settings/      # User preferences
  components/      # Reusable React components
  contexts/        # ThemeContext, WeatherContext
  hooks/           # Custom React hooks
  lib/             # Utilities (weather-api, geocoding-api, analytics, geolocation)
  types/           # TypeScript type definitions
tests/             # Unit, integration, and e2e tests
```

## Commands
```bash
bun install          # Install dependencies
bun run dev          # Dev server
bun run build        # Production build
bun run lint         # ESLint
bun run test         # Run Jest tests
bun run test:unit    # Unit tests only
bun run test:e2e     # Playwright e2e tests
```

## Conventions

### Code Style
- All page components use `'use client'` (client-side rendering)
- Layout (`layout.tsx`) is a server component
- Tab indentation, single quotes in most files
- Spaces around parentheses and brackets (e.g., `func( arg )`, `[ item ]`)
- Use emoji for weather icons (no icon library)
- CSS uses custom `glass-card` and `glass-card-strong` utility classes

### Environment Variables
- Copy `.env.example` to `.env.local` for local development
- Required: `NEXT_PUBLIC_OPENWEATHER_API_KEY`, `NEXT_PUBLIC_MAPTILER_API_KEY`
- All client-side env vars use `NEXT_PUBLIC_` prefix
- Server-only vars: `ANALYTICS_API_KEY`, `ANALYTICS_ENDPOINT`

### Error Handling
- Every route segment has `error.tsx` (client error boundary) and `loading.tsx` (skeleton)
- Root `error.tsx` catches unhandled errors globally
- `middleware.ts` adds security headers and API route protection

### Git
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Author: Christian Tioye <codenificient@tutanota.com>
- Do not commit `.env.local` or API keys

### Testing
- Tests live in `tests/` directory (unit, integration, e2e subdirectories)
- Jest config in `jest.config.js`, Babel config in `babel.config.js`
- Run `bun run test` before committing
