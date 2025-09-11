'use client'

import { WeatherAPI } from '@/lib/weather-api'
import { Location,WeatherData } from '@/types/weather'
import { motion } from 'framer-motion'
import { Droplets,Eye,Gauge,MapPin,Sunrise,Sunset,Thermometer,Wind } from 'lucide-react'
import React from 'react'

interface WeatherCardProps {
	weather: WeatherData
	location: Location
	onRemove?: () => void
	isCurrentLocation?: boolean
}

const WeatherCard: React.FC<WeatherCardProps>=( {
	weather,
	location,
	onRemove,
	isCurrentLocation=false,
} ) => {
	const weatherAPI=WeatherAPI.getInstance()

	const weatherInfo=[
		{
			icon: <Thermometer className="w-4 h-4" />,
			label: 'Feels like',
			value: weatherAPI.formatTemperature( weather.main.feels_like ),
		},
		{
			icon: <Droplets className="w-4 h-4" />,
			label: 'Humidity',
			value: weatherAPI.formatHumidity( weather.main.humidity ),
		},
		{
			icon: <Wind className="w-4 h-4" />,
			label: 'Wind',
			value: `${weatherAPI.formatWindSpeed( weather.wind.speed )} ${weatherAPI.getWindDirection( weather.wind.deg )}`,
		},
		{
			icon: <Eye className="w-4 h-4" />,
			label: 'Visibility',
			value: weatherAPI.formatVisibility( weather.visibility ),
		},
		{
			icon: <Gauge className="w-4 h-4" />,
			label: 'Pressure',
			value: weatherAPI.formatPressure( weather.main.pressure ),
		},
	]

	return (
		<motion.div
			initial={{ opacity: 0,y: 20 }}
			animate={{ opacity: 1,y: 0 }}
			exit={{ opacity: 0,y: -20 }}
			className={`${isCurrentLocation? 'weather-card-current':'weather-card'} group`}
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-3">
					<div className="p-2 bg-blue-100/50 rounded-xl">
						<MapPin className="w-5 h-5 text-blue-600" />
					</div>
					<div>
						<h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
							{location.name}
							{isCurrentLocation&&(
								<span className="ml-3 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full font-medium">
									Current
								</span>
							)}
						</h3>
						<p className="text-slate-600 text-sm font-medium">{location.country}</p>
					</div>
				</div>
				{onRemove&&(
					<button
						onClick={onRemove}
						className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 group/remove"
						aria-label="Remove location"
					>
						<span className="group-hover/remove:scale-110 transition-transform">×</span>
					</button>
				)}
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
							{weatherAPI.formatTemperature( weather.main.temp )}
						</div>
						<div className="text-slate-600 capitalize text-lg font-medium">
							{weather.weather[ 0 ].description}
						</div>
					</div>
				</div>
				<div className="text-right space-y-1">
					<div className="text-sm text-slate-600 font-medium">
						H: {weatherAPI.formatTemperature( weather.main.temp_max )}
					</div>
					<div className="text-sm text-slate-600 font-medium">
						L: {weatherAPI.formatTemperature( weather.main.temp_min )}
					</div>
				</div>
			</div>

			{/* Weather Details */}
			<div className="grid grid-cols-2 gap-4 mb-6">
				{weatherInfo.map( ( info,index ) => (
					<div key={index} className="flex items-center space-x-3 p-3 glass-card-subtle rounded-xl hover:glass-card transition-all duration-300 group/detail">
						<div className="p-2 bg-slate-100/50 rounded-lg group-hover/detail:bg-slate-200/50 transition-colors">
							{info.icon}
						</div>
						<div>
							<div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{info.label}</div>
							<div className="text-sm font-bold text-slate-700 group-hover/detail:text-blue-600 transition-colors">{info.value}</div>
						</div>
					</div>
				) )}
			</div>

			{/* Sunrise/Sunset - Light Theme */}
			<div className="flex items-center justify-between pt-6 border-t border-slate-200/30">
				<div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-100/50 to-yellow-100/50 rounded-xl">
					<div className="p-2 bg-orange-200/50 rounded-lg">
						<Sunrise className="w-4 h-4 text-orange-600" />
					</div>
					<div>
						<div className="text-xs text-slate-500 font-medium">Sunrise</div>
						<div className="text-sm font-bold text-slate-700">
							{weatherAPI.getTimeFromTimestamp( weather.sys.sunrise )}
						</div>
					</div>
				</div>
				<div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-xl">
					<div className="p-2 bg-purple-200/50 rounded-lg">
						<Sunset className="w-4 h-4 text-purple-600" />
					</div>
					<div>
						<div className="text-xs text-slate-500 font-medium">Sunset</div>
						<div className="text-sm font-bold text-slate-700">
							{weatherAPI.getTimeFromTimestamp( weather.sys.sunset )}
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	)
}

export default WeatherCard
