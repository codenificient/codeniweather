# Environment Setup Guide

This guide will help you set up the necessary environment variables for CodeniWeather to function properly.

## Quick Start

1. **Copy the example file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Get your OpenWeatherMap API key:**

   - Visit [OpenWeatherMap API](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key
   - Copy the key to your `.env.local` file

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Required Environment Variables

### `NEXT_PUBLIC_OPENWEATHER_API_KEY`

- **Required**: Yes
- **Description**: Your OpenWeatherMap API key for weather data
- **How to get**: Sign up at [OpenWeatherMap](https://openweathermap.org/api)
- **Free tier**: 1,000 calls/day, 60 calls/minute

## Optional Environment Variables

### `NEXT_PUBLIC_IPAPI_KEY`

- **Required**: No
- **Description**: Alternative IP geolocation service
- **How to get**: Sign up at [IPAPI](https://ipapi.co/api/)
- **Use case**: Fallback when OpenWeatherMap geocoding fails

### `NEXT_PUBLIC_WEATHER_ALERTS_API_KEY`

- **Required**: No
- **Description**: For severe weather notifications
- **How to get**: Upgrade to OpenWeatherMap One Call API 3.0
- **Use case**: Weather alerts and warnings

### `NEXT_PUBLIC_ANALYTICS_ID`

- **Required**: No
- **Description**: Analytics tracking ID
- **How to get**: Set up Google Analytics or similar
- **Use case**: Usage analytics and performance monitoring

## Configuration Options

### `NODE_ENV`

- **Default**: `development`
- **Options**: `development`, `production`
- **Description**: Environment mode for the application

### `NEXT_PUBLIC_CACHE_DURATION`

- **Default**: `10` (minutes)
- **Description**: How long to cache weather data
- **Range**: 1-60 minutes
- **Note**: Longer cache = fewer API calls but less fresh data

### `NEXT_PUBLIC_RATE_LIMIT`

- **Default**: `60` (calls per minute)
- **Description**: Maximum API calls per minute
- **Note**: Adjust based on your API plan limits

## File Structure

```
codeniweather/
├── .env.example          # Template file (safe to commit)
├── .env.local           # Your actual keys (DO NOT COMMIT)
├── .env.development     # Development-specific variables
└── .env.production      # Production-specific variables
```

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit `.env.local`** to version control
2. **Use different API keys** for development and production
3. **Rotate API keys** regularly
4. **Monitor API usage** to avoid unexpected charges
5. **Use environment-specific files** for different deployments

## Troubleshooting

### Common Issues

**"API key not found" error:**

- Make sure your `.env.local` file exists
- Verify the variable name is exactly `NEXT_PUBLIC_OPENWEATHER_API_KEY`
- Restart your development server after adding the key

**"Invalid API key" error:**

- Check that your API key is correct
- Ensure your OpenWeatherMap account is activated
- Verify you haven't exceeded your API limits

**"CORS error" in browser:**

- This is normal for development
- The error should resolve once you add a valid API key
- Make sure you're using `NEXT_PUBLIC_` prefix for client-side variables

### Getting Help

1. Check the [OpenWeatherMap API documentation](https://openweathermap.org/api)
2. Verify your API key is working at [OpenWeatherMap Test](https://openweathermap.org/current)
3. Check the browser console for detailed error messages
4. Ensure your `.env.local` file is in the project root directory

## Example Working Configuration

```bash
# .env.local
NEXT_PUBLIC_OPENWEATHER_API_KEY=1234567890abcdef1234567890abcdef
NODE_ENV=development
NEXT_PUBLIC_CACHE_DURATION=10
```

## Next Steps

Once you have your environment set up:

1. **Test the app**: Run `npm run dev` and check if weather data loads
2. **Add locations**: Try searching for cities and using current location
3. **Customize settings**: Adjust cache duration and rate limits as needed
4. **Deploy**: Set up production environment variables for deployment

For deployment instructions, see the main README.md file.
