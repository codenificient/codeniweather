'use client'

import { DailyForecast } from '@/types/weather'
import { motion } from 'framer-motion'
import { Cloud } from 'lucide-react'
import React from 'react'

interface ForecastPanelProps {
	forecast: DailyForecast[]
	loading?: boolean
}

const ForecastPanel: React.FC<ForecastPanelProps>=( {
	forecast,
	loading=false,
} ) => {
	const getWeatherIcon=( weather: DailyForecast[ 'weather' ] ) => {
		const iconCode=weather.icon
		const main=weather.main.toLowerCase()
		const description=weather.description.toLowerCase()

		// Map weather conditions to beautiful emojis
		if ( main.includes( 'clear' ) ) {
			return '☀️'
		}
		if ( main.includes( 'clouds' ) ) {
			if ( description.includes( 'few' )||description.includes( 'scattered' ) ) {
				return '⛅'
			}
			if ( description.includes( 'broken' )||description.includes( 'overcast' ) ) {
				return '☁️'
			}
			return '⛅'
		}
		if ( main.includes( 'rain' ) ) {
			if ( description.includes( 'light' )||description.includes( 'drizzle' ) ) {
				return '🌦️'
			}
			if ( description.includes( 'heavy' )||description.includes( 'shower' ) ) {
				return '🌧️'
			}
			return '🌧️'
		}
		if ( main.includes( 'snow' ) ) {
			return '❄️'
		}
		if ( main.includes( 'thunderstorm' ) ) {
			return '⛈️'
		}
		if ( main.includes( 'mist' )||main.includes( 'fog' )||main.includes( 'haze' ) ) {
			return '🌫️'
		}
		if ( main.includes( 'tornado' ) ) {
			return '🌪️'
		}
		if ( main.includes( 'sand' )||main.includes( 'dust' ) ) {
			return '🌪️'
		}
		if ( main.includes( 'ash' ) ) {
			return '🌋'
		}
		if ( main.includes( 'squall' ) ) {
			return '💨'
		}

		// Default fallback
		return '🌤️'
	}

	const getPrecipitationIcon=( forecast: DailyForecast ) => {
		if ( forecast.snow&&forecast.snow>0 ) {
			return '❄️'
		}
		if ( forecast.rain&&forecast.rain>0 ) {
			return '💧'
		}
		if ( forecast.pop>30 ) {
			return '🌧️'
		}
		return null
	}

	const getPrecipitationText=( forecast: DailyForecast ) => {
		if ( forecast.snow&&forecast.snow>0 ) {
			return `${forecast.snow.toFixed( 1 )}mm snow`
		}
		if ( forecast.rain&&forecast.rain>0 ) {
			return `${forecast.rain.toFixed( 1 )}mm rain`
		}
		if ( forecast.pop>0 ) {
			return `${forecast.pop}% chance`
		}
		return null
	}

	if ( loading ) {
		return (
			<div className="glass-card-strong rounded-xl p-8 h-fit w-full">
				<h3 className="text-lg font-semibold text-slate-800 mb-4">7-Day Forecast</h3>
				<div className="space-y-4">
					{[ ...Array( 7 ) ].map( ( _,index ) => (
						<div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-slate-100 animate-pulse">
							<div className="w-24 h-24 flex items-center justify-center">
								<span className="text-6xl animate-pulse">🌤️</span>
							</div>
							<div className="flex-1">
								<div className="h-5 bg-slate-300 rounded w-20 mb-1"></div>
								<div className="h-4 bg-slate-300 rounded w-28"></div>
							</div>
							<div className="h-5 bg-slate-300 rounded w-16"></div>
						</div>
					) )}
				</div>
			</div>
		)
	}

	if ( !forecast||forecast.length===0 ) {
		return (
			<div className="glass-card-strong rounded-xl p-8 h-fit w-full">
				<h3 className="text-lg font-semibold text-slate-800 mb-4">7-Day Forecast</h3>
				<div className="text-center text-slate-500 py-8">
					<Cloud className="w-12 h-12 mx-auto mb-2 text-slate-400" />
					<p>No forecast data available</p>
				</div>
			</div>
		)
	}

	return (
		<div className="glass-card-strong rounded-xl p-8 h-fit w-full">
			<h3 className="text-lg font-semibold text-slate-800 mb-4">7-Day Forecast</h3>
			<div className="space-y-4">
				{forecast.map( ( day,index ) => (
					<motion.div
						key={day.date}
						initial={{ opacity: 0,x: 20 }}
						animate={{ opacity: 1,x: 0 }}
						transition={{ delay: index*0.1 }}
						className="flex items-center space-x-4 p-4 rounded-lg hover:glass-card transition-colors duration-200"
					>
						{/* Day of week */}
						<div className="w-16 text-base font-semibold text-slate-700">
							{index===0? 'Today':day.dayOfWeek}
						</div>

						{/* Weather icon */}
						<div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
							<span className="text-6xl">
								{getWeatherIcon( day.weather )}
							</span>
						</div>

						{/* Weather description */}
						<div className="flex-1 min-w-0">
							<div className="text-base font-semibold text-slate-800 capitalize">
								{day.weather.description}
							</div>
							<div className="flex items-center space-x-2 text-sm text-slate-600">
								{getPrecipitationIcon( day )&&(
									<span className="text-lg">{getPrecipitationIcon( day )}</span>
								)}
								<span>{getPrecipitationText( day )}</span>
							</div>
						</div>

						{/* Temperature range */}
						<div className="text-lg font-bold text-slate-800 text-right">
							<span className="text-slate-600">{Math.round( day.temp_min )}°</span>
							<span className="mx-1">/</span>
							<span>{Math.round( day.temp_max )}°</span>
						</div>
					</motion.div>
				) )}
			</div>
		</div>
	)
}

export default ForecastPanel
