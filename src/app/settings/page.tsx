'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useWeather } from '@/contexts/WeatherContext'
import { motion } from 'framer-motion'
import { Bell,Globe,Palette,Settings,Shield } from 'lucide-react'

export default function SettingsPage () {
	const { theme,toggleTheme }=useTheme()
	const { units,setUnits }=useWeather()

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
						Settings
					</h1>
					<p className="text-slate-600 dark:text-slate-400 text-lg">
						Customize your weather experience
					</p>
				</div>

				{/* Settings Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Theme Settings */}
					<motion.div
						initial={{ opacity: 0,y: 20 }}
						animate={{ opacity: 1,y: 0 }}
						transition={{ delay: 0.1 }}
						className="glass-card rounded-2xl p-6"
					>
						<div className="flex items-center space-x-3 mb-4">
							<div className="p-2 bg-purple-500/20 dark:bg-purple-400/20 rounded-xl">
								<Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
							</div>
							<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Theme</h3>
						</div>
						<p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
							Customize the appearance of your weather app
						</p>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-slate-600 dark:text-slate-400">Dark Mode</span>
								<button
									onClick={toggleTheme}
									className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${theme==='dark'
										? 'bg-blue-500 dark:bg-blue-600'
										:'bg-slate-300 dark:bg-slate-600'
										}`}
									aria-label={`Switch to ${theme==='dark'? 'light':'dark'} mode`}
								>
									<div
										className={`w-5 h-5 bg-white dark:bg-slate-200 rounded-full absolute top-0.5 transition-transform duration-200 ${theme==='dark'? 'right-0.5':'left-0.5'
											}`}
									></div>
								</button>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-slate-600 dark:text-slate-400">Temperature Unit</span>
								<select
									value={units}
									onChange={( e ) => setUnits( e.target.value as 'metric'|'imperial' )}
									className="text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded px-2 py-1"
								>
									<option value="metric">Celsius (°C)</option>
									<option value="imperial">Fahrenheit (°F)</option>
								</select>
							</div>
						</div>
					</motion.div>

					{/* Location Settings */}
					<motion.div
						initial={{ opacity: 0,y: 20 }}
						animate={{ opacity: 1,y: 0 }}
						transition={{ delay: 0.2 }}
						className="glass-card rounded-2xl p-6"
					>
						<div className="flex items-center space-x-3 mb-4">
							<div className="p-2 bg-blue-500/20 dark:bg-blue-400/20 rounded-xl">
								<Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
							</div>
							<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Location</h3>
						</div>
						<p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
							Manage location permissions and preferences
						</p>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-slate-600 dark:text-slate-400">Auto-detect Location</span>
								<div className="w-12 h-6 bg-green-500 dark:bg-green-600 rounded-full relative">
									<div className="w-5 h-5 bg-white dark:bg-slate-200 rounded-full absolute top-0.5 right-0.5"></div>
								</div>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-slate-600 dark:text-slate-400">Location Accuracy</span>
								<select className="text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded px-2 py-1">
									<option>High</option>
									<option>Medium</option>
									<option>Low</option>
								</select>
							</div>
						</div>
					</motion.div>

					{/* Notifications */}
					<motion.div
						initial={{ opacity: 0,y: 20 }}
						animate={{ opacity: 1,y: 0 }}
						transition={{ delay: 0.3 }}
						className="glass-card rounded-2xl p-6"
					>
						<div className="flex items-center space-x-3 mb-4">
							<div className="p-2 bg-yellow-500/20 dark:bg-yellow-400/20 rounded-xl">
								<Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
							</div>
							<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
						</div>
						<p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
							Configure weather alerts and updates
						</p>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-slate-600 dark:text-slate-400">Weather Alerts</span>
								<div className="w-12 h-6 bg-slate-300 dark:bg-slate-600 rounded-full relative">
									<div className="w-5 h-5 bg-white dark:bg-slate-200 rounded-full absolute top-0.5 left-0.5"></div>
								</div>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-slate-600 dark:text-slate-400">Daily Updates</span>
								<div className="w-12 h-6 bg-green-500 dark:bg-green-600 rounded-full relative">
									<div className="w-5 h-5 bg-white dark:bg-slate-200 rounded-full absolute top-0.5 right-0.5"></div>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Privacy */}
					<motion.div
						initial={{ opacity: 0,y: 20 }}
						animate={{ opacity: 1,y: 0 }}
						transition={{ delay: 0.4 }}
						className="glass-card rounded-2xl p-6"
					>
						<div className="flex items-center space-x-3 mb-4">
							<div className="p-2 bg-green-500/20 dark:bg-green-400/20 rounded-xl">
								<Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
							</div>
							<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Privacy</h3>
						</div>
						<p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
							Control your data and privacy settings
						</p>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-slate-600 dark:text-slate-400">Data Collection</span>
								<div className="w-12 h-6 bg-slate-300 dark:bg-slate-600 rounded-full relative">
									<div className="w-5 h-5 bg-white dark:bg-slate-200 rounded-full absolute top-0.5 left-0.5"></div>
								</div>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-slate-600 dark:text-slate-400">Location History</span>
								<div className="w-12 h-6 bg-slate-300 dark:bg-slate-600 rounded-full relative">
									<div className="w-5 h-5 bg-white dark:bg-slate-200 rounded-full absolute top-0.5 left-0.5"></div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Coming Soon Notice */}
				<motion.div
					initial={{ opacity: 0,y: 30 }}
					animate={{ opacity: 1,y: 0 }}
					transition={{ duration: 0.6,ease: "easeOut",delay: 0.5 }}
					className="text-center py-8"
				>
					<div className="glass-card rounded-2xl p-6 max-w-2xl mx-auto">
						<div className="flex items-center justify-center space-x-3 mb-4">
							<Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
							<h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">More Settings Coming Soon</h3>
						</div>
						<p className="text-slate-600 dark:text-slate-400">
							We&apos;re continuously improving the app with new customization options and features.
						</p>
					</div>
				</motion.div>
			</motion.div>
		</div>
	)
}
