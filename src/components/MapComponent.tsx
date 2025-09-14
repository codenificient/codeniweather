'use client'

import { Map,Marker,NavigationControl,Popup } from '@maptiler/sdk'
import { useEffect,useRef } from 'react'

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
	onMapReady
} ) => {
	const mapContainer=useRef<HTMLDivElement>( null )
	const mapRef=useRef<Map|null>( null )
	const markersRef=useRef<Marker[]>( [] )

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

			// Add navigation control
			map.addControl( new NavigationControl(),'top-right' )

			mapRef.current=map
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
				const weatherIcon=getWeatherIcon( weather?.weather?.description||'clear sky' )

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
			const weatherIcon=getWeatherIcon( weather?.weather?.description||'clear sky' )

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

		// TODO: Implement weather layer switching
		// For now, just log the selected layer
		console.log( `Weather layer selected: ${selectedLayer}` )
	},[ selectedLayer ] )

	return <div ref={mapContainer} className="w-full h-full" />
}

export default MapComponent
