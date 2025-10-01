'use client'

import { useAnalytics } from '@/hooks/useAnalytics'
import { WeatherAPI } from '@/lib/weather-api'
import { Location,WeatherData } from '@/types/weather'
import { motion } from 'framer-motion'
// Icons replaced with emojis
import { useRouter } from 'next/navigation'
import React from 'react'

interface WeatherCardProps {
	weather: WeatherData
	location: Location
	onRemove?: () => void
	onSetCurrent?: () => void
	isCurrentLocation?: boolean
	units?: 'metric'|'imperial'
}

const WeatherCard: React.FC<WeatherCardProps>=( {
	weather,
	location,
	onRemove,
	onSetCurrent,
	isCurrentLocation=false,
	units='metric',
} ) => {
	const weatherAPI=WeatherAPI.getInstance()
	const router=useRouter()
	const analytics=useAnalytics()

	const handleCardClick=() => {
		if ( onSetCurrent ) {
			onSetCurrent()
			// Track setting current location
			analytics.trackUserAction( 'set-current-location',{
				locationId: location.id,
				locationName: location.name,
				page: 'cities'
			} )
		} else {
			router.push( `/city/${location.id}` )
			// Track navigation to city details
			analytics.trackNavigation( 'cities',`city-details-${location.id}` )
		}
	}

	const weatherInfo=[
		{
			icon: '🌡️',
			label: 'Feels like',
			value: weatherAPI.formatTemperature( weather.main.feels_like ),
		},
		{
			icon: '💧',
			label: 'Humidity',
			value: weatherAPI.formatHumidity( weather.main.humidity ),
		},
		{
			icon: '💨',
			label: 'Wind',
			value: `${weatherAPI.formatWindSpeed( weather.wind.speed,units )} ${weatherAPI.getWindDirection( weather.wind.deg )}`,
		},
		{
			icon: '👁️',
			label: 'Visibility',
			value: weatherAPI.formatVisibility( weather.visibility ),
		},
		{
			icon: '⚙️',
			label: 'Pressure',
			value: weatherAPI.formatPressure( weather.main.pressure ),
		},
	]

	return (
		<motion.div
			initial={{ opacity: 0,y: 20 }}
			animate={{ opacity: 1,y: 0 }}
			exit={{ opacity: 0,y: -20 }}
			onClick={handleCardClick}
			className={`${isCurrentLocation? 'weather-card-current':'weather-card'} group cursor-pointer hover:scale-105 transition-transform duration-300`}
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-3">
					<div className="p-2 bg-blue-500/20 rounded-xl">
						<span className="text-blue-300 text-lg">📍</span>
					</div>
					<div>
						<h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
							{location.name}
							{isCurrentLocation&&(
								<span className="ml-3 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full font-medium">
									Current
								</span>
							)}
						</h3>
						<p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
							{location.state&&`${location.state}, `}{location.country}
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					{onSetCurrent? (
						<button
							onClick={( e ) => {
								e.stopPropagation()
								onSetCurrent()
							}}
							className={`p-2 rounded-xl transition-all duration-300 group/set-current ${isCurrentLocation
								? 'text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
								:'text-green-400 dark:text-green-500 hover:text-green-300 dark:hover:text-green-400 hover:bg-green-500/10 dark:hover:bg-green-500/20'
								}`}
							aria-label={isCurrentLocation? 'Current location':'Set as current location'}
							title={isCurrentLocation? 'Current location':'Set as current location'}
						>
							<span className="text-lg group-hover/set-current:scale-110 transition-transform">🏠</span>
						</button>
					):(
						<div className="p-2 text-blue-400 group-hover:text-blue-300 transition-colors" title="View details">
							<span className="text-lg">🔗</span>
						</div>
					)}
					{onRemove&&(
						<button
							onClick={( e ) => {
								e.stopPropagation()
								onRemove()
								// Track location removal
								analytics.trackLocationRemoved( location.id,location.name )
							}}
							className="p-2 text-red-400 dark:text-red-500 hover:text-red-300 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-all duration-300 group/remove"
							aria-label="Remove location"
						>
							<span className="group-hover/remove:scale-110 transition-transform">×</span>
						</button>
					)}
				</div>
			</div>

			{/* Main Weather Info */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center space-x-6">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={weatherAPI.getWeatherIconUrl( weather.weather[ 0 ].icon )}
						alt={weather.weather[ 0 ].description}
						className="weather-icon filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
					/>
					<div>
						<div className="text-5xl font-bold gradient-text-primary mb-2">
							{weatherAPI.formatTemperature( weather.main.temp,units )}
						</div>
						<div className="text-slate-700 dark:text-slate-300 capitalize text-lg font-medium">
							{weather.weather[ 0 ].description}
						</div>
					</div>
				</div>
				<div className="text-right space-y-1">
					<div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
						H: {weatherAPI.formatTemperature( weather.main.temp_max,units )}
					</div>
					<div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
						L: {weatherAPI.formatTemperature( weather.main.temp_min,units )}
					</div>
				</div>
			</div>

			{/* Weather Details */}
			<div className="grid grid-cols-2 gap-4 mb-6">
				{weatherInfo.map( ( info,index ) => (
					<div key={index} className="flex items-center space-x-3 p-3 bg-slate-100/50 dark:bg-white/10 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/20 transition-all duration-300 group/detail">
						<div className="p-2 bg-slate-200/50 dark:bg-white/10 rounded-lg group-hover/detail:bg-slate-300/50 dark:group-hover/detail:bg-white/20 transition-colors">
							<span className="text-lg">{info.icon}</span>
						</div>
						<div>
							<div className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide">{info.label}</div>
							<div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover/detail:text-blue-600 dark:group-hover/detail:text-blue-400 transition-colors">{info.value}</div>
						</div>
					</div>
				) )}
			</div>

			{/* Sunrise/Sunset */}
			<div className="flex items-center justify-between pt-6 border-t border-slate-200/30 dark:border-white/10">
				<div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl">
					<div className="p-2 bg-orange-500/20 rounded-lg">
						<span className="text-orange-600 text-lg">🌅</span>
					</div>
					<div>
						<div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sunrise</div>
						<div className="text-sm font-bold text-slate-800 dark:text-slate-200">
							{weatherAPI.getTimeFromTimestamp( weather.sys.sunrise )}
						</div>
					</div>
				</div>
				<div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl">
					<div className="p-2 bg-purple-500/20 rounded-lg">
						<span className="text-purple-600 text-lg">🌇</span>
					</div>
					<div>
						<div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sunset</div>
						<div className="text-sm font-bold text-slate-800 dark:text-slate-200">
							{weatherAPI.getTimeFromTimestamp( weather.sys.sunset )}
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	)
}

export default WeatherCard
