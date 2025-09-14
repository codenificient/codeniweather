'use client'

import { useWeather } from '@/contexts/WeatherContext'
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
	const { weatherData,locations,currentLocation,addLocation,searchCities }=useWeather()
	const [ selectedLayer,setSelectedLayer ]=useState( 'temperature' )
	const [ isSearching,setIsSearching ]=useState( false )
	const [ searchQuery,setSearchQuery ]=useState( '' )
	const [ searchResults,setSearchResults ]=useState<any[]>( [] )
	const [ showSearchResults,setShowSearchResults ]=useState( false )
	const mapRef=useRef<Map|null>( null )

	// Weather map layers using MapTiler Weather SDK
	const weatherLayers=[
		{ id: 'temperature',name: 'Temperature',description: 'Air temperature',unit: '°C',emoji: '🌡️',type: 'temperature' },
		{ id: 'precipitation',name: 'Precipitation',description: 'Precipitation intensity',unit: 'mm/h',emoji: '🌧️',type: 'precipitation' },
		{ id: 'pressure',name: 'Pressure',description: 'Atmospheric pressure',unit: 'hPa',emoji: '📊',type: 'pressure' },
		{ id: 'wind',name: 'Wind',description: 'Wind speed and direction',unit: 'm/s',emoji: '💨',type: 'wind' },
		{ id: 'radar',name: 'Radar',description: 'Weather radar',unit: 'dBZ',emoji: '📡',type: 'radar' }
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

	// Get weather icon based on weather condition
	const getWeatherIcon=( condition: string ) => {
		const conditionMap: { [ key: string ]: string }={
			'clear sky': '☀️',
			'few clouds': '🌤️',
			'scattered clouds': '⛅',
			'broken clouds': '☁️',
			'shower rain': '🌦️',
			'rain': '🌧️',
			'thunderstorm': '⛈️',
			'snow': '❄️',
			'mist': '🌫️',
			'fog': '🌫️',
			'haze': '🌫️'
		}
		return conditionMap[ condition.toLowerCase() ]||'🌤️'
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
				country: weatherData.country,
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
											{result.state&&`${result.state}, `}{result.country}
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

				<div className="flex flex-wrap gap-2">
					{weatherLayers.map( ( layer ) => (
						<button
							key={layer.id}
							onClick={() => setSelectedLayer( layer.id )}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedLayer===layer.id
								? 'bg-blue-500 text-white shadow-lg'
								:'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
								}`}
						>
							<span className="mr-2">{layer.emoji}</span>
							{layer.name}
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
				<div className="absolute top-4 right-4 z-10">
					<div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2">
						<div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
							{weatherLayers.find( layer => layer.id===selectedLayer )?.description}
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
										{getWeatherIcon( getLocationWeather( currentLocation.id )?.weather?.[ 0 ]?.description||'clear sky' )}
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
										<span className="text-2xl">
											{getWeatherIcon( weather?.weather?.[ 0 ]?.description||'clear sky' )}
										</span>
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
					<div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg">
						<p className="text-blue-800 dark:text-blue-200 text-sm">
							<strong>ℹ️ Weather Layers:</strong> Weather layer functionality is being migrated to MapTiler. Layer buttons are currently for display purposes.
						</p>
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