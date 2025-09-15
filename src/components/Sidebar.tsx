'use client'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
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
	const { theme,toggleTheme }=useTheme()

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

			{/* Sidebar - Super Thin with Rounded Corners */}
			<motion.div
				initial={{ x: -80 }}
				animate={{ x: isOpen? 0:-80 }}
				transition={{ type: 'spring',damping: 25,stiffness: 200 }}
				className={`
          fixed top-0 left-0 h-screen w-20 glass-card-strong z-50
          flex flex-col shadow-xl rounded-r-2xl
          ${isOpen? 'translate-x-0':'-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:h-full
        `}
			>
				{/* Header - Vertical */}
				<div className="p-3 border-b border-white/20 dark:border-white/10">
					<div className="flex flex-col items-center space-y-2">
						<div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
							<img
								src="/favicon.svg"
								alt="CodeniWeather"
								className="w-6 h-6"
							/>
						</div>
						<div className="text-center">
							<h1 className="text-xs font-bold text-slate-800 dark:text-slate-300 leading-tight">Weather</h1>
						</div>
					</div>
				</div>

				{/* Quick Actions - Vertical */}
				<div className="p-2 border-b border-white/20 dark:border-white/10">
					<div className="space-y-2">
						<button
							onClick={handleRefresh}
							disabled={loading}
							className="w-full flex flex-col items-center space-y-1 px-2 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
							title="Refresh All"
						>
							<div className="p-2 bg-blue-500/20 rounded-lg">
								<span className={`text-lg text-blue-600 ${loading? 'animate-spin':''}`}>🔄</span>
							</div>
							<span className="text-xs font-medium text-center text-slate-700 dark:text-slate-300">Refresh</span>
						</button>

						{/* Theme Switcher */}
						<Button
							onClick={toggleTheme}
							variant="ghost"
							size="sm"
							className="w-full flex flex-col items-center space-y-1 px-2 py-3 h-auto"
							title={`Switch to ${theme==='light'? 'dark':'light'} theme`}
						>
							<div className="p-2 bg-slate-500/20 rounded-lg">
								<span className="text-lg text-slate-600 dark:text-slate-300">
									{theme==='light'? '🌙':'☀️'}
								</span>
							</div>
							<span className="text-xs font-medium text-center text-slate-700 dark:text-slate-300">
								{theme==='light'? 'Dark':'Light'}
							</span>
						</Button>
					</div>
				</div>

				{/* Navigation - Vertical */}
				<nav className="flex-1 p-2">
					<div className="space-y-1">
						{navigationItems.map( ( item ) => {
							const isActive=pathname===item.path

							return (
								<button
									key={item.id}
									onClick={() => handleNavigation( item.path )}
									className={`
                    w-full flex flex-col items-center space-y-1 px-2 py-3 rounded-xl transition-all duration-200
                    ${isActive
											? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
											:'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
										}
                  `}
									title={item.label}
								>
									<div className={`p-2 rounded-lg ${isActive? 'bg-white/20':'bg-slate-100 dark:bg-white/10'}`}>
										<span className={`text-lg ${isActive? 'text-white':'text-slate-600 dark:text-slate-400'}`}>{item.icon}</span>
									</div>
									<span className="text-xs font-medium text-center leading-tight text-slate-700 dark:text-slate-300">{item.label}</span>
								</button>
							)
						} )}
					</div>
				</nav>

			</motion.div>
		</>
	)
}

export default Sidebar
