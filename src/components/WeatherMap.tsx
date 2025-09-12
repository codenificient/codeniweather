'use client'

import { useWeather } from '@/contexts/WeatherContext'
import L from 'leaflet'
import dynamic from 'next/dynamic'
import { useEffect,useState } from 'react'
import { useMap } from 'react-leaflet'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer=dynamic( () => import( 'react-leaflet' ).then( mod => mod.MapContainer ),{ ssr: false } )
const TileLayer=dynamic( () => import( 'react-leaflet' ).then( mod => mod.TileLayer ),{ ssr: false } )
const Marker=dynamic( () => import( 'react-leaflet' ).then( mod => mod.Marker ),{ ssr: false } )
const Popup=dynamic( () => import( 'react-leaflet' ).then( mod => mod.Popup ),{ ssr: false } )

// Component to handle weather layer updates
const WeatherLayerUpdater=( { selectedLayer }: { selectedLayer: string } ) => {
	const map=useMap()

	useEffect( () => {
		if ( !map ) return

		// Remove existing weather layers
		map.eachLayer( ( layer: any ) => {
			if ( layer.isWeatherLayer ) {
				map.removeLayer( layer )
			}
		} )

		// Add new weather layer
		const apiKey=process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
		if ( apiKey ) {
			const weatherLayer=L.tileLayer(
				`https://maps.openweathermap.org/maps/2.0/weather/${selectedLayer}/{z}/{x}/{y}?appid=${apiKey}&opacity=0.8`,
				{
					attribution: '© OpenWeatherMap',
					opacity: 0.8
				}
			)
				// Add custom property to identify weather layers
				; ( weatherLayer as any ).isWeatherLayer=true
			weatherLayer.addTo( map )
		}
	},[ map,selectedLayer ] )

	return null
}

// Component to handle map resize
const MapResizeHandler=() => {
	const map=useMap()

	useEffect( () => {
		if ( !map ) return

		// Trigger resize when component mounts
		setTimeout( () => {
			map.invalidateSize()
		},100 )

		// Handle window resize
		const handleResize=() => {
			map.invalidateSize()
		}

		window.addEventListener( 'resize',handleResize )
		return () => window.removeEventListener( 'resize',handleResize )
	},[ map ] )

	return null
}

// Component to fit map bounds to show all locations
const MapBoundsFitter=( { locations }: { locations: any[] } ) => {
	const map=useMap()

	useEffect( () => {
		if ( !map||locations.length<2 ) return

		// Create bounds from all locations
		const bounds=L.latLngBounds(
			locations.map( loc => [ loc.lat,loc.lon ] )
		)

		// Fit map to bounds with padding
		setTimeout( () => {
			map.fitBounds( bounds,{ padding: [ 20,20 ] } )
		},100 )
	},[ map,locations ] )

	return null
}

interface WeatherMapProps {
	className?: string
}

