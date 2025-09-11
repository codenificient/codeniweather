# Troubleshooting Guide

This guide helps you resolve common issues with CodeniWeather.

## API Key Issues

### Problem: "Invalid API key" Error

**Symptoms:**

- Error message: "Invalid API key. Please see https://openweathermap.org/faq#error401"
- City search not working
- Weather data not loading

**Solutions:**

#### 1. Check API Key Activation

- **New API keys** can take up to 2 hours to activate
- Visit [OpenWeatherMap API](https://openweathermap.org/api) to verify your key
- Make sure you're logged into the correct account

#### 2. Verify API Key Format

Run the debug script to check your key:

```bash
npm run debug-api
```

Your API key should:

- Be exactly 32 characters long
- Contain only letters (a-f) and numbers (0-9)
- Not have any spaces or special characters

#### 3. Check API Key in .env.local

```bash
# Check if the key is set correctly
grep "NEXT_PUBLIC_OPENWEATHER_API_KEY" .env.local
```

The line should look like:

```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_32_character_hex_key_here
```

#### 4. Test API Key Manually

Visit this URL in your browser (replace YOUR_API_KEY):

```
https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY&units=metric
```

If you see weather data, the key is working. If you see an error, the key is invalid.

#### 5. Generate a New API Key

If the key is still not working:

1. Go to [OpenWeatherMap API](https://openweathermap.org/api)
2. Log into your account
3. Go to "My API keys"
4. Generate a new key
5. Update your `.env.local` file
6. Restart the development server

### Problem: "API rate limit exceeded"

**Symptoms:**

- Error message: "API rate limit exceeded"
- Requests work sometimes but fail frequently

**Solutions:**

- Wait a few minutes before trying again
- Check your API plan limits at [OpenWeatherMap](https://openweathermap.org/api)
- Free tier: 1,000 calls/day, 60 calls/minute

### Problem: "Network error" or "Connection refused"

**Symptoms:**

- Error message: "Network error" or "ECONNREFUSED"
- App works sometimes but fails randomly

**Solutions:**

- Check your internet connection
- Try again in a few minutes
- Check if OpenWeatherMap is down: [Status Page](https://status.openweathermap.org/)

## Environment Setup Issues

### Problem: "API key not found"

**Symptoms:**

- Error message: "OpenWeatherMap API key is not configured"
- Environment variables not loading

**Solutions:**

#### 1. Check .env.local File

```bash
# Make sure the file exists
ls -la .env.local

# Check the content
cat .env.local
```

#### 2. Verify File Location

The `.env.local` file must be in the project root directory:

```
codeniweather/
├── .env.local          ← Must be here
├── .env.example
├── package.json
└── src/
```

#### 3. Check File Format

Make sure there are no spaces around the `=` sign:

```env
# Correct
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key_here

# Incorrect
NEXT_PUBLIC_OPENWEATHER_API_KEY = your_key_here
```

#### 4. Restart Development Server

After changing environment variables:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## Location Issues

### Problem: "Location request timed out"

**Symptoms:**

- Error message: "Location request timed out"
- Current location not working

**Solutions:**

- Check browser location permissions
- Try searching for a city manually
- Use a different browser
- Check if you're on HTTPS (required for geolocation)

### Problem: "Location access denied"

**Symptoms:**

- Error message: "Location access denied"
- Browser asking for location permission

**Solutions:**

- Click "Allow" when browser asks for location permission
- Check browser settings for location permissions
- Try refreshing the page

## Development Issues

### Problem: "Module not found" errors

**Symptoms:**

- Error message: "Module not found" or "Cannot resolve module"
- App won't start

**Solutions:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use yarn
rm -rf node_modules yarn.lock
yarn install
```

### Problem: Build errors

**Symptoms:**

- Error during `npm run build`
- TypeScript errors

**Solutions:**

```bash
# Check for TypeScript errors
npm run lint

# Fix common issues
npm run build
```

### Problem: Port already in use

**Symptoms:**

- Error: "Port 3000 is already in use"
- App won't start

**Solutions:**

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

## Testing Your Setup

### 1. Test Environment Variables

```bash
npm run test-env
```

### 2. Test API Key

```bash
npm run test-api
```

### 3. Debug API Issues

```bash
npm run debug-api
```

### 4. Test the App

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Getting Help

### 1. Check the Logs

Open browser developer tools (F12) and check the Console tab for error messages.

### 2. Check Network Tab

In browser developer tools, check the Network tab to see if API requests are being made and what responses you're getting.

### 3. Common Error Codes

- **401**: Invalid API key
- **429**: Rate limit exceeded
- **404**: API endpoint not found
- **500**: Server error

### 4. Still Having Issues?

1. Check this troubleshooting guide again
2. Verify your API key at [OpenWeatherMap](https://openweathermap.org/api)
3. Make sure you're using the latest version of the app
4. Check the [OpenWeatherMap FAQ](https://openweathermap.org/faq)

## Quick Fixes

### Reset Everything

```bash
# Stop the app
# Then run:
rm -rf node_modules package-lock.json .next
npm install
cp .env.example .env.local
# Edit .env.local with your API key
npm run dev
```

### Check API Key Status

```bash
# Test your API key
curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY&units=metric"
```

Replace `YOUR_API_KEY` with your actual API key.
