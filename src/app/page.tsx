'use client'

import ErrorAlert from '@/components/ErrorAlert'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import LocationSearch from '@/components/LocationSearch'
import WeatherCard from '@/components/WeatherCard'
import { useWeather } from '@/hooks/useWeather'
import { Location,WeatherData } from '@/types/weather'
import { AnimatePresence,motion } from 'framer-motion'

export default function Home () {
	const {
		locations,
		currentLocation,
		weatherData,
		loading,
		error,
		getCurrentLocation,
		addLocation,
		removeLocation,
		searchCities,
		refreshAllWeather,
		clearError,
	}=useWeather()

	const handleLocationSelect=async ( weather: WeatherData ) => {
		const location: Location={
			id: `location-${Date.now()}`,
			name: weather.name,
			country: weather.sys.country,
			state: weather.state,
			lat: weather.coord.lat,
			lon: weather.coord.lon,
		}
		await addLocation( location )
	}

	const handleGetCurrentLocation=async () => {
		await getCurrentLocation()
	}

	const handleRefresh=async () => {
		await refreshAllWeather()
	}

	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* Light Theme Background with Animated Elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>

			{/* Animated Background Pattern */}
			<div className="absolute inset-0 opacity-30 animate-pulse" style={{
				backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
			}}></div>

			{/* Floating Elements - Light Theme */}
			<div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
			<div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-200/10 rounded-full blur-2xl animate-pulse delay-500"></div>

			<div className="relative z-10">
				{/* Header */}
				<Header
					onRefresh={handleRefresh}
					onGetCurrentLocation={handleGetCurrentLocation}
					loading={loading}
				/>

				{/* Main Content */}
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
					{/* Search Section */}
					<motion.div
						initial={{ opacity: 0,y: 20 }}
						animate={{ opacity: 1,y: 0 }}
						className="mb-8 flex justify-center"
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
									onRetry={error.code==='GEOLOCATION_ERROR'? handleGetCurrentLocation:undefined}
									onSearch={error.code==='GEOLOCATION_ERROR'? () => {
										// Focus on search input
										const searchInput=document.querySelector( 'input[type="text"]' ) as HTMLInputElement
										if ( searchInput ) {
											searchInput.focus()
										}
									}:undefined}
								/>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Loading State */}
					{loading&&locations.length===0&&!currentLocation&&(
						<div className="flex justify-center items-center py-20">
							<LoadingSpinner size="lg" text="Loading weather data..." />
						</div>
					)}

					{/* Weather Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{/* Current Location Weather */}
						<AnimatePresence>
							{currentLocation&&weatherData[ currentLocation.id ]&&(
								<div className="animate-fade-in-scale">
									<WeatherCard
										key={currentLocation.id}
										weather={weatherData[ currentLocation.id ]}
										location={currentLocation}
										isCurrentLocation={true}
									/>
								</div>
							)}
						</AnimatePresence>

						{/* Saved Locations Weather */}
						<AnimatePresence>
							{locations.map( ( location,index ) => (
								weatherData[ location.id ]&&(
									<div
										key={location.id}
										className="animate-fade-in-scale"
										style={{ animationDelay: `${index*100}ms` }}
									>
										<WeatherCard
											weather={weatherData[ location.id ]}
											location={location}
											onRemove={() => removeLocation( location.id )}
										/>
									</div>
								)
							) )}
						</AnimatePresence>
					</div>

					{/* Empty State */}
					{!loading&&locations.length===0&&!currentLocation&&!error&&(
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
								<p className="text-slate-600 text-lg mb-8 leading-relaxed">
									Get started by searching for a city or using your current location
								</p>
								<div className="space-y-4">
									<button
										onClick={handleGetCurrentLocation}
										className="btn-primary w-full text-lg py-4"
									>
										Use Current Location
									</button>
									<p className="text-slate-500 text-sm">
										Or search for any city above
									</p>
								</div>
							</div>
						</motion.div>
					)}
				</main>
			</div>
		</div>
	)
}