const WeatherMap: React.FC<WeatherMapProps>=( { className='' } ) => {
	const { weatherData,locations }=useWeather()
	const [ selectedLayer,setSelectedLayer ]=useState( 'TA2' ) // Default to temperature

	// Calculate map center and zoom based on locations
	const getMapCenterAndZoom=() => {
		if ( locations.length===0 ) {
			return { center: [ 40.7128,-74.0060 ] as [ number,number ],zoom: 4 } // Default to New York
		}

		if ( locations.length===1 ) {
			// Single location - center on it with zoom 8
			return {
				center: [ locations[ 0 ].lat,locations[ 0 ].lon ] as [ number,number ],
				zoom: 8
			}
		}

		// Multiple locations - calculate bounds
		const lats=locations.map( loc => loc.lat )
		const lons=locations.map( loc => loc.lon )

		const minLat=Math.min( ...lats )
		const maxLat=Math.max( ...lats )
		const minLon=Math.min( ...lons )
		const maxLon=Math.max( ...lons )

		// Calculate center
		const centerLat=( minLat+maxLat )/2
		const centerLon=( minLon+maxLon )/2

		// Calculate appropriate zoom level based on bounds
		const latDiff=maxLat-minLat
		const lonDiff=maxLon-minLon
		const maxDiff=Math.max( latDiff,lonDiff )

		let zoom=4
		if ( maxDiff>10 ) zoom=3
		else if ( maxDiff>5 ) zoom=4
		else if ( maxDiff>2 ) zoom=5
		else if ( maxDiff>1 ) zoom=6
		else if ( maxDiff>0.5 ) zoom=7
		else zoom=8

		return {
			center: [ centerLat,centerLon ] as [ number,number ],
			zoom
		}
	}

	const mapConfig=getMapCenterAndZoom()

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

			{/* Interactive Weather Map */}
			<div className="relative">
				<div className="w-full h-[500px] sm:h-[600px] lg:h-[700px] glass-card-strong rounded-xl overflow-hidden">
					<MapContainer
						center={mapConfig.center}
						zoom={mapConfig.zoom}
						style={{ height: '100%',width: '100%' }}
						className="rounded-xl"
					>
						{/* Base Map Layer */}
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>

						{/* Weather Layer Updater */}
						<WeatherLayerUpdater selectedLayer={selectedLayer} />

						{/* Map Resize Handler */}
						<MapResizeHandler />

						{/* Map Bounds Fitter */}
						<MapBoundsFitter locations={locations} />

						{/* Location Markers */}
						{locations.map( ( location ) => {
							const weather=weatherData[ location.id ]
							if ( !weather ) return null

							return (
								<Marker
									key={location.id}
									position={[ location.lat,location.lon ]}
								>
									<Popup>
										<div className="p-2">
											<h3 className="font-bold text-slate-800 dark:text-slate-200">
												{location.name}
											</h3>
											{location.state&&(
												<p className="text-sm text-slate-600 dark:text-slate-400">
													{location.state}, {location.country}
												</p>
											)}
											{!location.state&&(
												<p className="text-sm text-slate-600 dark:text-slate-400">
													{location.country}
												</p>
											)}
											<div className="mt-2 space-y-1">
												<div className="flex items-center justify-between text-sm">
													<span className="text-slate-600 dark:text-slate-400">🌡️ Temp</span>
													<span className="font-semibold text-slate-800 dark:text-slate-200">
														{weather.main.temp.toFixed( 1 )}°C
													</span>
												</div>
												<div className="flex items-center justify-between text-sm">
													<span className="text-slate-600 dark:text-slate-400">💧 Humidity</span>
													<span className="font-semibold text-slate-800 dark:text-slate-200">
														{weather.main.humidity}%
													</span>
												</div>
												<div className="flex items-center justify-between text-sm">
													<span className="text-slate-600 dark:text-slate-400">💨 Wind</span>
													<span className="font-semibold text-slate-800 dark:text-slate-200">
														{weather.wind.speed} m/s
													</span>
												</div>
											</div>
										</div>
									</Popup>
								</Marker>
							)
						} )}
					</MapContainer>

					{/* Map Controls */}
					<div className="absolute top-4 right-4 glass-card rounded-lg p-3 z-[1000]">
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
				<h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Interactive Weather Map</h4>
				<div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
					<p>• <strong>Interactive Layers:</strong> Click buttons above to switch between weather visualizations</p>
					<p>• <strong>Real-time Data:</strong> Live weather data from OpenWeatherMap API</p>
					<p>• <strong>Location Markers:</strong> Click markers to see detailed weather for your cities</p>
					<p>• <strong>Map Navigation:</strong> Zoom and pan to explore different regions</p>
					<p>• <strong>Weather Layers:</strong> Temperature, precipitation, wind, pressure, humidity, clouds, and snow</p>
				</div>
			</div>
		</div>
	)
}

export default WeatherMap
