'use client'

import StateWeatherBadge from '@/components/StateWeatherBadge'
import { useTheme } from '@/contexts/ThemeContext'
import { CloudLayer,FrozenPrecipitationLayer } from '@/lib/custom-weather-layers'
import { US_STATES } from '@/lib/state-boundaries'
import { stateWeatherAggregator,StateWeatherData } from '@/lib/state-weather-aggregator'
import { getWeatherIcon } from '@/lib/weather-icons'
import { Location as WeatherLocation } from '@/types/weather'
import { Map,Marker,NavigationControl,Popup } from '@maptiler/sdk'
import { PrecipitationLayer,PressureLayer,RadarLayer,TemperatureLayer,WindLayer } from '@maptiler/weather'
import { useEffect,useRef,useState } from 'react'

interface MapComponentProps {
	apiKey: string
	center: [ number,number ]
	zoom: number
	selectedLayer: string
	locations: WeatherLocation[]
	currentLocation: WeatherLocation|null
	webglSupported: boolean
	onMapReady?: () => void
	onZoomToLocation?: ( lat: number,lon: number ) => void
}

// Helper function to convert wind direction degrees to compass direction
const getWindDirection=( degrees: number ): string => {
	const directions=[ 'N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW' ]
	const index=Math.round( degrees/22.5 )%16
	return directions[ index ]
}

