'use client'

import MapComponent from '@/components/MapComponent'
import { useTheme } from '@/contexts/ThemeContext'
import { useWeather } from '@/contexts/WeatherContext'
import { Location as WeatherLocation } from '@/types/weather'
import { useRouter } from 'next/navigation'
import { useEffect,useState } from 'react'
// MapTiler API key helper
const getMapTilerApiKey=() => {
	return process.env.NEXT_PUBLIC_MAPTILER_API_KEY||'YOUR_MAPTILER_API_KEY'
}

export default function FullscreenMapPage () {
	const router=useRouter()
	const { theme }=useTheme()
	const { locations,currentLocation,selectedLayer,setSelectedLayer }=useWeather()
	const [ isMapReady,setIsMapReady ]=useState( false )

	// Calculate map center and zoom based on locations
	const getMapCenterAndZoom=() => {
		if ( locations.length===0 ) {
			return {
				center: [ -98.5795,39.8283 ] as [ number,number ], // Center of US
				zoom: 4
			}
		}

		if ( locations.length===1 ) {
			return {
				center: [ locations[ 0 ].lon,locations[ 0 ].lat ] as [ number,number ],
				zoom: 8
			}
		}

		// Calculate bounds for multiple locations
		const lats=locations.map( loc => loc.lat )
		const lons=locations.map( loc => loc.lon )

		const minLat=Math.min( ...lats )
		const maxLat=Math.max( ...lats )
		const minLon=Math.min( ...lons )
		const maxLon=Math.max( ...lons )

		const centerLat=( minLat+maxLat )/2
		const centerLon=( minLon+maxLon )/2

		// Calculate appropriate zoom level based on bounds
		const latDiff=maxLat-minLat
		const lonDiff=maxLon-minLon
		const maxDiff=Math.max( latDiff,lonDiff )

		let zoom=4
		if ( maxDiff<0.1 ) zoom=10
		else if ( maxDiff<0.5 ) zoom=8
		else if ( maxDiff<1 ) zoom=6
		else if ( maxDiff<2 ) zoom=5

		return {
			center: [ centerLon,centerLat ] as [ number,number ],
			zoom
		}
	}

	const mapConfig=getMapCenterAndZoom()

	// Weather map layers
	const weatherLayers=[
		{ id: 'temperature',name: 'Temperature',description: 'Air temperature at 2m above ground',unit: '°C',emoji: '🌡️',type: 'temperature',variableId: 'GFS_TEMPERATURE_2M' },
		{ id: 'precipitation',name: 'Precipitation',description: 'Hourly precipitation rate',unit: 'mm/h',emoji: '🌧️',type: 'precipitation',variableId: 'GFS_PRECIPITATION_1H' },
		{ id: 'wind',name: 'Wind',description: 'Wind speed and direction at 10m above ground',unit: 'm/s',emoji: '💨',type: 'wind',variableId: 'GFS_WIND_SPEED_10M' },
		{ id: 'pressure',name: 'Pressure',description: 'Atmospheric pressure at sea level',unit: 'hPa',emoji: '📊',type: 'pressure',variableId: 'GFS_PRESSURE_MSL' },
		{ id: 'radar',name: 'Radar',description: 'Weather radar precipitation',unit: 'dBZ',emoji: '📡',type: 'radar',variableId: 'GFS_RADAR_PRECIPITATION' },
		{ id: 'clouds',name: 'Clouds',description: 'Total cloud cover percentage',unit: '%',emoji: '☁️',type: 'clouds',variableId: 'GFS_CLOUD_COVER_TOTAL' },
		{ id: 'frozen-precipitation',name: 'Snow',description: 'Frozen precipitation (snow) rate',unit: 'mm/h',emoji: '❄️',type: 'frozen-precipitation',variableId: 'GFS_FROZEN_PRECIPITATION_1H' }
	]

	// Handle escape key to return to map page
	useEffect( () => {
		const handleKeyDown=( event: KeyboardEvent ) => {
			if ( event.key==='Escape' ) {
				router.push( '/map' )
			}
		}

		document.addEventListener( 'keydown',handleKeyDown )
		return () => {
			document.removeEventListener( 'keydown',handleKeyDown )
		}
	},[ router ] )


	return (
		<div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 flex flex-col overflow-hidden">
			{/* Header with controls and return button */}
			<div className="bg-white dark:bg-slate-800 shadow-lg z-20 p-4 flex-shrink-0">
				<div className="flex justify-between items-center">
					{/* Left side - Title and layer info */}
					<div className="flex items-center gap-4">
						<h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
							Fullscreen Weather Map
						</h1>
						{selectedLayer&&(
							<div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-lg">
								<span className="text-lg">
									{weatherLayers.find( layer => layer.id===selectedLayer )?.emoji}
								</span>
								<span className="text-sm font-medium text-blue-800 dark:text-blue-200">
									{weatherLayers.find( layer => layer.id===selectedLayer )?.name}
								</span>
							</div>
						)}
					</div>

					{/* Right side - Controls and return button */}
					<div className="flex items-center gap-3">
						{/* Weather Layer Buttons */}
						<div className="flex gap-2">
							{weatherLayers.map( ( layer ) => (
								<button
									key={layer.id}
									onClick={() => setSelectedLayer( layer.id )}
									className={`
										px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
										${selectedLayer===layer.id
											? 'bg-blue-500 text-white shadow-md'
											:'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
										}
									`}
									title={layer.description}
								>
									<span className="mr-1">{layer.emoji}</span>
									{layer.name}
								</button>
							) )}
						</div>

						{/* Return Button */}
						<button
							onClick={() => router.push( '/map' )}
							className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors duration-200"
							title="Return to map page"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
							</svg>
							<span className="text-sm font-medium">Return to Map</span>
						</button>
					</div>
				</div>
			</div>

			{/* Fullscreen Map Container */}
			<div className="flex-1 relative overflow-hidden">
				<MapComponent
					apiKey={getMapTilerApiKey()}
					center={mapConfig.center}
					zoom={mapConfig.zoom}
					selectedLayer={selectedLayer}
					locations={locations as WeatherLocation[]}
					currentLocation={currentLocation as WeatherLocation|null}
					webglSupported={true}
					onMapReady={() => setIsMapReady( true )}
				/>
			</div>

			{/* Loading overlay */}
			{!isMapReady&&(
				<div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center z-30">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
						<p className="text-slate-600 dark:text-slate-400 text-lg">Loading fullscreen map...</p>
					</div>
				</div>
			)}
		</div>
	)
}
