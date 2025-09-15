# CodeniWeather - Quick Setup Guide

## 🚀 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: For version control

## 📋 Required API Keys

### 1. OpenWeatherMap API Key

- Visit [OpenWeatherMap](https://openweathermap.org/api)
- Sign up for a free account
- Generate an API key
- Free tier includes 1,000 calls/day

### 2. MapTiler API Key

- Visit [MapTiler](https://www.maptiler.com/)
- Sign up for a free account
- Generate an API key
- Free tier includes 100,000 map loads/month

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/codenificient/codeniweather.git
cd codeniweather
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your API keys
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_api_key_here
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Testing
npm test                 # Run all tests
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run end-to-end tests

# Utilities
npm run generate-favicons # Generate favicon files
npm run test-env         # Test environment variables
npm run test-api         # Test API connections
```

## 🐛 Troubleshooting

### Common Issues

#### 1. API Key Errors

```
Error: OpenWeatherMap API key is not configured
```

**Solution**: Ensure your API keys are correctly set in `.env.local`

#### 2. Map Not Loading

```
Error: MapTiler API key is not configured
```

**Solution**: Check your MapTiler API key and ensure it's active

#### 3. WebGL Errors

```
Error: Cannot read properties of null (reading 'precision')
```

**Solution**: This is handled gracefully - weather layers will be disabled if WebGL is not supported

#### 4. Build Errors

```
Error: Module not found
```

**Solution**: Run `npm install` to ensure all dependencies are installed

### Environment Variables Checklist

- [ ] `NEXT_PUBLIC_OPENWEATHER_API_KEY` is set
- [ ] `NEXT_PUBLIC_MAPTILER_API_KEY` is set
- [ ] Both API keys are valid and active
- [ ] No extra spaces or quotes in `.env.local`

## 📁 Project Structure

```
codeniweather/
├── src/
│   ├── app/                 # Next.js pages
│   ├── components/          # React components
│   ├── contexts/            # State management
│   ├── lib/                 # Utilities and APIs
│   └── types/               # TypeScript definitions
├── public/                  # Static assets
├── docs/                    # Documentation
├── tests/                   # Test files
├── .env.local              # Environment variables (create this)
├── .env.example            # Environment template
└── package.json            # Dependencies
```

## 🔍 Verification

### Test Your Setup

1. **API Keys**: Run `npm run test-env` to verify API keys
2. **API Connections**: Run `npm run test-api` to test API connectivity
3. **Build**: Run `npm run build` to ensure everything compiles
4. **Development**: Run `npm run dev` and check for console errors

### Expected Behavior

- ✅ Weather data loads on the landing page
- ✅ Map displays with weather layers
- ✅ City search works
- ✅ Theme switching works
- ✅ No console errors

## 📚 Next Steps

1. **Read the Documentation**: Check out `/docs` folder for detailed guides
2. **Explore the Code**: Start with `/src/app/page.tsx` for the main page
3. **Run Tests**: Execute `npm test` to understand the test suite
4. **Make Changes**: Try modifying components and see the results

## 🆘 Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: Open an issue on GitHub
- **Code**: Review existing code for patterns
- **Tests**: Look at test files for usage examples

---

**Happy Coding!** 🚀