const MapComponent: React.FC<MapComponentProps>=( {
	apiKey,
	center,
	zoom,
	selectedLayer,
	locations,
	currentLocation,
	webglSupported,
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
	const [ stateWeatherData,setStateWeatherData ]=useState<StateWeatherData[]>( [] )
	const [ mapBounds,setMapBounds ]=useState<{ north: number,south: number,east: number,west: number }|null>( null )
	const [ isUpdatingStateData,setIsUpdatingStateData ]=useState( false )
	const [ isFullscreen,setIsFullscreen ]=useState( false )

	// Time animation control functions
	const toggleAnimation=() => {
		if ( weatherLayerRef.current ) {
			if ( isPlaying ) {
				// Stop animation by setting factor to 0
				if ( typeof weatherLayerRef.current.animateByFactor==='function' ) {
					weatherLayerRef.current.animateByFactor( 0 )
				}
				setIsPlaying( false )
			} else {
				// Resume animation by setting factor to 3600 (1 second = 1 hour)
				if ( typeof weatherLayerRef.current.animateByFactor==='function' ) {
					weatherLayerRef.current.animateByFactor( 3600 )
				}
				setIsPlaying( true )
			}
		}
	}

	const resetAnimation=() => {
		if ( weatherLayerRef.current&&typeof weatherLayerRef.current.animateByFactor==='function' ) {
			// Reset animation to beginning
			weatherLayerRef.current.animateByFactor( 0 )
			setTimeout( () => {
				if ( weatherLayerRef.current&&typeof weatherLayerRef.current.animateByFactor==='function' ) {
					weatherLayerRef.current.animateByFactor( 3600 )
				}
			},100 )
			setAnimationTime( 0 )
		}
	}

	const setAnimationTimeValue=( time: number ) => {
		// MapTiler weather layers don't have a direct setTime method
		// This is a placeholder for future implementation
		console.log( 'setAnimationTimeValue not implemented for MapTiler weather layers' )
		setAnimationTime( time )
	}

	// Get weather icon based on weather condition and theme
	const getWeatherIconForCondition=( condition: string ) => {
		return getWeatherIcon( condition,theme )
	}

	// Get weather data for a location (placeholder - would need to be passed as prop or fetched)
	const getLocationWeather=( locationId: string ) => {
		return null
	}

	// State weather data functions
	const updateStateWeatherData=async () => {
		if ( !mapBounds||!selectedLayer ) return

		setIsUpdatingStateData( true )

		try {
			// Clear existing data for the current layer
			stateWeatherAggregator.clearOldSamples()

			// Generate sample data for demonstration
			stateWeatherAggregator.generateSampleData( selectedLayer,mapBounds )

			// Get aggregated data
			const data=stateWeatherAggregator.getStateWeatherData( selectedLayer )
			setStateWeatherData( data )

			console.log( `🔄 Updated state weather data for ${selectedLayer}:`,data.length,'states' )
		} catch ( error ) {
			console.error( 'Error updating state weather data:',error )
		} finally {
			setIsUpdatingStateData( false )
		}
	}

	// Convert lat/lng to pixel coordinates for badge positioning
	const getBadgePosition=( lat: number,lng: number ): { x: number; y: number } => {
		if ( !mapRef.current ) return { x: 0,y: 0 }

		const point=mapRef.current.project( [ lng,lat ] )
		return { x: point.x,y: point.y }
	}

	// Check if a state should be visible based on map bounds and zoom
	const isStateVisible=( stateData: StateWeatherData ): boolean => {
		if ( !mapBounds ) return false

		// Only show states that are at least partially visible in the current map bounds
		const state=US_STATES.find( s => s.id===stateData.stateId )
		if ( !state ) return false

		return state.bounds.north>=mapBounds.south&&
			state.bounds.south<=mapBounds.north&&
			state.bounds.east>=mapBounds.west&&
			state.bounds.west<=mapBounds.east
	}

	// Fullscreen toggle function
	const toggleFullscreen=() => {
		if ( !document.fullscreenElement ) {
			// Enter fullscreen
			if ( mapContainer.current?.requestFullscreen ) {
				mapContainer.current.requestFullscreen()
				setIsFullscreen( true )
			}
		} else {
			// Exit fullscreen
			if ( document.exitFullscreen ) {
				document.exitFullscreen()
				setIsFullscreen( false )
			}
		}
	}

	// Create weather layer based on selected type
	const createWeatherLayer=async ( layerType: string,retryCount: number=0 ) => {
		if ( !mapRef.current ) {
			console.log( `⏳ Map not initialized for weather layer creation: ${layerType}` )
			return null
		}

		// Check if WebGL is supported
		if ( !webglSupported ) {
			console.warn( `⚠️ WebGL not supported - skipping weather layer creation: ${layerType}` )
			return null
		}

		// Check if map style is loaded
		if ( !mapRef.current.isStyleLoaded() ) {
			console.log( `⏳ Map style not loaded for weather layer creation: ${layerType}, retry ${retryCount}` )

			// Retry after a short delay if we haven't exceeded max retries
			if ( retryCount<10 ) {
				setTimeout( async () => {
					await createWeatherLayer( layerType,retryCount+1 )
				},500 )
			} else {
				console.error( `❌ Max retries exceeded for weather layer creation: ${layerType}` )
			}
			return null
		}

		// Check WebGL context availability
		const canvas=mapRef.current.getCanvas()
		if ( !canvas ) {
			console.error( `❌ Canvas not available for weather layer creation: ${layerType}` )
			return null
		}

		const gl=canvas.getContext( 'webgl' )||canvas.getContext( 'webgl2' )
		if ( !gl ) {
			console.error( `❌ WebGL context not available for weather layer creation: ${layerType}` )
			return null
		}

		// Check if WebGL context is lost
		if ( gl.isContextLost&&gl.isContextLost() ) {
			console.error( `❌ WebGL context is lost for weather layer creation: ${layerType}` )
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

			// Add a small delay to ensure WebGL context is fully ready
			await new Promise( resolve => setTimeout( resolve,100 ) )

			// Additional WebGL context validation
			const canvas=mapRef.current.getCanvas()
			if ( !canvas ) {
				throw new Error( 'Canvas not available' )
			}

			const gl=canvas.getContext( 'webgl' )||canvas.getContext( 'webgl2' )
			if ( !gl ) {
				throw new Error( 'WebGL context not available' )
			}

			// Check if WebGL context is lost
			if ( gl.isContextLost&&gl.isContextLost() ) {
				throw new Error( 'WebGL context is lost' )
			}

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
					layer=new CloudLayer( {
						opacity: 0.6,
						smooth: true
					} )
					break
				case 'frozen-precipitation':
					layer=new FrozenPrecipitationLayer( {
						opacity: 0.7,
						smooth: true
					} )
					break
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

			// Log WebGL-related errors for debugging
			if ( error instanceof Error&&(
				error.message.includes( 'WebGL' )||
				error.message.includes( 'precision' )||
				error.message.includes( 'Canvas' )||
				error.message.includes( 'context' )
			) ) {
				console.warn( '⚠️ WebGL error detected in weather layer creation' )
			}

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
			// Create map with initial center and zoom
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
				onMapReady?.()
			} )

			// Handle WebGL context loss
			map.on( 'webglcontextlost',() => {
				console.warn( 'WebGL context lost - this is usually harmless' )
			} )

			onMapReady?.()

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
				const weatherIcon=getWeatherIconForCondition( 'clear sky' )

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
								<div class="text-sm text-slate-600 space-y-1">
									<p><strong>Coordinates:</strong> ${location.lat.toFixed( 4 )}, ${location.lon.toFixed( 4 )}</p>
									<p><strong>State:</strong> ${location.state||'N/A'}</p>
									<p><strong>Country:</strong> ${location.country||'N/A'}</p>
								</div>
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
	},[ apiKey,onMapReady ] )

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
			const weatherIcon=getWeatherIconForCondition( 'clear sky' )

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
							<div class="text-sm text-slate-600 space-y-1">
								<p><strong>Coordinates:</strong> ${location.lat.toFixed( 4 )}, ${location.lon.toFixed( 4 )}</p>
								<p><strong>State:</strong> ${location.state||'N/A'}</p>
								<p><strong>Country:</strong> ${location.country||'N/A'}</p>
							</div>
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
	},[ locations,currentLocation ] )

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
		createWeatherLayer( selectedLayer ).then( layer => {
			if ( layer ) {
				console.log( `✅ Weather layer ${selectedLayer} added to map successfully` )
			} else {
				console.log( `⏳ Weather layer ${selectedLayer} creation queued (will retry when map is ready)` )
			}
		} ).catch( error => {
			console.error( `❌ Error creating weather layer ${selectedLayer}:`,error )
		} )
	},[ selectedLayer ] )

	// Create weather layer when map becomes ready
	useEffect( () => {
		if ( isMapReady&&mapRef.current&&selectedLayer ) {
			console.log( `🔄 Map is ready, creating weather layer: ${selectedLayer}` )
			createWeatherLayer( selectedLayer ).then( layer => {
				if ( layer ) {
					console.log( `✅ Weather layer ${selectedLayer} created successfully after map ready` )
				}
			} ).catch( error => {
				console.error( `❌ Error creating weather layer ${selectedLayer} after map ready:`,error )
			} )
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

	// Update map bounds when map moves
	useEffect( () => {
		if ( !mapRef.current ) return

		const updateBounds=() => {
			const bounds=mapRef.current!.getBounds()
			const newBounds={
				north: bounds.getNorth(),
				south: bounds.getSouth(),
				east: bounds.getEast(),
				west: bounds.getWest()
			}
			setMapBounds( newBounds )
		}

		// Update bounds on move end
		mapRef.current.on( 'moveend',updateBounds )

		// Initial bounds
		updateBounds()

		return () => {
			if ( mapRef.current ) {
				mapRef.current.off( 'moveend',updateBounds )
			}
		}
	},[ isMapReady ] )

	// Update state weather data when bounds or layer changes
	useEffect( () => {
		if ( mapBounds&&selectedLayer ) {
			updateStateWeatherData()
		}
	},[ mapBounds,selectedLayer ] )

	// Force update state weather data when layer changes
	useEffect( () => {
		if ( selectedLayer&&mapRef.current ) {
			// Clear existing data for the previous layer
			stateWeatherAggregator.clearOldSamples()

			// Generate new data for the current layer
			if ( mapBounds ) {
				updateStateWeatherData()
			}
		}
	},[ selectedLayer ] )

	// Update state weather data when map becomes ready
	useEffect( () => {
		if ( isMapReady&&selectedLayer&&mapBounds ) {
			updateStateWeatherData()
		}
	},[ isMapReady,selectedLayer,mapBounds ] )

	// Handle fullscreen changes
	useEffect( () => {
		const handleFullscreenChange=() => {
			setIsFullscreen( !!document.fullscreenElement )
		}

		document.addEventListener( 'fullscreenchange',handleFullscreenChange )
		return () => {
			document.removeEventListener( 'fullscreenchange',handleFullscreenChange )
		}
	},[] )


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
			{isAnimating&&weatherLayerRef.current&&(
				<div className="absolute bottom-16 left-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 z-10">
					<div className="flex items-center gap-4 mb-3">
						<div className="flex items-center gap-2">
							<span className="text-lg">⏱️</span>
							<h3 className="font-semibold text-slate-800 dark:text-slate-200">Weather Animation</h3>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={toggleAnimation}
								className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors disabled:opacity-50"
								disabled={!weatherLayerRef.current}
							>
								{isPlaying? '⏸️ Pause':'▶️ Play'}
							</button>
							<button
								onClick={resetAnimation}
								className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors disabled:opacity-50"
								disabled={!weatherLayerRef.current}
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
				<div className="absolute top-16 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 z-10 max-w-sm">
					<div className="flex items-center gap-2 mb-3">
						<span className="text-2xl">
							{selectedLayer==='temperature'&&'🌡️'}
							{selectedLayer==='precipitation'&&'🌧️'}
							{selectedLayer==='wind'&&'💨'}
							{selectedLayer==='pressure'&&'📊'}
							{selectedLayer==='radar'&&'📡'}
							{selectedLayer==='clouds'&&'☁️'}
							{selectedLayer==='frozen-precipitation'&&'❄️'}
						</span>
						<h3 className="font-semibold text-slate-800 dark:text-slate-200">
							{selectedLayer.charAt( 0 ).toUpperCase()+selectedLayer.slice( 1 )}
						</h3>
					</div>
					<div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
						<div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
							<p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Location</p>
							<p className="font-mono text-xs">{cursorPosition.lat.toFixed( 4 )}, {cursorPosition.lng.toFixed( 4 )}</p>
						</div>

						{/* Temperature Layer */}
						{selectedLayer==='temperature'&&(
							<div className="space-y-1">
								{cursorWeatherData.temperature!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Temperature:</span>
										<div className="text-right">
											<span className="font-semibold text-slate-800 dark:text-slate-200">
												{cursorWeatherData.temperature.toFixed( 1 )}°C
											</span>
											<span className="text-xs text-slate-500 dark:text-slate-500 ml-2">
												({( ( cursorWeatherData.temperature*9/5 )+32 ).toFixed( 1 )}°F)
											</span>
										</div>
									</div>
								)}
								{cursorWeatherData.feelsLike!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Feels like:</span>
										<div className="text-right">
											<span className="font-semibold text-slate-800 dark:text-slate-200">
												{cursorWeatherData.feelsLike.toFixed( 1 )}°C
											</span>
											<span className="text-xs text-slate-500 dark:text-slate-500 ml-2">
												({( ( cursorWeatherData.feelsLike*9/5 )+32 ).toFixed( 1 )}°F)
											</span>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Precipitation Layer */}
						{selectedLayer==='precipitation'&&(
							<div className="space-y-1">
								{cursorWeatherData.precipitation!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Precipitation:</span>
										<span className="font-semibold text-slate-800 dark:text-slate-200">
											{cursorWeatherData.precipitation.toFixed( 2 )} mm/h
										</span>
									</div>
								)}
								{cursorWeatherData.precipitationType!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Type:</span>
										<span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
											{cursorWeatherData.precipitationType}
										</span>
									</div>
								)}
							</div>
						)}

						{/* Wind Layer */}
						{selectedLayer==='wind'&&(
							<div className="space-y-1">
								{cursorWeatherData.windSpeed!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Speed:</span>
										<div className="text-right">
											<span className="font-semibold text-slate-800 dark:text-slate-200">
												{cursorWeatherData.windSpeed.toFixed( 1 )} m/s
											</span>
											<span className="text-xs text-slate-500 dark:text-slate-500 ml-2">
												({( cursorWeatherData.windSpeed*3.6 ).toFixed( 1 )} km/h)
											</span>
										</div>
									</div>
								)}
								{cursorWeatherData.windDirection!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Direction:</span>
										<div className="text-right">
											<span className="font-semibold text-slate-800 dark:text-slate-200">
												{cursorWeatherData.windDirection.toFixed( 0 )}°
											</span>
											<span className="text-xs text-slate-500 dark:text-slate-500 ml-2">
												{getWindDirection( cursorWeatherData.windDirection )}
											</span>
										</div>
									</div>
								)}
								{cursorWeatherData.windGust!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Gust:</span>
										<div className="text-right">
											<span className="font-semibold text-slate-800 dark:text-slate-200">
												{cursorWeatherData.windGust.toFixed( 1 )} m/s
											</span>
											<span className="text-xs text-slate-500 dark:text-slate-500 ml-2">
												({( cursorWeatherData.windGust*3.6 ).toFixed( 1 )} km/h)
											</span>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Pressure Layer */}
						{selectedLayer==='pressure'&&(
							<div className="space-y-1">
								{cursorWeatherData.pressure!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Pressure:</span>
										<span className="font-semibold text-slate-800 dark:text-slate-200">
											{cursorWeatherData.pressure.toFixed( 1 )} hPa
										</span>
									</div>
								)}
								{cursorWeatherData.pressureTrend!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Trend:</span>
										<span className="font-semibold text-slate-800 dark:text-slate-200">
											{cursorWeatherData.pressureTrend>0? '↗️ Rising':cursorWeatherData.pressureTrend<0? '↘️ Falling':'→ Steady'}
										</span>
									</div>
								)}
							</div>
						)}

						{/* Radar Layer */}
						{selectedLayer==='radar'&&(
							<div className="space-y-1">
								{cursorWeatherData.reflectivity!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Reflectivity:</span>
										<span className="font-semibold text-slate-800 dark:text-slate-200">
											{cursorWeatherData.reflectivity.toFixed( 1 )} dBZ
										</span>
									</div>
								)}
								{cursorWeatherData.intensity!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Intensity:</span>
										<span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
											{cursorWeatherData.intensity}
										</span>
									</div>
								)}
							</div>
						)}

						{/* Clouds Layer */}
						{selectedLayer==='clouds'&&(
							<div className="space-y-1">
								{cursorWeatherData.cloudCover!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Coverage:</span>
										<span className="font-semibold text-slate-800 dark:text-slate-200">
											{cursorWeatherData.cloudCover.toFixed( 1 )}%
										</span>
									</div>
								)}
								{cursorWeatherData.cloudType!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Type:</span>
										<span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
											{cursorWeatherData.cloudType}
										</span>
									</div>
								)}
							</div>
						)}

						{/* Frozen Precipitation Layer */}
						{selectedLayer==='frozen-precipitation'&&(
							<div className="space-y-1">
								{cursorWeatherData.frozenPrecipitation!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Frozen %:</span>
										<span className="font-semibold text-slate-800 dark:text-slate-200">
											{cursorWeatherData.frozenPrecipitation.toFixed( 1 )}%
										</span>
									</div>
								)}
								{cursorWeatherData.snowRate!==undefined&&(
									<div className="flex justify-between items-center">
										<span className="text-slate-600 dark:text-slate-400">Snow Rate:</span>
										<span className="font-semibold text-slate-800 dark:text-slate-200">
											{cursorWeatherData.snowRate.toFixed( 2 )} mm/h
										</span>
									</div>
								)}
							</div>
						)}

						{cursorWeatherData.timestamp&&(
							<div className="pt-2 border-t border-slate-200 dark:border-slate-600">
								<p className="text-xs text-slate-500 dark:text-slate-500">
									<strong>Time:</strong> {new Date( cursorWeatherData.timestamp ).toLocaleString()}
								</p>
							</div>
						)}
					</div>
					<div className="mt-3 text-xs text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 rounded p-2">
						💡 Move cursor over map to see real-time weather data
					</div>
				</div>
			)}

			{/* Weather Layer Legend/Scale */}
			{selectedLayer&&(
				<div className="absolute bottom-[10rem] left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2 z-10 max-w-48">
					<div className="flex items-center gap-1.5 mb-2">
						<span className="text-sm">
							{selectedLayer==='temperature'&&'🌡️'}
							{selectedLayer==='precipitation'&&'🌧️'}
							{selectedLayer==='wind'&&'💨'}
							{selectedLayer==='pressure'&&'📊'}
							{selectedLayer==='radar'&&'📡'}
							{selectedLayer==='clouds'&&'☁️'}
							{selectedLayer==='frozen-precipitation'&&'❄️'}
						</span>
						<h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
							{selectedLayer.charAt( 0 ).toUpperCase()+selectedLayer.slice( 1 )} Scale
						</h3>
					</div>
					<div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
						{selectedLayer==='temperature'&&(
							<div className="space-y-1">
								<div className="flex justify-between">
									<span className="text-blue-500">Cold</span>
									<span className="text-red-500">Hot</span>
								</div>
								<div className="h-2 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 rounded"></div>
								<p className="text-slate-500 dark:text-slate-500">Temperature range: -40°C to 50°C</p>
							</div>
						)}

						{selectedLayer==='precipitation'&&(
							<div className="space-y-1">
								<div className="flex justify-between">
									<span className="text-blue-100">Light</span>
									<span className="text-blue-900">Heavy</span>
								</div>
								<div className="h-2 bg-gradient-to-r from-blue-100 via-blue-400 to-blue-900 rounded"></div>
								<p className="text-slate-500 dark:text-slate-500">Precipitation: 0-50 mm/h</p>
							</div>
						)}

						{selectedLayer==='wind'&&(
							<div className="space-y-1">
								<div className="flex justify-between">
									<span className="text-green-400">Calm</span>
									<span className="text-red-600">Strong</span>
								</div>
								<div className="h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-600 rounded"></div>
								<p className="text-slate-500 dark:text-slate-500">Wind speed: 0-30 m/s</p>
							</div>
						)}

						{selectedLayer==='pressure'&&(
							<div className="space-y-1">
								<div className="flex justify-between">
									<span className="text-purple-400">Low</span>
									<span className="text-purple-800">High</span>
								</div>
								<div className="h-2 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 rounded"></div>
								<p className="text-slate-500 dark:text-slate-500">Pressure: 950-1050 hPa</p>
							</div>
						)}

						{selectedLayer==='radar'&&(
							<div className="space-y-1">
								<div className="flex justify-between">
									<span className="text-blue-200">Weak</span>
									<span className="text-red-600">Intense</span>
								</div>
								<div className="h-2 bg-gradient-to-r from-blue-200 via-yellow-400 to-red-600 rounded"></div>
								<p className="text-slate-500 dark:text-slate-500">Reflectivity: 0-70 dBZ</p>
							</div>
						)}

						{selectedLayer==='clouds'&&(
							<div className="space-y-1">
								<div className="flex justify-between">
									<span className="text-gray-200">Clear</span>
									<span className="text-gray-800">Overcast</span>
								</div>
								<div className="h-2 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-800 rounded"></div>
								<p className="text-slate-500 dark:text-slate-500">Cloud cover: 0-100%</p>
							</div>
						)}

						{selectedLayer==='frozen-precipitation'&&(
							<div className="space-y-1">
								<div className="flex justify-between">
									<span className="text-blue-200">Rain</span>
									<span className="text-blue-800">Snow</span>
								</div>
								<div className="h-2 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-800 rounded"></div>
								<p className="text-slate-500 dark:text-slate-500">Frozen precipitation: 0-100%</p>
							</div>
						)}
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

			{/* State Weather Badges */}
			{stateWeatherData.map( ( stateData ) => {
				const state=US_STATES.find( s => s.id===stateData.stateId )
				if ( !state||!isStateVisible( stateData ) ) return null

				const position=getBadgePosition( state.center[ 1 ],state.center[ 0 ] )

				return (
					<StateWeatherBadge
						key={stateData.stateId}
						data={stateData}
						layerType={selectedLayer}
						position={position}
						isVisible={!isUpdatingStateData}
					/>
				)
			} )}

			{/* State Weather Data Loading Indicator */}
			{isUpdatingStateData&&(
				<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
					<div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
						<div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
						<span className="text-sm text-slate-700 dark:text-slate-300">
							Updating state weather data...
						</span>
					</div>
				</div>
			)}
		</div>
	)
}

export default MapComponent
