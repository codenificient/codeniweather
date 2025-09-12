# CodeniWeather 🌤️

A modern, responsive weather application built with Next.js 14, featuring real-time weather data, 7-day forecasts, and a beautiful glass-morphism UI.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your OpenWeatherMap API key to .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

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

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API**: OpenWeatherMap
- **Testing**: Jest

## 📚 Documentation

- [Feature Specification](docs/FEATURE_SPEC.md)
- [Testing Summary](docs/TESTING_SUMMARY.md)
- [Environment Setup](docs/ENVIRONMENT_SETUP.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

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

- Real-time weather data
- 7-day weather forecast
- City search and management
- Responsive glass-morphism design
- Smooth animations and transitions
- Error handling and loading states

## 📄 License

MIT License - see LICENSE file for details
