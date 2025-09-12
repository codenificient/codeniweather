'use client'

import ErrorAlert from '@/components/ErrorAlert'
import ForecastPanel from '@/components/ForecastPanel'
import LoadingSpinner from '@/components/LoadingSpinner'
import LocationSearch from '@/components/LocationSearch'
import { useWeather } from '@/contexts/WeatherContext'
import { WeatherAPI } from '@/lib/weather-api'
import { Location,WeatherData } from '@/types/weather'
import { AnimatePresence,motion } from 'framer-motion'
// Weather icons replaced with emojis
import Image from 'next/image'

export default function Home () {
	const {
		weatherData,
		forecastData,
		loading,
		error,
		addLocation,
		searchCities,
		clearError,
	}=useWeather()

	const weatherAPI=WeatherAPI.getInstance()

	const handleLocationSelect=async ( weather: WeatherData ) => {
		const location: Location={
			id: `location-${Date.now()}`,
			name: weather.name,
			country: weather.sys.country,
			state: weather.state,
			lat: weather.coord.lat,
			lon: weather.coord.lon,
		}

		// Add to saved locations
		await addLocation( location )
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

	// Get the first location's weather data if available
	const firstLocation=Object.keys( weatherData )[ 0 ]
	const currentWeather=firstLocation? weatherData[ firstLocation ]:null
	const currentForecast=firstLocation? forecastData[ firstLocation ]:null

	// Get the location name for display
	const getLocationName=() => {
		if ( !currentWeather ) return ''
		// Try to get the location name from the weather data
		return currentWeather.name||'Unknown Location'
	}

	return (
		<div className="w-full px-4 sm:px-6 lg:px-8 py-8">
			<motion.div
				initial={{ opacity: 0,y: 20 }}
				animate={{ opacity: 1,y: 0 }}
				className="space-y-8"
			>
				{/* Search Section */}
				<motion.div
					initial={{ opacity: 0,y: 20 }}
					animate={{ opacity: 1,y: 0 }}
					className="flex justify-center"
				>
					<LocationSearch
						onLocationSelect={handleLocationSelect}
						onSearch={searchCities}
						loading={loading}
					/>
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
											<div className="text-6xl font-bold gradient-text-primary mb-2">
												{getLocationName()}
											</div>
											<div className="text-xl text-slate-600 dark:text-slate-400 dark:text-slate-400 font-medium mb-2">
												{currentWeather.state? `${currentWeather.state}, ${currentWeather.sys.country}`:currentWeather.sys.country}
											</div>
											<div className="flex items-center space-x-3 mb-2">
												<span className="text-2xl">🌧️</span>
												<span className="text-xl text-slate-700 dark:text-slate-300 dark:text-slate-300 font-semibold">
													{getRainProbability( currentWeather )}% chance of rain
												</span>
											</div>
											<div className="text-4xl font-bold text-slate-800 dark:text-slate-200 dark:text-slate-200 mb-2">
												{weatherAPI.formatTemperature( currentWeather.main.temp )}
											</div>
											<div className="text-2xl text-slate-700 dark:text-slate-300 dark:text-slate-300 capitalize font-medium">
												{currentWeather.weather[ 0 ].description}
											</div>
											<div className="text-lg text-slate-600 dark:text-slate-400 dark:text-slate-400">
												Feels like {weatherAPI.formatTemperature( currentWeather.main.feels_like )}
											</div>
										</div>
									</div>
									<div className="text-right space-y-2">
										<div className="text-lg text-slate-700 dark:text-slate-300 dark:text-slate-300 font-medium">
											H: {weatherAPI.formatTemperature( currentWeather.main.temp_max )}
										</div>
										<div className="text-lg text-slate-700 dark:text-slate-300 dark:text-slate-300 font-medium">
											L: {weatherAPI.formatTemperature( currentWeather.main.temp_min )}
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
											<span className="font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">{weatherAPI.formatTemperature( currentWeather.main.temp )}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300 dark:text-slate-300">Feels like</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">{weatherAPI.formatTemperature( currentWeather.main.feels_like )}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300 dark:text-slate-300">Min</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">{weatherAPI.formatTemperature( currentWeather.main.temp_min )}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-700 dark:text-slate-300 dark:text-slate-300">Max</span>
											<span className="font-semibold text-slate-800 dark:text-slate-200 dark:text-slate-200">{weatherAPI.formatTemperature( currentWeather.main.temp_max )}</span>
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
											<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatWindSpeed( currentWeather.wind.speed )}</span>
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
							/>
						</div>
					</div>
				)}

				{/* Empty State */}
				{!currentWeather&&!loading&&(
					<motion.div
						initial={{ opacity: 0,y: 30 }}
						animate={{ opacity: 1,y: 0 }}
						transition={{ duration: 0.6,ease: "easeOut" }}
						className="text-center py-20"
					>
						<div className="glass-card-strong rounded-3xl p-12 max-w-lg mx-auto animate-pulse-glow">
							<div className="weather-icon-lg text-8xl mb-6">🌤️</div>
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
			</motion.div>
		</div>
	)
}