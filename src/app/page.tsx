'use client'

import ErrorAlert from '@/components/ErrorAlert'
import ForecastPanel from '@/components/ForecastPanel'
import LoadingSpinner from '@/components/LoadingSpinner'
import LocationSearch from '@/components/LocationSearch'
import { useWeather } from '@/contexts/WeatherContext'
import { analytics } from '@/lib/analytics'
import { WeatherAPI } from '@/lib/weather-api'
import { Location,WeatherData } from '@/types/weather'
import { AnimatePresence,motion } from 'framer-motion'
// Weather icons replaced with emojis
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Home () {
	const {
		weatherData,
		forecastData,
		loading,
		error,
		addLocation,
		searchCities,
		clearError,
		units,
		currentLocation,
		setCurrentLocation,
		locations,
	}=useWeather()

	const weatherAPI=WeatherAPI.getInstance()

	// Analytics testing state
	const [analyticsData, setAnalyticsData] = useState<any>(null)
	const [testingAnalytics, setTestingAnalytics] = useState(false)
	const [fetchingAnalytics, setFetchingAnalytics] = useState(false)

	// Track page view
	useEffect( () => {
		analytics.pageView( '/',{
			page: 'weather-dashboard',
			hasCurrentLocation: !!currentLocation,
			locationsCount: locations.length,
			timestamp: Date.now()
		} )
	},[ locations.length, currentLocation ] )

	// Send test analytics event
	const handleTestAnalytics = async () => {
		setTestingAnalytics(true)
		try {
			await analytics.track('analytics_test', {
				source: 'landing_page_test',
				timestamp: new Date().toISOString(),
				test: true,
				randomValue: Math.random()
			})
			console.log('✅ Test event sent successfully')
			alert('Test analytics event sent successfully! Check console for details.')
		} catch (error) {
			console.error('❌ Failed to send test event:', error)
			alert('Failed to send test event. Check console for details.')
		} finally {
			setTestingAnalytics(false)
		}
	}

	// Fetch analytics data
	const handleFetchAnalytics = async () => {
		setFetchingAnalytics(true)
		try {
			const response = await fetch('https://analytics-dashboard-phi-six.vercel.app/api/analytics?projectId=proj_codeniweather_main', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer proj_codeniweather_main`
				}
			})

			if (!response.ok) {
				throw new Error(`Failed to fetch analytics: ${response.status}`)
			}

			const data = await response.json()
			setAnalyticsData(data)
			console.log('📊 Analytics data:', data)
		} catch (error) {
			console.error('❌ Failed to fetch analytics:', error)
			alert('Failed to fetch analytics. Check console for details.')
		} finally {
			setFetchingAnalytics(false)
		}
	}

	const handleLocationSelect=async ( weather: WeatherData ) => {
		const location: Location={
			id: `location-${Date.now()}`,
			name: weather.name,
			country: weather.sys.country,
			state: weather.state,
			lat: weather.coord.lat,
			lon: weather.coord.lon,
		}

		try {
			// Add to saved locations
			await addLocation( location )

			// Track location addition
			analytics.track( 'location_added',{
				name: location.name,
				state: location.state,
				country: location.country
			} )
		} catch ( err ) {
			console.error( 'Error adding location:',err )			
		}
	}

	const getWeatherIcon=( iconCode: string ) => {
		return weatherAPI.getWeatherIconUrl( iconCode )
	}

	const getWindDirection=( deg: number ) => {
		return weatherAPI.getWindDirection( deg )
	}

	const getRainProbability=( weather: WeatherData ) => {
		// Calculate rain probability based on weather conditions
		const weatherMain=weather.weather[ 0 ].main.toLowerCase()
		const humidity=weather.main.humidity
		const cloudCover=weather.clouds.all
		const description=weather.weather[ 0 ].description.toLowerCase()

		// Base probability from weather condition
		let baseProbability=0
		if ( weatherMain.includes( 'rain' )||weatherMain.includes( 'drizzle' ) ) {
			baseProbability=80
		} else if ( weatherMain.includes( 'thunderstorm' ) ) {
			baseProbability=90
		} else if ( weatherMain.includes( 'snow' ) ) {
			baseProbability=70
		} else if ( weatherMain.includes( 'clouds' ) ) {
			baseProbability=30
		} else if ( weatherMain.includes( 'clear' ) ) {
			baseProbability=5
		}

		// Adjust based on humidity and cloud cover
		const humidityFactor=humidity/100*20 // 0-20% based on humidity
		const cloudFactor=cloudCover/100*30 // 0-30% based on cloud cover

		// Additional adjustments for specific descriptions
		let descriptionAdjustment=0
		if ( description.includes( 'heavy' ) ) descriptionAdjustment+=20
		if ( description.includes( 'light' ) ) descriptionAdjustment+=10
		if ( description.includes( 'moderate' ) ) descriptionAdjustment+=15
		if ( description.includes( 'scattered' ) ) descriptionAdjustment+=25
		if ( description.includes( 'broken' ) ) descriptionAdjustment+=15

		const totalProbability=Math.min( 100,Math.max( 0,baseProbability+humidityFactor+cloudFactor+descriptionAdjustment ) )
		return Math.round( totalProbability )
	}

	const formatTime=( timestamp: number ) => {
		return weatherAPI.getTimeFromTimestamp( timestamp )
	}

	// Get the current location's weather data if available
	const currentWeather=currentLocation? weatherData[ currentLocation.id ]:null
	const currentForecast=currentLocation? forecastData[ currentLocation.id ]:null

	// Get the location name for display
	const getLocationName=() => {
		if ( !currentLocation ) return ''
		return currentLocation.name||'Unknown Location'
	}

	return (
		<div className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-full">
			<motion.div
				initial={{ opacity: 0,y: 20 }}
				animate={{ opacity: 1,y: 0 }}
				className="space-y-8 h-full"
			>
				{/* Search Section */}
				<motion.div
					initial={{ opacity: 0,y: 20 }}
					animate={{ opacity: 1,y: 0 }}
					className="flex justify-center"
				>
					<div className="flex items-center gap-4 w-full max-w-2xl">
						<div className="flex-1">
							<LocationSearch
								onLocationSelect={handleLocationSelect}
								onSearch={searchCities}
								loading={loading}
							/>
						</div>
						{/* Current Location Selector */}
						{locations.length>0&&(
							<div className="flex items-center gap-2">
								<span className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">📍</span>
								<select
									value={currentLocation?.id||''}
									onChange={( e ) => {
										const selectedLocation=locations.find( loc => loc.id===e.target.value )
										if ( selectedLocation ) {
											setCurrentLocation( selectedLocation )
										}
									}}
									className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[200px]"
								>
									<option value="">Select location...</option>
									{locations.map( ( location ) => (
										<option key={location.id} value={location.id}>
											{location.name}{location.state? `, ${location.state}`:''}, {location.country}
										</option>
									) )}
								</select>
							</div>
						)}
					</div>
				</motion.div>

				{/* Error Display */}
				<AnimatePresence>
					{error&&(
						<motion.div
							initial={{ opacity: 0,y: -20 }}
							animate={{ opacity: 1,y: 0 }}
							exit={{ opacity: 0,y: -20 }}
							className="mb-6"
						>
							<ErrorAlert
								error={error}
								onDismiss={clearError}
							/>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Loading State */}
				{loading&&!currentWeather&&(
					<div className="flex justify-center items-center py-20">
						<LoadingSpinner size="lg" text="Loading weather data..." />
					</div>
				)}

				{/* Loading State for Locations without Weather Data */}
				{!loading&&!currentWeather&&locations.length>0&&(
					<motion.div
						initial={{ opacity: 0,y: 30 }}
						animate={{ opacity: 1,y: 0 }}
						transition={{ duration: 0.6,ease: "easeOut" }}
						className="text-center py-20"
					>
						<div className="glass-card-strong rounded-3xl p-12 max-w-lg mx-auto">
							<div className="flex justify-center mb-6">
								<div className="relative">
									<Image
										src="/favicon.svg"
										alt="CodeniWeather"
										className="w-20 h-20 animate-pulse"
									/>
									<div className="absolute inset-0 flex items-center justify-center">
										<span className="text-2xl animate-spin">⏳</span>
									</div>
								</div>
							</div>
							<h3 className="text-3xl font-bold gradient-text-primary mb-4">
								Loading Weather Data
							</h3>
							<p className="text-slate-700 dark:text-slate-300 text-lg mb-8 leading-relaxed">
								Fetching weather information for your locations...
							</p>
							<div className="space-y-4">
								<p className="text-slate-600 dark:text-slate-400 text-sm">
									This may take a few moments
								</p>
							</div>
						</div>
					</motion.div>
				)}

				{/* Weather Display */}
				{currentWeather&&(
					<div className="grid grid-cols-1 xl:grid-cols-6 gap-8">
						{/* Main Weather Content */}
						<div className="xl:col-span-4 space-y-8">
							{/* Current Weather Card */}
							<div className="glass-card-strong rounded-3xl p-8">
								<div className="flex items-center justify-between mb-8">
									<div className="flex items-center space-x-8">
										<Image
											src={getWeatherIcon( currentWeather.weather[ 0 ].icon )}
											alt={currentWeather.weather[ 0 ].description}
											width={115}
											height={115}
											className="filter drop-shadow-2xl"
										/>
										<div>
											<div className="text-6xl font-bold gradient-text-primary mb-2 leading-tight">
												{getLocationName()}
											</div>
											<div className="text-xl text-slate-600 dark:text-slate-400 dark:text-slate-400 font-medium mb-2 leading-relaxed">
												{currentLocation?.state? `${currentLocation.state}, ${currentLocation.country}`:currentLocation?.country}
											</div>
											<div className="flex items-center space-x-3 mb-2">
												<span className="text-2xl">🌧️</span>
												<span className="text-xl text-slate-700 dark:text-slate-300 dark:text-slate-300 font-semibold">
													{getRainProbability( currentWeather )}% chance of rain
												</span>
											</div>
											<div className="text-4xl font-bold text-slate-800 dark:text-slate-200 dark:text-slate-200 mb-2 leading-tight">
												{weatherAPI.formatTemperature( currentWeather.main.temp,units )}
											</div>
											<div className="text-2xl text-slate-700 dark:text-slate-300 dark:text-slate-300 capitalize font-medium leading-relaxed">
												{currentWeather.weather[ 0 ].description}
											</div>
											<div className="text-lg text-slate-600 dark:text-slate-400 dark:text-slate-400">
												Feels like {weatherAPI.formatTemperature( currentWeather.main.feels_like,units )}
											</div>
										</div>
									</div>
									<div className="text-right space-y-2">
										<div className="text-lg text-slate-700 dark:text-slate-300 dark:text-slate-300 font-medium">
											H: {weatherAPI.formatTemperature( currentWeather.main.temp_max,units )}
										</div>
										<div className="text-lg text-slate-700 dark:text-slate-300 dark:text-slate-300 font-medium">
											L: {weatherAPI.formatTemperature( currentWeather.main.temp_min,units )}
										</div>
									</div>
								</div>
							</div>

							{/* Weather Details Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{/* Temperature Details */}
								<div className="glass-card rounded-2xl p-6">
									<div className="flex items-center space-x-3 mb-4">
										<div className="p-2 bg-orange-500/20 rounded-xl">
											<span className="text-2xl">🌡️</span>
										</div>
										<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">Temperature</h3>
									</div>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300 dark:text-slate-300">Current</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">{weatherAPI.formatTemperature( currentWeather.main.temp,units )}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300 dark:text-slate-300">Feels like</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">{weatherAPI.formatTemperature( currentWeather.main.feels_like,units )}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300 dark:text-slate-300">Min</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">{weatherAPI.formatTemperature( currentWeather.main.temp_min,units )}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300 dark:text-slate-300">Max</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">{weatherAPI.formatTemperature( currentWeather.main.temp_max,units )}</span>
										</div>
									</div>
								</div>

								{/* Wind Details */}
								<div className="glass-card rounded-2xl p-6">
									<div className="flex items-center space-x-3 mb-4">
										<div className="p-2 bg-blue-500/20 rounded-xl">
											<span className="text-2xl">💨</span>
										</div>
										<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">Wind</h3>
									</div>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Speed</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatWindSpeed( currentWeather.wind.speed,units )}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Direction</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
												<span className="text-lg mr-1">🧭</span>
												{getWindDirection( currentWeather.wind.deg )}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Degrees</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{currentWeather.wind.deg}°</span>
										</div>
									</div>
								</div>

								{/* Humidity & Pressure */}
								<div className="glass-card rounded-2xl p-6">
									<div className="flex items-center space-x-3 mb-4">
										<div className="p-2 bg-cyan-500/20 rounded-xl">
											<span className="text-2xl">💧</span>
										</div>
										<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">Humidity</h3>
									</div>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Humidity</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatHumidity( currentWeather.main.humidity )}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Pressure</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatPressure( currentWeather.main.pressure )}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Clouds</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{currentWeather.clouds.all}%</span>
										</div>
									</div>
								</div>

								{/* Visibility */}
								<div className="glass-card rounded-2xl p-6">
									<div className="flex items-center space-x-3 mb-4">
										<div className="p-2 bg-purple-500/20 rounded-xl">
											<span className="text-2xl">👁️</span>
										</div>
										<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">Visibility</h3>
									</div>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Distance</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatVisibility( currentWeather.visibility )}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Cloud Cover</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{currentWeather.clouds.all}%</span>
										</div>
									</div>
								</div>

								{/* Sunrise/Sunset */}
								<div className="glass-card rounded-2xl p-6">
									<div className="flex items-center space-x-3 mb-4">
										<div className="p-2 bg-yellow-500/20 rounded-xl">
											<span className="text-2xl">🌅</span>
										</div>
										<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">Sun Times</h3>
									</div>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Sunrise</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{formatTime( currentWeather.sys.sunrise )}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Sunset</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{formatTime( currentWeather.sys.sunset )}</span>
										</div>
									</div>
								</div>

								{/* Additional Info */}
								<div className="glass-card rounded-2xl p-6">
									<div className="flex items-center space-x-3 mb-4">
										<div className="p-2 bg-green-500/20 rounded-xl">
											<span className="text-2xl">⚙️</span>
										</div>
										<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">Additional</h3>
									</div>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Last Updated</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
												{new Date( currentWeather.dt*1000 ).toLocaleTimeString()}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300">Coordinates</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
												{currentWeather.coord.lat.toFixed( 2 )}, {currentWeather.coord.lon.toFixed( 2 )}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Forecast Panel */}
						<div className="xl:col-span-2">
							<ForecastPanel
								forecast={currentForecast||[]}
								loading={loading}
								units={units}
							/>
						</div>
					</div>
				)}

				{/* Empty State */}
				{!currentWeather&&!loading&&locations.length===0&&(
					<motion.div
						initial={{ opacity: 0,y: 30 }}
						animate={{ opacity: 1,y: 0 }}
						transition={{ duration: 0.6,ease: "easeOut" }}
						className="text-center py-20"
					>
						<div className="glass-card-strong rounded-3xl p-12 max-w-lg mx-auto animate-pulse-glow">
							<div className="flex justify-center mb-6">
								<Image
									src="/favicon.svg"
									alt="CodeniWeather"
									className="w-24 h-24"
								/>
							</div>
							<h3 className="text-3xl font-bold gradient-text-primary mb-4">
								Welcome to CodeniWeather
							</h3>
							<p className="text-slate-700 dark:text-slate-300 text-lg mb-8 leading-relaxed">
								Get started by searching for a city to view weather information
							</p>
							<div className="space-y-4">
								<p className="text-slate-600 dark:text-slate-400 text-sm">
									Search for any city above to get started
								</p>
							</div>
						</div>
					</motion.div>
				)}

				{/* Analytics Testing Panel */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="mt-8"
				>
					<div className="glass-card-strong rounded-3xl p-8 max-w-4xl mx-auto">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center space-x-3">
								<div className="p-2 bg-purple-500/20 rounded-xl">
									<span className="text-2xl">📊</span>
								</div>
								<h2 className="text-2xl font-bold gradient-text-primary">Analytics Testing</h2>
							</div>
							<span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
								API Key: proj_codeniweather_main
							</span>
						</div>

						<div className="grid md:grid-cols-2 gap-4 mb-6">
							<button
								onClick={handleTestAnalytics}
								disabled={testingAnalytics}
								className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<div className="flex items-center space-x-3 mb-2">
									<span className="text-3xl">{testingAnalytics ? '⏳' : '🚀'}</span>
									<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
										Send Test Event
									</h3>
								</div>
								<p className="text-sm text-slate-600 dark:text-slate-400">
									{testingAnalytics ? 'Sending test event...' : 'Click to send a test analytics event'}
								</p>
							</button>

							<button
								onClick={handleFetchAnalytics}
								disabled={fetchingAnalytics}
								className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<div className="flex items-center space-x-3 mb-2">
									<span className="text-3xl">{fetchingAnalytics ? '⏳' : '📈'}</span>
									<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
										Fetch Analytics
									</h3>
								</div>
								<p className="text-sm text-slate-600 dark:text-slate-400">
									{fetchingAnalytics ? 'Fetching data...' : 'Click to fetch analytics data'}
								</p>
							</button>
						</div>

						{analyticsData && (
							<div className="glass-card rounded-2xl p-6">
								<div className="flex items-center space-x-2 mb-4">
									<span className="text-xl">📊</span>
									<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
										Analytics Data
									</h3>
								</div>
								<pre className="bg-slate-900 dark:bg-slate-950 text-green-400 p-4 rounded-xl overflow-x-auto text-xs">
									{JSON.stringify(analyticsData, null, 2)}
								</pre>
							</div>
						)}
					</div>
				</motion.div>
			</motion.div>
		</div>
	)
}