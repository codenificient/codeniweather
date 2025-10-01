'use client'

import { useWeather } from '@/contexts/WeatherContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { motion } from 'framer-motion'
import { MapPin,Navigation } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'

// Dynamically import WeatherMap to prevent SSR issues
const WeatherMap=dynamic( () => import( '@/components/WeatherMap' ),{
	ssr: false,
	loading: () => (
		<div className="w-full h-96 glass-card-strong rounded-xl flex items-center justify-center">
			<div className="text-center">
				<div className="text-6xl mb-4">🗺️</div>
				<div className="text-xl font-semibold text-slate-800 dark:text-slate-200">Loading Map...</div>
			</div>
		</div>
	)
} )

export default function MapPage () {
	const { locations,weatherData }=useWeather()
	const analytics=useAnalytics()

	// Track page view
	useEffect( () => {
		analytics.trackPageView( '/map',{
			page: 'weather-map',
			locationsCount: locations.length,
			hasWeatherData: Object.keys( weatherData ).length>0
		} )
	},[ analytics,locations.length,weatherData ] )

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
						Weather Map
					</h1>
					<p className="text-slate-600 dark:text-slate-400 text-lg">
						Interactive weather visualization with multiple layers
					</p>
				</div>

				{/* Weather Map */}
				{locations.length>0? (
					<motion.div
						initial={{ opacity: 0,y: 30 }}
						animate={{ opacity: 1,y: 0 }}
						transition={{ duration: 0.6,ease: "easeOut" }}
						className="w-full"
					>
						<WeatherMap className="w-full" />
					</motion.div>
				):(
					/* Empty State */
					<motion.div
						initial={{ opacity: 0,y: 30 }}
						animate={{ opacity: 1,y: 0 }}
						transition={{ duration: 0.6,ease: "easeOut" }}
						className="text-center py-20"
					>
						<div className="glass-card-strong rounded-3xl p-12 max-w-lg mx-auto animate-pulse-glow">
							<div className="p-4 bg-blue-500/20 dark:bg-blue-400/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
								<MapPin className="w-10 h-10 text-blue-600 dark:text-blue-400" />
							</div>
							<h3 className="text-3xl font-bold gradient-text-primary mb-4">
								No Locations Yet
							</h3>
							<p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
								Add some cities to see them on the weather map. The map will show weather conditions across different regions.
							</p>
							<div className="space-y-4">
								<button
									onClick={() => window.location.href='/'}
									className="btn-primary w-full text-lg py-4 flex items-center justify-center space-x-2"
								>
									<Navigation className="w-5 h-5" />
									<span>Add Your First City</span>
								</button>
								<p className="text-slate-500 dark:text-slate-400 text-sm">
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
