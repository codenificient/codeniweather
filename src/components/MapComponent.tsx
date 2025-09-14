'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { getWeatherIcon } from '@/lib/weather-icons'
import { Map,Marker,NavigationControl,Popup } from '@maptiler/sdk'
import { PrecipitationLayer,PressureLayer,RadarLayer,TemperatureLayer,WindLayer } from '@maptiler/weather'
import { useEffect,useRef,useState } from 'react'

interface MapComponentProps {
	apiKey: string
	center: [ number,number ]
	zoom: number
	selectedLayer: string
	weatherLayers: any[]
	locations: any[]
	currentLocation: any
	weatherData: Record<string,any>
	onMapReady: ( map: Map ) => void
	onZoomToLocation?: ( lat: number,lon: number ) => void
}

const MapComponent: React.FC<MapComponentProps>=( {
	apiKey,
	center,
	zoom,
	selectedLayer,
	weatherLayers,
	locations,
	currentLocation,
	weatherData,
	onMapReady,
	onZoomToLocation
} ) => {
	const { theme }=useTheme()
	const mapContainer=useRef<HTMLDivElement>( null )
	const mapRef=useRef<Map|null>( null )
	const markersRef=useRef<Marker[]>( [] )
	const weatherLayerRef=useRef<any>( null )
	const mouseMoveHandlerRef=useRef<any>( null )
	const mouseLeaveHandlerRef=useRef<any>( null )
	const navigationControlRef=useRef<any>( null )
	const [ precipitationData,setPrecipitationData ]=useState<Record<string,any>>( {} )
	const [ cursorWeatherData,setCursorWeatherData ]=useState<any>( null )
	const [ cursorPosition,setCursorPosition ]=useState<{ lat: number; lng: number }|null>( null )
	const [ isAnimating,setIsAnimating ]=useState( false )
	const [ animationTime,setAnimationTime ]=useState( 0 )
	const [ isPlaying,setIsPlaying ]=useState( true )
	const [ isMapReady,setIsMapReady ]=useState( false )
	const [ layerCreationRetryCount,setLayerCreationRetryCount ]=useState( 0 )

	// Time animation control functions
	const toggleAnimation=() => {
		if ( weatherLayerRef.current ) {
			if ( isPlaying ) {
				weatherLayerRef.current.pause()
				setIsPlaying( false )
			} else {
				weatherLayerRef.current.play()
				setIsPlaying( true )
			}
		}
	}

	const resetAnimation=() => {
		if ( weatherLayerRef.current&&typeof weatherLayerRef.current.reset==='function' ) {
			weatherLayerRef.current.reset()
			setAnimationTime( 0 )
		}
	}

	const setAnimationTimeValue=( time: number ) => {
		if ( weatherLayerRef.current&&typeof weatherLayerRef.current.setTime==='function' ) {
			weatherLayerRef.current.setTime( time )
			setAnimationTime( time )
		}
	}

	// Get weather icon based on weather condition and theme
	const getWeatherIconForCondition=( condition: string ) => {
		return getWeatherIcon( condition,theme )
	}

	// Get weather data for a location
	const getLocationWeather=( locationId: string ) => {
		return weatherData[ locationId ]
	}

	// Create weather layer based on selected type
	const createWeatherLayer=( layerType: string,retryCount: number=0 ) => {
		if ( !mapRef.current ) {
			console.log( `⏳ Map not initialized for weather layer creation: ${layerType}` )
			return null
		}

		// Check if map style is loaded
		if ( !mapRef.current.isStyleLoaded() ) {
			console.log( `⏳ Map style not loaded for weather layer creation: ${layerType}, retry ${retryCount}` )

			// Retry after a short delay if we haven't exceeded max retries
			if ( retryCount<10 ) {
				setTimeout( () => {
					createWeatherLayer( layerType,retryCount+1 )
				},500 )
			} else {
				console.error( `❌ Max retries exceeded for weather layer creation: ${layerType}` )
			}
			return null
		}

		// Remove existing weather layer
		if ( weatherLayerRef.current&&mapRef.current ) {
			mapRef.current.removeLayer( weatherLayerRef.current )
			weatherLayerRef.current=null
		}

		try {
			console.log( `Creating weather layer: ${layerType}` )
			let layer=null

			switch ( layerType ) {
				case 'temperature':
					layer=new TemperatureLayer( {
						opacity: 0.7,
						smooth: true
					} )
					break
				case 'precipitation':
					layer=new PrecipitationLayer( {
						opacity: 0.8,
						smooth: true
					} )
					console.log( `🌧️ Precipitation layer created with opacity 0.8` )
					// Start animation after layer is created
					if ( layer&&typeof layer.animateByFactor==='function' ) {
						layer.animateByFactor( 3600 ) // 1 second = 1 hour
						console.log( `🌧️ Precipitation layer animation started` )
					}
					break
				case 'wind':
					layer=new WindLayer( {
						opacity: 0.6,
						smooth: true,
						density: 2,
						size: 1.5,
						speed: 0.001
					} )
					break
				case 'pressure':
					layer=new PressureLayer( {
						opacity: 0.7,
						smooth: true
					} )
					break
				case 'radar':
					layer=new RadarLayer( {
						opacity: 0.9,
						smooth: true
					} )
					break
				case 'clouds':
				case 'frozen-precipitation':
					// For clouds and frozen precipitation, we'll use a generic approach
					// These might need custom implementation or different layer types
					console.log( `Weather layer ${layerType} not yet implemented with MapTiler Weather SDK` )
					return null
				default:
					console.log( `Unknown weather layer type: ${layerType}` )
					return null
			}

			if ( layer ) {
				// Add the layer to the map using MapTiler's addLayer method
				mapRef.current.addLayer( layer )
				weatherLayerRef.current=layer

				// Start animation for all weather layers (4-day forecast: 1 second = 1 hour)
				if ( layer&&typeof layer.animateByFactor==='function' ) {
					layer.animateByFactor( 3600 ) // 1 second = 1 hour
					setIsAnimating( true )
					console.log( `🌦️ ${layerType} layer animation started (4-day forecast)` )
				}

				// Add cursor interaction for weather data access
				const handleMouseMove=( e: any ) => {
					const { lng,lat }=e.lngLat
					setCursorPosition( { lat,lng } )

					// Get weather data at cursor position
					if ( layer&&'getDataAtPoint' in layer&&typeof ( layer as any ).getDataAtPoint==='function' ) {
						try {
							const data=( layer as any ).getDataAtPoint( [ lng,lat ] )
							setCursorWeatherData( data )
						} catch ( error ) {
							console.warn( `Error getting weather data at cursor:`,error )
						}
					}
				}

				const handleMouseLeave=() => {
					setCursorWeatherData( null )
					setCursorPosition( null )
				}

				// Store handlers in refs for proper cleanup
				mouseMoveHandlerRef.current=handleMouseMove
				mouseLeaveHandlerRef.current=handleMouseLeave

				// Add event listeners for cursor data access
				mapRef.current.on( 'mousemove',handleMouseMove )
				mapRef.current.on( 'mouseleave',handleMouseLeave )

				// Get weather data for saved locations
				const allLocations=[ ...locations ]
				if ( currentLocation ) {
					allLocations.unshift( currentLocation )
				}

				allLocations.forEach( ( location ) => {
					if ( layer&&'getDataAtPoint' in layer&&typeof ( layer as any ).getDataAtPoint==='function' ) {
						try {
							const data=( layer as any ).getDataAtPoint( [ location.lon,location.lat ] )
							if ( layerType==='precipitation' ) {
								setPrecipitationData( prev => ( {
									...prev,
									[ location.id ]: data
								} ) )
							}
							console.log( `${layerType} data for ${location.name}:`,data )
						} catch ( error ) {
							console.warn( `Error getting ${layerType} data for ${location.name}:`,error )
						}
					}
				} )
			}

			return layer
		} catch ( error ) {
			console.error( `Error creating weather layer ${layerType}:`,error )
			return null
		}
	}

	// Initialize map
	useEffect( () => {
		if ( !mapContainer.current||mapRef.current ) return

		// Set MapTiler API key
		if ( apiKey&&apiKey!=='YOUR_MAPTILER_API_KEY' ) {
			// MapTiler SDK automatically uses the apiKey parameter in the Map constructor
		}

		try {
			// Create map
			const map=new Map( {
				container: mapContainer.current,
				style: 'streets-v2',
				center: center,
				zoom: zoom,
				...( apiKey&&apiKey!=='YOUR_MAPTILER_API_KEY'&&{ apiKey } )
			} )

			// Add navigation control only if it hasn't been added yet
			if ( !navigationControlRef.current ) {
				const navControl=new NavigationControl()
				map.addControl( navControl,'top-right' )
				navigationControlRef.current=navControl
			}

			mapRef.current=map

				// Add zoom to location method to the map instance
				; ( map as any ).zoomToLocation=( lat: number,lon: number ) => {
					map.flyTo( {
						center: [ lon,lat ],
						zoom: 10,
						duration: 1000
					} )
				}

			// Wait for map style to load before creating weather layers
			map.on( 'style.load',() => {
				console.log( '✅ Map style loaded successfully' )
				setIsMapReady( true )
			} )

			// Handle WebGL context loss
			map.on( 'webglcontextlost',() => {
				console.warn( 'WebGL context lost - this is usually harmless' )
			} )

			onMapReady( map )

			// Add markers for all locations
			const allLocations=[ ...locations ]
			if ( currentLocation ) {
				allLocations.unshift( currentLocation )
			}

			allLocations.forEach( ( location ) => {
				// Validate coordinates before creating marker
				if ( !location.lat||!location.lon||isNaN( location.lat )||isNaN( location.lon ) ) {
					console.warn( `Invalid coordinates for location ${location.name}:`,location )
					return
				}

				const weather=getLocationWeather( location.id )
				const weatherIcon=getWeatherIconForCondition( weather?.weather?.description||'clear sky' )

				const marker=new Marker( {
					color: location.id===currentLocation?.id? '#3b82f6':'#ef4444'
				} )
					.setLngLat( [ location.lon,location.lat ] )
					.setPopup(
						new Popup().setHTML( `
							<div class="p-2">
								<div class="flex items-center gap-2 mb-2">
									<span class="text-2xl">${weatherIcon}</span>
									<div>
										<h3 class="font-semibold text-slate-800">${location.name}</h3>
										${location.id===currentLocation?.id? '<p class="text-xs text-blue-600">📍 Current Location</p>':''}
									</div>
								</div>
								${weather? `
									<div class="text-sm text-slate-600 space-y-1">
										<p><strong>Temperature:</strong> ${Math.round( weather.main.temp )}°C</p>
										<p><strong>Condition:</strong> ${weather.weather[ 0 ].description}</p>
										<p><strong>Humidity:</strong> ${weather.main.humidity}%</p>
										<p><strong>Wind:</strong> ${weather.wind.speed} m/s</p>
									</div>
								` :'<p class="text-sm text-slate-500">No weather data available</p>'}
							</div>
						`)
					)
					.addTo( map )

				markersRef.current.push( marker )
			} )

			// Fit map to show all markers
			if ( allLocations.length>0 ) {
				const validLocations=allLocations.filter( loc =>
					loc.lat&&loc.lon&&!isNaN( loc.lat )&&!isNaN( loc.lon )
				)

				if ( validLocations.length>0 ) {
					const lngs=validLocations.map( loc => loc.lon )
					const lats=validLocations.map( loc => loc.lat )
					const bounds=[
						Math.min( ...lngs ), // west
						Math.min( ...lats ), // south
						Math.max( ...lngs ), // east
						Math.max( ...lats )  // north
					] as [ number,number,number,number ]
					map.fitBounds( bounds,{ padding: 50 } )
				}
			}

		} catch ( error ) {
			console.error( 'Error initializing MapTiler map:',error )
		}

		// Cleanup
		return () => {
			if ( mapRef.current ) {
				// Remove navigation control if it exists
				if ( navigationControlRef.current ) {
					mapRef.current.removeControl( navigationControlRef.current )
					navigationControlRef.current=null
				}
				// Event listeners will be cleaned up when map is removed
			}
			if ( weatherLayerRef.current&&mapRef.current ) {
				mapRef.current.removeLayer( weatherLayerRef.current )
				weatherLayerRef.current=null
			}
			if ( mapRef.current ) {
				mapRef.current.remove()
				mapRef.current=null
			}
			markersRef.current=[]
		}
	},[ apiKey,center,zoom,onMapReady ] )

	// Update markers when locations change
	useEffect( () => {
		if ( !mapRef.current ) return

		// Clear existing markers
		markersRef.current.forEach( marker => marker.remove() )
		markersRef.current=[]

		// Add new markers
		const allLocations=[ ...locations ]
		if ( currentLocation ) {
			allLocations.unshift( currentLocation )
		}

		allLocations.forEach( ( location ) => {
			// Validate coordinates before creating marker
			if ( !location.lat||!location.lon||isNaN( location.lat )||isNaN( location.lon ) ) {
				console.warn( `Invalid coordinates for location ${location.name}:`,location )
				return
			}

			const weather=getLocationWeather( location.id )
			const weatherIcon=getWeatherIconForCondition( weather?.weather?.description||'clear sky' )

			const marker=new Marker( {
				color: location.id===currentLocation?.id? '#3b82f6':'#ef4444'
			} )
				.setLngLat( [ location.lon,location.lat ] )
				.setPopup(
					new Popup().setHTML( `
						<div class="p-2">
							<div class="flex items-center gap-2 mb-2">
								<span class="text-2xl">${weatherIcon}</span>
								<div>
									<h3 class="font-semibold text-slate-800">${location.name}</h3>
									${location.id===currentLocation?.id? '<p class="text-xs text-blue-600">📍 Current Location</p>':''}
								</div>
							</div>
							${weather? `
								<div class="text-sm text-slate-600 space-y-1">
									<p><strong>Temperature:</strong> ${Math.round( weather.main.temp )}°C</p>
									<p><strong>Condition:</strong> ${weather.weather[ 0 ].description}</p>
									<p><strong>Humidity:</strong> ${weather.main.humidity}%</p>
									<p><strong>Wind:</strong> ${weather.wind.speed} m/s</p>
								</div>
							` :'<p class="text-sm text-slate-500">No weather data available</p>'}
						</div>
					`)
				)
				.addTo( mapRef.current! )

			markersRef.current.push( marker )
		} )

		// Fit map to show all markers
		if ( allLocations.length>0 ) {
			const validLocations=allLocations.filter( loc =>
				loc.lat&&loc.lon&&!isNaN( loc.lat )&&!isNaN( loc.lon )
			)

			if ( validLocations.length>0 ) {
				const lngs=validLocations.map( loc => loc.lon )
				const lats=validLocations.map( loc => loc.lat )
				const bounds=[
					Math.min( ...lngs ), // west
					Math.min( ...lats ), // south
					Math.max( ...lngs ), // east
					Math.max( ...lats )  // north
				] as [ number,number,number,number ]
				mapRef.current.fitBounds( bounds,{ padding: 50 } )
			}
		}
	},[ locations,currentLocation,weatherData ] )

	// Handle weather layer changes
	useEffect( () => {
		if ( !mapRef.current ) return

		// Clean up previous weather layer
		if ( weatherLayerRef.current ) {
			try {
				// Remove event listeners
				if ( mouseMoveHandlerRef.current ) {
					mapRef.current.off( 'mousemove',mouseMoveHandlerRef.current )
				}
				if ( mouseLeaveHandlerRef.current ) {
					mapRef.current.off( 'mouseleave',mouseLeaveHandlerRef.current )
				}

				// Remove layer
				mapRef.current.removeLayer( weatherLayerRef.current )
				console.log( `🗑️ Previous weather layer removed` )
			} catch ( error ) {
				console.warn( `Error removing previous weather layer:`,error )
			}
			weatherLayerRef.current=null
		}

		// Clear weather data when switching layers
		setPrecipitationData( {} )
		setCursorWeatherData( null )
		setCursorPosition( null )
		setIsAnimating( false )

		// Create the selected weather layer with retry mechanism
		const layer=createWeatherLayer( selectedLayer )
		if ( layer ) {
			console.log( `✅ Weather layer ${selectedLayer} added to map successfully` )
		} else {
			console.log( `⏳ Weather layer ${selectedLayer} creation queued (will retry when map is ready)` )
		}
	},[ selectedLayer ] )

	// Create weather layer when map becomes ready
	useEffect( () => {
		if ( isMapReady&&mapRef.current&&selectedLayer ) {
			console.log( `🔄 Map is ready, creating weather layer: ${selectedLayer}` )
			const layer=createWeatherLayer( selectedLayer )
			if ( layer ) {
				console.log( `✅ Weather layer ${selectedLayer} created successfully after map ready` )
			}
		}
	},[ isMapReady,selectedLayer ] )

	// Update precipitation data when locations change and precipitation layer is active
	useEffect( () => {
		if ( selectedLayer==='precipitation'&&weatherLayerRef.current&&mapRef.current ) {
			const allLocations=[ ...locations ]
			if ( currentLocation ) {
				allLocations.unshift( currentLocation )
			}

			allLocations.forEach( ( location ) => {
				if ( weatherLayerRef.current&&'getDataAtPoint' in weatherLayerRef.current&&typeof ( weatherLayerRef.current as any ).getDataAtPoint==='function' ) {
					try {
						const data=( weatherLayerRef.current as any ).getDataAtPoint( [ location.lon,location.lat ] )
						setPrecipitationData( prev => ( {
							...prev,
							[ location.id ]: data
						} ) )
						console.log( `Updated precipitation data for ${location.name}:`,data )
					} catch ( error ) {
						console.warn( `Error updating precipitation data for ${location.name}:`,error )
					}
				}
			} )
		}
	},[ selectedLayer,locations,currentLocation ] )

	return (
		<div className="relative w-full h-full">
			<div ref={mapContainer} className="w-full h-full" />

			{/* Map Loading Indicator */}
			{!isMapReady&&(
				<div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center z-20">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
						<p className="text-slate-600 dark:text-slate-400 text-sm">Loading map...</p>
					</div>
				</div>
			)}

			{/* Time Animation Control Bar */}
			{isAnimating&&(
				<div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 z-10">
					<div className="flex items-center gap-4 mb-3">
						<div className="flex items-center gap-2">
							<span className="text-lg">⏱️</span>
							<h3 className="font-semibold text-slate-800 dark:text-slate-200">Weather Animation</h3>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={toggleAnimation}
								className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
							>
								{isPlaying? '⏸️ Pause':'▶️ Play'}
							</button>
							<button
								onClick={resetAnimation}
								className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
							>
								🔄 Reset
							</button>
						</div>
					</div>
					<div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
						4-day forecast • 1 second = 1 hour • Move cursor over map for data
					</div>
					<div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
						<div
							className="bg-blue-500 h-2 rounded-full transition-all duration-300"
							style={{ width: `${( animationTime/96 )*100}%` }}
						/>
					</div>
				</div>
			)}

			{/* Cursor Weather Data Display */}
			{cursorWeatherData&&cursorPosition&&(
				<div className="absolute top-16 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 z-10 max-w-xs">
					<div className="flex items-center gap-2 mb-2">
						<span className="text-2xl">🌦️</span>
						<h3 className="font-semibold text-slate-800 dark:text-slate-200">Weather Data</h3>
					</div>
					<div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
						<p><strong>Location:</strong> {cursorPosition.lat.toFixed( 4 )}, {cursorPosition.lng.toFixed( 4 )}</p>
						{selectedLayer==='temperature'&&cursorWeatherData.temperature!==undefined&&(
							<p><strong>Temperature:</strong> {cursorWeatherData.temperature.toFixed( 1 )}°C</p>
						)}
						{selectedLayer==='precipitation'&&cursorWeatherData.precipitation!==undefined&&(
							<p><strong>Precipitation:</strong> {cursorWeatherData.precipitation.toFixed( 2 )} mm/h</p>
						)}
						{selectedLayer==='wind'&&cursorWeatherData.windSpeed!==undefined&&(
							<p><strong>Wind Speed:</strong> {cursorWeatherData.windSpeed.toFixed( 1 )} m/s</p>
						)}
						{selectedLayer==='pressure'&&cursorWeatherData.pressure!==undefined&&(
							<p><strong>Pressure:</strong> {cursorWeatherData.pressure.toFixed( 1 )} hPa</p>
						)}
						{cursorWeatherData.timestamp&&(
							<p><strong>Time:</strong> {new Date( cursorWeatherData.timestamp ).toLocaleString()}</p>
						)}
					</div>
					<div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
						Move cursor over map to see weather data
					</div>
				</div>
			)}

			{/* Precipitation Data Display for Saved Locations */}
			{selectedLayer==='precipitation'&&Object.keys( precipitationData ).length>0&&(
				<div className="absolute top-16 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 z-10 max-w-sm">
					<div className="flex items-center gap-2 mb-3">
						<span className="text-2xl">🌧️</span>
						<h3 className="font-semibold text-slate-800 dark:text-slate-200">Precipitation Data</h3>
					</div>
					<div className="space-y-3 max-h-64 overflow-y-auto">
						{Object.entries( precipitationData ).map( ( [ locationId,data ] ) => {
							const location=[ ...locations,currentLocation ].find( loc => loc?.id===locationId )
							if ( !location||!data ) return null

							return (
								<div key={locationId} className="border-b border-slate-200 dark:border-slate-600 pb-2 last:border-b-0">
									<div className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">
										{location.name}
									</div>
									<div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
										{data.precipitation!==undefined&&(
											<p><strong>Precipitation:</strong> {data.precipitation.toFixed( 2 )} mm/h</p>
										)}
										{data.timestamp&&(
											<p><strong>Time:</strong> {new Date( data.timestamp ).toLocaleString()}</p>
										)}
										<p><strong>Coordinates:</strong> {location.lat.toFixed( 4 )}, {location.lon.toFixed( 4 )}</p>
									</div>
								</div>
							)
						} )}
					</div>
					<div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
						Precipitation data for your saved locations
					</div>
				</div>
			)}
		</div>
	)
}

export default MapComponent
