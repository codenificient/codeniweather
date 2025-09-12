# CodeniWeather 🌤️

A modern, responsive weather application built with Next.js 14, TypeScript, and Tailwind CSS. Track weather for multiple locations with real-time updates and a beautiful glass-morphism design.

## Features

- 🌍 **Current Location Weather** - Automatically detect and display weather for your current location
- 🔍 **City Search** - Search and add weather for any city worldwide
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 💾 **Local Storage** - Save your favorite locations locally
- 🔄 **Real-time Updates** - Refresh weather data with a single click
- 🎨 **Modern UI** - Glass-morphism design with smooth animations
- ⚡ **Fast Performance** - Built with Next.js 14 and optimized for speed

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API**: OpenWeatherMap
- **State Management**: Custom React Hooks

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenWeatherMap API key (free)

### Quick Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd codeniweather
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

4. **Get your API key**

   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key
   - Copy the key to your `.env.local` file

5. **Start the application**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Configuration

For detailed environment setup instructions, see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).

**Required:**

- `NEXT_PUBLIC_OPENWEATHER_API_KEY` - Your OpenWeatherMap API key

**Optional:**

- `NEXT_PUBLIC_IPAPI_KEY` - Alternative geolocation service
- `NEXT_PUBLIC_CACHE_DURATION` - Weather data cache duration (default: 10 minutes)
- `NEXT_PUBLIC_RATE_LIMIT` - API rate limit (default: 60 calls/minute)

### Manual Installation

If you prefer manual setup:

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create environment file**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API key
   ```

3. **Build and run**
   ```bash
   npm run build
   npm run dev
   ```

### Testing the Application

Run the demo script to test functionality:

```bash
node demo.js
```

## Usage

1. **Get Current Location Weather**

   - Click the "Current Location" button to automatically detect your location
   - Grant location permissions when prompted

2. **Add New Locations**

   - Use the search bar to find any city worldwide
   - Click on search results to add them to your weather dashboard

3. **Manage Locations**

   - View weather for all your saved locations
   - Remove locations by clicking the "×" button on each card
   - Refresh all weather data using the refresh button

4. **View Weather Details**
   - Current temperature and conditions
   - Feels like temperature
   - Humidity, wind speed, and direction
   - Visibility and pressure
   - Sunrise and sunset times

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ErrorAlert.tsx
│   ├── Header.tsx
│   ├── LoadingSpinner.tsx
│   ├── LocationSearch.tsx
│   └── WeatherCard.tsx
├── hooks/              # Custom React hooks
│   └── useWeather.ts
├── lib/                # Utility libraries
│   ├── geolocation.ts
│   ├── storage.ts
│   └── weather-api.ts
└── types/              # TypeScript type definitions
    └── weather.ts
```

## API Integration

The app uses the OpenWeatherMap API for weather data:

- **Current Weather**: `/weather` endpoint
- **City Search**: `/find` endpoint
- **Geocoding**: `/geo/1.0/reverse` endpoint

## Customization

### Styling

The app uses Tailwind CSS with custom configuration. You can modify:

- Colors in `tailwind.config.js`
- Global styles in `src/app/globals.css`
- Component styles in individual component files

### Weather Data

Extend the weather display by modifying:

- `WeatherCard.tsx` for additional weather metrics
- `weather-api.ts` for new API endpoints
- `types/weather.ts` for new data structures

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [Lucide](https://lucide.dev/) for beautiful icons
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
