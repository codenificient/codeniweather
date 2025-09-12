'use client'

import WeatherMap from '@/components/WeatherMap'
import { useWeather } from '@/contexts/WeatherContext'
import { motion } from 'framer-motion'
import { MapPin,Navigation } from 'lucide-react'

export default function MapPage () {
	const { locations,weatherData }=useWeather()

	return (
		<div className="w-full px-4 sm:px-6 lg:px-8 py-8">
			<motion.div
				initial={{ opacity: 0,y: 20 }}
				animate={{ opacity: 1,y: 0 }}
				className="space-y-8"
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
					>
						<WeatherMap className="glass-card-strong rounded-3xl p-6" />
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
