'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useWeather } from '@/contexts/WeatherContext'
import { getWeatherIcon } from '@/lib/weather-icons'
import { Map } from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import dynamic from 'next/dynamic'
import { useRef,useState } from 'react'

// Dynamically import the map component to avoid SSR issues
const MapComponent=dynamic( () => import( './MapComponent' ),{ ssr: false } )

interface WeatherMapProps {
	className?: string
}

const WeatherMap: React.FC<WeatherMapProps>=( { className='' } ) => {
	const { weatherData,locations,currentLocation,addLocation,removeLocation,searchCities }=useWeather()
	const { theme }=useTheme()
	const [ selectedLayer,setSelectedLayer ]=useState( 'temperature' )
	const [ isSearching,setIsSearching ]=useState( false )
	const [ searchQuery,setSearchQuery ]=useState( '' )
	const [ searchResults,setSearchResults ]=useState<any[]>( [] )
	const [ showSearchResults,setShowSearchResults ]=useState( false )
	const mapRef=useRef<Map|null>( null )

	// Weather map layers using MapTiler Weather SDK - All 7 supported metrics
	const weatherLayers=[
		{ id: 'temperature',name: 'Temperature',description: 'Air temperature at 2m above ground',unit: '°C',emoji: '🌡️',type: 'temperature',variableId: 'GFS_TEMPERATURE_2M' },
		{ id: 'precipitation',name: 'Precipitation',description: 'Hourly precipitation rate',unit: 'mm/h',emoji: '🌧️',type: 'precipitation',variableId: 'GFS_PRECIPITATION_1H' },
		{ id: 'pressure',name: 'Pressure',description: 'Atmospheric pressure at sea level',unit: 'hPa',emoji: '📊',type: 'pressure',variableId: 'GFS_PRESSURE_MSL' },
		{ id: 'wind',name: 'Wind',description: 'Wind speed and direction at 10m',unit: 'm/s',emoji: '💨',type: 'wind',variableId: 'GFS_WIND_10M' },
		{ id: 'radar',name: 'Radar',description: 'Composite radar reflectivity',unit: 'dBZ',emoji: '📡',type: 'radar',variableId: 'GFS_RADAR_COMPOSITE' },
		{ id: 'clouds',name: 'Clouds',description: 'Total cloud coverage',unit: '%',emoji: '☁️',type: 'clouds',variableId: 'GFS_CLOUD_COVER_TOTAL' },
		{ id: 'frozen-precipitation',name: 'Frozen Precipitation',description: 'Percentage of frozen precipitation',unit: '%',emoji: '❄️',type: 'frozen-precipitation',variableId: 'GFS_FROZEN_PRECIPITATION_PERCENT' }
	]

	// Get MapTiler API key
	const getMapTilerApiKey=() => {
		return process.env.NEXT_PUBLIC_MAPTILER_API_KEY||'YOUR_MAPTILER_API_KEY'
	}

	// Calculate map center and zoom based on current location or saved locations
	const getMapCenterAndZoom=() => {
		// Priority 1: Use current location if available
		if ( currentLocation ) {
			return {
				center: [ currentLocation.lon,currentLocation.lat ] as [ number,number ],
				zoom: 10
			}
		}

		// Priority 2: Use first saved location if available
		if ( locations.length>0 ) {
			return {
				center: [ locations[ 0 ].lon,locations[ 0 ].lat ] as [ number,number ],
				zoom: 8
			}
		}

		// Default: Center on a global view
		return {
			center: [ 0,20 ] as [ number,number ],
			zoom: 2
		}
	}

	const mapConfig=getMapCenterAndZoom()

	// Get weather icon based on weather condition and theme
	const getWeatherIconForCondition=( condition: string ) => {
		return getWeatherIcon( condition,theme )
	}

	// Get weather data for a location
	const getLocationWeather=( locationId: string ) => {
		return weatherData[ locationId ]
	}

	// Handle search functionality
	const handleSearch=async () => {
		if ( !searchQuery.trim() ) return

		setIsSearching( true )
		try {
			const results=await searchCities( searchQuery )
			console.log( 'Search results:',results )
			setSearchResults( results )
			setShowSearchResults( true )
		} catch ( error ) {
			console.error( 'Search error:',error )
		} finally {
			setIsSearching( false )
		}
	}

	// Handle adding a location from search results
	const handleAddLocation=async ( weatherData: any ) => {
		try {
			// Convert WeatherData to Location format
			const location={
				id: `${weatherData.coord.lat}_${weatherData.coord.lon}`,
				name: weatherData.name,
				country: weatherData.sys?.country||weatherData.country,
				state: weatherData.state,
				lat: weatherData.coord.lat,
				lon: weatherData.coord.lon,
				isCurrentLocation: false
			}

			await addLocation( location )
			setShowSearchResults( false )
			setSearchQuery( '' )
			setSearchResults( [] )
		} catch ( error ) {
			console.error( 'Error adding location:',error )
		}
	}

	// Handle zooming to a location on the map
	const handleZoomToLocation=( lat: number,lon: number ) => {
		if ( mapRef.current&&( mapRef.current as any ).zoomToLocation ) {
			; ( mapRef.current as any ).zoomToLocation( lat,lon )
		}
	}

	// Handle removing a location
	const handleRemoveLocation=( locationId: string ) => {
		const location=locations.find( loc => loc.id===locationId )
		if ( location&&window.confirm( `Are you sure you want to remove ${location.name} from your saved locations?` ) ) {
			removeLocation( locationId )
		}
	}

	// Handle search input change
	const handleSearchInputChange=( e: React.ChangeEvent<HTMLInputElement> ) => {
		setSearchQuery( e.target.value )
		if ( e.target.value.trim()==='' ) {
			setShowSearchResults( false )
			setSearchResults( [] )
		}
	}

	// Handle search on Enter key
	const handleSearchKeyPress=( e: React.KeyboardEvent<HTMLInputElement> ) => {
		if ( e.key==='Enter' ) {
			handleSearch()
		}
	}

	return (
		<div className={`w-full ${className}`}>
			{/* Layer Selection and Search */}
			<div className="mb-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
						Weather Map Layers
					</h3>

					{/* Search Controls */}
					<div className="relative">
						<div className="flex gap-2">
							<input
								type="text"
								placeholder="Search for a city..."
								value={searchQuery}
								onChange={handleSearchInputChange}
								onKeyPress={handleSearchKeyPress}
								className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
							/>
							<button
								onClick={handleSearch}
								disabled={isSearching||!searchQuery.trim()}
								className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
							>
								{isSearching? '🔍':'🔍'}
							</button>
						</div>

						{/* Search Results Dropdown */}
						{showSearchResults&&searchResults.length>0&&(
							<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
								<div className="p-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
									Search Results ({searchResults.length})
								</div>
								{searchResults.map( ( result,index ) => (
									<div
										key={index}
										onClick={() => handleAddLocation( result )}
										className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-200 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
									>
										<div className="text-sm font-medium text-slate-900 dark:text-slate-100">
											{result.name}
										</div>
										<div className="text-xs text-slate-500 dark:text-slate-400">
											{result.state&&`${result.state}, `}{result.sys?.country||result.country}
										</div>
									</div>
								) )}
							</div>
						)}

						{showSearchResults&&searchResults.length===0&&searchQuery.trim()&&(
							<div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50 p-3">
								<div className="text-sm text-slate-500 dark:text-slate-400">
									No locations found for &quot;{searchQuery}&quot;
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
					{weatherLayers.map( ( layer ) => (
						<button
							key={layer.id}
							onClick={() => {
								console.log( `🌧️ Weather layer button clicked: ${layer.id}` )
								setSelectedLayer( layer.id )
							}}
							className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex flex-col items-center gap-1 ${selectedLayer===layer.id
								? 'bg-blue-500 text-white shadow-lg drop-shadow-lg'
								:'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 drop-shadow-md hover:drop-shadow-lg'
								}`}
							title={`${layer.description} (${layer.unit})`}
						>
							<span className="text-lg">{layer.emoji}</span>
							<span className="text-center leading-tight">{layer.name}</span>
						</button>
					) )}
				</div>
			</div>

			{/* Map Container */}
			<div className="relative">
				<div className="h-[48rem] w-full rounded-xl overflow-hidden shadow-lg">
					<MapComponent
						apiKey={getMapTilerApiKey()}
						center={mapConfig.center}
						zoom={mapConfig.zoom}
						selectedLayer={selectedLayer}
						weatherLayers={weatherLayers}
						locations={locations}
						currentLocation={currentLocation}
						weatherData={weatherData}
						onMapReady={( map ) => {
							mapRef.current=map
						}}
					/>
				</div>

				{/* Map Controls Overlay */}
				<div className="absolute bottom-[8rem] right-4 z-10">
					<div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
						<div className="flex items-center gap-2 mb-2">
							<span className="text-lg">
								{weatherLayers.find( layer => layer.id===selectedLayer )?.emoji}
							</span>
							<div>
								<div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
									{weatherLayers.find( layer => layer.id===selectedLayer )?.name}
								</div>
								<div className="text-xs text-slate-600 dark:text-slate-400">
									{weatherLayers.find( layer => layer.id===selectedLayer )?.description}
								</div>
							</div>
						</div>
						<div className="text-xs text-slate-500 dark:text-slate-500">
							Unit: {weatherLayers.find( layer => layer.id===selectedLayer )?.unit}
						</div>
					</div>
				</div>

			</div>

			{/* Location Cards */}
			{( locations.length>0||currentLocation )&&(
				<div className="mt-6">
					<h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
						Your Locations
					</h4>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* Current Location Card */}
						{currentLocation&&(
							<div className="glass-card rounded-xl p-4">
								<div className="flex items-center justify-between mb-2">
									<h5 className="font-semibold text-slate-800 dark:text-slate-200">
										📍 Current Location
									</h5>
									<span className="text-2xl">
										{getWeatherIconForCondition( getLocationWeather( currentLocation.id )?.weather?.[ 0 ]?.description||'clear sky' )}
									</span>
								</div>
								<div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
									<p><strong>Location:</strong> {currentLocation.name}</p>
									{currentLocation.state&&(
										<p><strong>State/Province:</strong> {currentLocation.state}</p>
									)}
									<p><strong>Country:</strong> {currentLocation.country}</p>
									<p><strong>Coordinates:</strong> {currentLocation.lat?.toFixed( 4 )}, {currentLocation.lon?.toFixed( 4 )}</p>
									{getLocationWeather( currentLocation.id )&&(
										<>
											<p><strong>Temperature:</strong> {Math.round( getLocationWeather( currentLocation.id )!.main.temp )}°C</p>
											<p><strong>Condition:</strong> {getLocationWeather( currentLocation.id )!.weather[ 0 ].description}</p>
										</>
									)}
								</div>
							</div>
						)}

						{/* Saved Locations Cards */}
						{locations.map( ( location ) => {
							const weather=getLocationWeather( location.id )
							return (
								<div key={location.id} className="glass-card rounded-xl p-4">
									<div className="flex items-center justify-between mb-2">
										<h5 className="font-semibold text-slate-800 dark:text-slate-200">
											{location.name}
										</h5>
										<div className="flex items-center gap-2">
											<span className="text-2xl">
												{getWeatherIconForCondition( weather?.weather?.[ 0 ]?.description||'clear sky' )}
											</span>
											<div className="flex gap-1">
												{/* Zoom to location button */}
												<button
													onClick={() => handleZoomToLocation( location.lat,location.lon )}
													className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
													title="Zoom to location on map"
												>
													<span className="text-sm">🔍</span>
												</button>
												{/* Remove location button */}
												<button
													onClick={() => handleRemoveLocation( location.id )}
													className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
													title="Remove location"
												>
													<span className="text-sm">🗑️</span>
												</button>
											</div>
										</div>
									</div>
									<div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
										<p><strong>Location:</strong> {location.name}</p>
										{location.state&&(
											<p><strong>State/Province:</strong> {location.state}</p>
										)}
										<p><strong>Country:</strong> {location.country}</p>
										<p><strong>Coordinates:</strong> {location.lat?.toFixed( 4 )}, {location.lon?.toFixed( 4 )}</p>
										{weather&&(
											<>
												<p><strong>Temperature:</strong> {Math.round( weather.main.temp )}°C</p>
												<p><strong>Condition:</strong> {weather.weather[ 0 ].description}</p>
											</>
										)}
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
					<p>• <strong>Base Map:</strong> Powered by MapTiler for high-quality mapping</p>
					<p>• <strong>Location Markers:</strong> Click markers to see detailed weather for your cities</p>
					<p>• <strong>Map Navigation:</strong> Zoom and pan to explore different regions</p>
					<p>• <strong>Weather Data:</strong> Real-time weather information from your saved locations</p>
					<p>• <strong>Weather Layers:</strong> Switch between 7 different weather metrics using the buttons above</p>
					<p>• <strong>Location Controls:</strong> Use 🔍 to zoom to a location or 🗑️ to remove it from your list</p>

					<div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
						<p className="text-green-800 dark:text-green-200 text-sm">
							<strong>✅ Weather Layers Available:</strong> Temperature, Precipitation, Wind, Pressure, Radar, Clouds, and Frozen Precipitation layers are now active!
						</p>
					</div>

					<div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
						{weatherLayers.map( ( layer ) => (
							<div key={layer.id} className="flex items-center gap-2 text-xs">
								<span className="text-sm">{layer.emoji}</span>
								<span className="text-slate-600 dark:text-slate-400">{layer.name}</span>
							</div>
						) )}
					</div>

					{getMapTilerApiKey()==='YOUR_MAPTILER_API_KEY'&&(
						<div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
							<p className="text-yellow-800 dark:text-yellow-200 text-sm">
								<strong>⚠️ MapTiler API Key Required:</strong> Add your MapTiler API key to <code>NEXT_PUBLIC_MAPTILER_API_KEY</code> environment variable to enable full functionality.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default WeatherMap