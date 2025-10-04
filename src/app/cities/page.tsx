'use client'

import LoadingSpinner from '@/components/LoadingSpinner'
import WeatherCard from '@/components/WeatherCard'
import { useWeather } from '@/contexts/WeatherContext'
import { analytics } from '@/lib/analytics'
import { AnimatePresence,motion } from 'framer-motion'
// Icons replaced with emojis
import { useEffect } from 'react'

export default function CitiesPage () {
	const { locations,weatherData,loading,removeLocation,units,setCurrentLocation,currentLocation }=useWeather()

	const allLocations=locations

	// Track page view
	useEffect( () => {
		analytics.pageView( '/cities',{
			page: 'cities-list',
			citiesCount: allLocations.length,
			hasCurrentLocation: !!currentLocation,
			timestamp: Date.now()
		} )
	},[ allLocations.length,currentLocation ] )

	if ( loading&&allLocations.length===0 ) {
		return (
			<div className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-full">
				<div className="flex justify-center items-center py-20 h-full">
					<LoadingSpinner size="lg" text="Loading cities..." />
				</div>
			</div>
		)
	}

	return (
		<div className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-full">
			<motion.div
				initial={{ opacity: 0,y: 20 }}
				animate={{ opacity: 1,y: 0 }}
				className="space-y-8 h-full"
			>
				{/* Header */}
				<div className="text-center">
					<h1 className="text-4xl font-bold gradient-text-primary mb-4">
						Your Cities
					</h1>
					<p className="text-slate-600 text-lg">
						Manage your saved weather locations
					</p>
				</div>

				{/* Cities Grid */}
				{allLocations.length>0? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
						<AnimatePresence>
							{allLocations.map( ( location,index ) => {
								const weather=weatherData[ location.id ]
								const isCurrentLocation=currentLocation?.id===location.id


								return weather? (
									<motion.div
										key={location.id}
										initial={{ opacity: 0,y: 20 }}
										animate={{ opacity: 1,y: 0 }}
										exit={{ opacity: 0,y: -20 }}
										transition={{ delay: index*0.1 }}
										className="animate-fade-in-scale"
									>
										<WeatherCard
											weather={weather}
											location={location}
											isCurrentLocation={isCurrentLocation}
											onRemove={() => removeLocation( location.id )}
											onSetCurrent={() => setCurrentLocation( location )}
											units={units}
										/>
									</motion.div>
								):(
									// Show loading state for locations without weather data
									<motion.div
										key={location.id}
										initial={{ opacity: 0,y: 20 }}
										animate={{ opacity: 1,y: 0 }}
										transition={{ delay: index*0.1 }}
										className={`glass-card rounded-xl p-6 animate-pulse ${isCurrentLocation? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20':''}`}
									>
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-2">
												<h3 className="font-semibold text-slate-800 dark:text-slate-200">
													{location.name}
												</h3>
												{isCurrentLocation&&(
													<span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
														Current
													</span>
												)}
											</div>
											<div className="flex items-center gap-2">
												<button
													onClick={() => setCurrentLocation( location )}
													className={`p-2 rounded-xl transition-all duration-300 ${isCurrentLocation
														? 'text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
														:'text-green-400 dark:text-green-500 hover:text-green-300 dark:hover:text-green-400 hover:bg-green-500/10 dark:hover:bg-green-500/20'
														}`}
													title={isCurrentLocation? 'Current location':'Set as current location'}
												>
													<span className="text-lg">🏠</span>
												</button>
												<span className="text-2xl">⏳</span>
											</div>
										</div>
										<div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
											<p><strong>Location:</strong> {location.name}</p>
											{location.state&&(
												<p><strong>State/Province:</strong> {location.state}</p>
											)}
											<p><strong>Country:</strong> {location.country}</p>
											<p><strong>Coordinates:</strong> {location.lat?.toFixed( 4 )}, {location.lon?.toFixed( 4 )}</p>
											<div className="mt-4 text-center">
												<span className="text-slate-500 dark:text-slate-400 text-sm">
													Loading weather data...
												</span>
											</div>
										</div>
									</motion.div>
								)
							} )}
						</AnimatePresence>
					</div>
				):(
					/* Empty State */
					<motion.div
						initial={{ opacity: 0,y: 30 }}
						animate={{ opacity: 1,y: 0 }}
						transition={{ duration: 0.6,ease: "easeOut" }}
						className="text-center py-20"
					>
						<div className="glass-card-strong rounded-3xl p-12 max-w-lg mx-auto animate-pulse-glow">
							<div className="p-4 bg-blue-500/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
								<span className="text-4xl">📍</span>
							</div>
							<h3 className="text-3xl font-bold gradient-text-primary mb-4">
								No Cities Yet
							</h3>
							<p className="text-slate-600 text-lg mb-8 leading-relaxed">
								Start by adding cities from the Weather page or use your current location
							</p>
							<div className="space-y-4">
								<button
									onClick={() => window.location.href='/'}
									className="btn-primary w-full text-lg py-4 flex items-center justify-center space-x-2"
								>
									<span className="text-lg">➕</span>
									<span>Add Your First City</span>
								</button>
								<p className="text-slate-500 text-sm">
									Go to the Weather page to get started
								</p>
							</div>
						</div>
					</motion.div>
				)}
			</motion.div>
		</div>
	)
}
