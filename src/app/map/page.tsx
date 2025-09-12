'use client'

import { motion } from 'framer-motion'
import { Map,MapPin,Navigation } from 'lucide-react'

export default function MapPage () {
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
						Weather Map
					</h1>
					<p className="text-slate-600 text-lg">
						Interactive weather map coming soon
					</p>
				</div>

				{/* Placeholder Content */}
				<motion.div
					initial={{ opacity: 0,y: 30 }}
					animate={{ opacity: 1,y: 0 }}
					transition={{ duration: 0.6,ease: "easeOut" }}
					className="text-center py-20"
				>
					<div className="glass-card-strong rounded-3xl p-12 max-w-lg mx-auto animate-pulse-glow">
						<div className="p-4 bg-green-500/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
							<Map className="w-10 h-10 text-green-600" />
						</div>
						<h3 className="text-3xl font-bold gradient-text-primary mb-4">
							Map Feature Coming Soon
						</h3>
						<p className="text-slate-600 text-lg mb-8 leading-relaxed">
							We&apos;re working on an interactive weather map that will show weather conditions across different regions.
						</p>
						<div className="space-y-4">
							<div className="flex items-center justify-center space-x-4 text-slate-500">
								<div className="flex items-center space-x-2">
									<MapPin className="w-4 h-4" />
									<span>Location markers</span>
								</div>
								<div className="flex items-center space-x-2">
									<Navigation className="w-4 h-4" />
									<span>Weather layers</span>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</motion.div>
		</div>
	)
}
