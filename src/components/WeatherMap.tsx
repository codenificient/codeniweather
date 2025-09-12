'use client'

import { useWeather } from '@/contexts/WeatherContext'
import { useState } from 'react'

interface WeatherMapProps {
	className?: string
}

const WeatherMap: React.FC<WeatherMapProps>=( { className='' } ) => {
	const { weatherData,locations }=useWeather()
	const [ selectedLayer,setSelectedLayer ]=useState( 'TA2' ) // Default to temperature

	// Weather map layers from OpenWeatherMap API
	const weatherLayers=[
		{ id: 'TA2',name: 'Temperature',description: 'Air temperature at 2m height',unit: '°C',emoji: '🌡️' },
		{ id: 'PR0',name: 'Precipitation',description: 'Precipitation intensity',unit: 'mm/s',emoji: '🌧️' },
		{ id: 'WS10',name: 'Wind Speed',description: 'Wind speed at 10m height',unit: 'm/s',emoji: '💨' },
		{ id: 'WND',name: 'Wind Direction',description: 'Wind speed and direction',unit: 'm/s',emoji: '🧭' },
		{ id: 'APM',name: 'Pressure',description: 'Atmospheric pressure',unit: 'hPa',emoji: '📊' },
		{ id: 'HRD0',name: 'Humidity',description: 'Relative humidity',unit: '%',emoji: '💧' },
		{ id: 'CL',name: 'Cloudiness',description: 'Cloud coverage',unit: '%',emoji: '☁️' },
		{ id: 'SD0',name: 'Snow Depth',description: 'Depth of snow',unit: 'm',emoji: '❄️' }
	]

	// Generate OpenWeatherMap tile URL
	const getWeatherTileUrl=( layer: string ) => {
		const apiKey=process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
		if ( !apiKey ) return ''

		return `https://maps.openweathermap.org/maps/2.0/weather/${layer}/{z}/{x}/{y}?appid=${apiKey}&opacity=0.8`
	}

	return (
		<div className={`w-full ${className}`}>
			{/* Layer Selection */}
			<div className="mb-6">
				<div className="flex flex-wrap gap-2">
					{weatherLayers.map( ( layer ) => (
						<button
							key={layer.id}
							onClick={() => setSelectedLayer( layer.id )}
							className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${selectedLayer===layer.id
								? 'btn-primary'
								:'btn-glass hover:glass-card-strong'
								}`}
						>
							<span className="mr-2">{layer.emoji}</span>
							{layer.name}
						</button>
					) )}
				</div>
				<div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
					{weatherLayers.find( l => l.id===selectedLayer )?.description} ({weatherLayers.find( l => l.id===selectedLayer )?.unit})
				</div>
			</div>

			{/* Map Placeholder with Weather Layer Info */}
			<div className="relative">
				<div className="w-full h-96 glass-card-strong rounded-xl flex items-center justify-center relative overflow-hidden">
					{/* Map Content */}
					<div className="relative z-10 text-center text-slate-800 dark:text-slate-200">
						<div className="text-6xl mb-4">
							{weatherLayers.find( l => l.id===selectedLayer )?.emoji}
						</div>
						<h3 className="text-2xl font-bold mb-2">
							{weatherLayers.find( l => l.id===selectedLayer )?.name} Map
						</h3>
						<p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
							{weatherLayers.find( l => l.id===selectedLayer )?.description}
						</p>
						<div className="text-sm text-slate-500 dark:text-slate-500">
							Interactive map coming soon with OpenWeatherMap layers
						</div>
					</div>

					{/* Map Controls */}
					<div className="absolute top-4 right-4 glass-card rounded-lg p-3">
						<div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Layer</div>
						<div className="flex items-center space-x-2">
							<span className="text-lg">
								{weatherLayers.find( l => l.id===selectedLayer )?.emoji}
							</span>
							<span className="text-sm font-medium text-slate-800 dark:text-slate-200">
								{weatherLayers.find( l => l.id===selectedLayer )?.name}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Location Cards */}
			{locations.length>0&&(
				<div className="mt-6">
					<h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Your Locations</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{locations.map( ( location ) => {
							const weather=weatherData[ location.id ]
							if ( !weather ) return null

							return (
								<div key={location.id} className="glass-card rounded-xl p-4 hover:glass-card-strong transition-all duration-300 group">
									<div className="flex items-center space-x-3 mb-3">
										<div className="p-2 bg-blue-500/20 dark:bg-blue-400/20 rounded-xl">
											<span className="text-blue-600 dark:text-blue-400 text-lg">📍</span>
										</div>
										<div>
											<h5 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{location.name}</h5>
											{location.state&&(
												<p className="text-sm text-slate-600 dark:text-slate-400">{location.state}, {location.country}</p>
											)}
											{!location.state&&(
												<p className="text-sm text-slate-600 dark:text-slate-400">{location.country}</p>
											)}
										</div>
									</div>
									<div className="space-y-2">
										<div className="flex items-center justify-between text-sm">
											<div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
												<span>🌡️</span>
												<span>Temperature</span>
											</div>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{weather.main.temp.toFixed( 1 )}°C</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
												<span>💧</span>
												<span>Humidity</span>
											</div>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{weather.main.humidity}%</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
												<span>💨</span>
												<span>Wind</span>
											</div>
											<span className="font-semibold text-slate-800 dark:text-slate-200">{weather.wind.speed} m/s</span>
										</div>
									</div>
								</div>
							)
						} )}
					</div>
				</div>
			)}

			{/* Legend */}
			<div className="mt-6 p-4 glass-card rounded-xl">
				<h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Weather Map Features</h4>
				<div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
					<p>• <strong>Interactive Layers:</strong> Switch between different weather data visualizations</p>
					<p>• <strong>Real-time Data:</strong> Current weather conditions from OpenWeatherMap</p>
					<p>• <strong>Location Markers:</strong> Your saved cities with weather details</p>
					<p>• <strong>Multiple Views:</strong> Temperature, precipitation, wind, pressure, and more</p>
				</div>
			</div>
		</div>
	)
}

export default WeatherMap
