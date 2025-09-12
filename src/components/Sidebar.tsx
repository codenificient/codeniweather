'use client'

import { useWeather } from '@/contexts/WeatherContext'
import { motion } from 'framer-motion'
// Icons replaced with emojis
import { usePathname,useRouter } from 'next/navigation'
import React from 'react'

interface SidebarProps {
	isOpen: boolean
	onToggle: () => void
}

const Sidebar: React.FC<SidebarProps>=( { isOpen,onToggle } ) => {
	const router=useRouter()
	const pathname=usePathname()
	const { refreshAllWeather,loading }=useWeather()

	const navigationItems=[
		{ id: 'weather',label: 'Weather',icon: '🌤️',path: '/' },
		{ id: 'cities',label: 'Cities',icon: '📍',path: '/cities' },
		{ id: 'map',label: 'Map',icon: '🗺️',path: '/map' },
		{ id: 'settings',label: 'Settings',icon: '⚙️',path: '/settings' },
	]

	const handleNavigation=( path: string ) => {
		router.push( path )
	}


	const handleRefresh=async () => {
		await refreshAllWeather()
	}

	return (
		<>
			{/* Mobile Overlay */}
			{isOpen&&(
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onToggle}
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
				/>
			)}

			{/* Sidebar */}
			<motion.div
				initial={{ x: -280 }}
				animate={{ x: isOpen? 0:-280 }}
				transition={{ type: 'spring',damping: 25,stiffness: 200 }}
				className={`
          fixed top-0 left-0 h-full w-70 bg-white/90 backdrop-blur-md border-r border-white/20 z-50
          flex flex-col shadow-xl
          ${isOpen? 'translate-x-0':'-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
			>
				{/* Header */}
				<div className="p-6 border-b border-white/20">
					<div className="flex items-center space-x-3">
						<div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
							<span className="text-2xl">🌤️</span>
						</div>
						<div>
							<h1 className="text-xl font-bold text-slate-800">CodeniWeather</h1>
							<p className="text-sm text-slate-600">Weather Dashboard</p>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="p-4 border-b border-white/20">
					<div className="space-y-2">
						<button
							onClick={handleRefresh}
							disabled={loading}
							className="w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
						>
							<div className="p-2 bg-blue-500/20 rounded-lg">
								<span className={`text-lg text-blue-600 ${loading? 'animate-spin':''}`}>🔄</span>
							</div>
							<span className="font-medium">Refresh All</span>
						</button>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-4">
					<div className="space-y-1">
						{navigationItems.map( ( item ) => {
							const isActive=pathname===item.path

							return (
								<button
									key={item.id}
									onClick={() => handleNavigation( item.path )}
									className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive
											? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
											:'text-slate-700 hover:bg-slate-100'
										}
                  `}
								>
									<div className={`p-2 rounded-lg ${isActive? 'bg-white/20':'bg-slate-100'}`}>
										<span className={`text-lg ${isActive? 'text-white':'text-slate-600'}`}>{item.icon}</span>
									</div>
									<span className="font-medium">{item.label}</span>
								</button>
							)
						} )}
					</div>
				</nav>

				{/* Footer */}
				<div className="p-4 border-t border-white/20">
					<div className="text-center text-sm text-slate-500">
						<p>Powered by OpenWeatherMap</p>
						<p className="mt-1">v1.0.0</p>
					</div>
				</div>
			</motion.div>
		</>
	)
}

export default Sidebar
