'use client'

import { motion } from 'framer-motion'
import { MapPin,RefreshCw } from 'lucide-react'
import React from 'react'

interface HeaderProps {
	onRefresh: () => void
	onGetCurrentLocation: () => void
	loading?: boolean
}

const Header: React.FC<HeaderProps>=( {
	onRefresh,
	onGetCurrentLocation,
	loading=false,
} ) => {
	return (
		<header className="w-full py-6">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between">
					{/* Logo and Title */}
					<motion.div
						initial={{ opacity: 0,x: -20 }}
						animate={{ opacity: 1,x: 0 }}
						className="flex items-center space-x-3"
					>
						<div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl shadow-lg flex items-center justify-center">
							<span className="text-3xl">🌤️</span>
						</div>
						<div>
							<h1 className="text-4xl font-bold gradient-text-primary">CodeniWeather</h1>
							<p className="text-slate-600 text-sm font-medium">Your personal weather companion</p>
						</div>
					</motion.div>

					{/* Action Buttons */}
					<motion.div
						initial={{ opacity: 0,x: 20 }}
						animate={{ opacity: 1,x: 0 }}
						className="flex items-center space-x-4"
					>
						<button
							onClick={onGetCurrentLocation}
							disabled={loading}
							className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							<MapPin className="w-4 h-4" />
							<span className="hidden sm:inline font-medium">Current Location</span>
						</button>

						<button
							onClick={onRefresh}
							disabled={loading}
							className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							<RefreshCw className={`w-4 h-4 ${loading? 'animate-spin':''}`} />
							<span className="hidden sm:inline font-medium">Refresh</span>
						</button>
					</motion.div>
				</div>
			</div>
		</header>
	)
}

export default Header
