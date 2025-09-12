'use client'

import LoadingSpinner from '@/components/LoadingSpinner'
import WeatherCard from '@/components/WeatherCard'
import { useWeather } from '@/contexts/WeatherContext'
import { AnimatePresence,motion } from 'framer-motion'
// Icons replaced with emojis

export default function CitiesPage () {
	const { locations,weatherData,loading,removeLocation }=useWeather()

	const allLocations=locations

	if ( loading&&allLocations.length===0 ) {
		return (
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex justify-center items-center py-20">
					<LoadingSpinner size="lg" text="Loading cities..." />
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<motion.div
				initial={{ opacity: 0,y: 20 }}
				animate={{ opacity: 1,y: 0 }}
				className="space-y-8"
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
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<AnimatePresence>
							{allLocations.map( ( location,index ) => {
								const weather=weatherData[ location.id ]
								const isCurrentLocation=location.isCurrentLocation||false

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
										/>
									</motion.div>
								):null
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
