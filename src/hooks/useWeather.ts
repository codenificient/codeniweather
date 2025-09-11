'use client'

import { GeolocationService } from '@/lib/geolocation'
import { StorageService } from '@/lib/storage'
import { WeatherAPI } from '@/lib/weather-api'
import { Location,WeatherData,WeatherError } from '@/types/weather'
import { useCallback,useEffect,useState } from 'react'

export const useWeather=() => {
	const [ locations,setLocations ]=useState<Location[]>( [] )
	const [ currentLocation,setCurrentLocation ]=useState<Location|null>( null )
	const [ weatherData,setWeatherData ]=useState<Record<string,WeatherData>>( {} )
	const [ loading,setLoading ]=useState( false )
	const [ error,setError ]=useState<WeatherError|null>( null )

	const weatherAPI=WeatherAPI.getInstance()

	// Load saved locations on mount
	useEffect( () => {
		const savedLocations=StorageService.getLocations()
		setLocations( savedLocations )
	},[] )

	// Fetch weather data for a location
	const fetchWeatherData=useCallback( async ( location: Location ) => {
		setLoading( true )
		setError( null )

		try {
			const data=await weatherAPI.getCurrentWeather( location.lat,location.lon )
			setWeatherData( prev => ( {
				...prev,
				[ location.id ]: data,
			} ) )
		} catch ( err: any ) {
			setError( {
				message: err.message,
				code: 'FETCH_ERROR',
			} )
		} finally {
			setLoading( false )
		}
	},[ weatherAPI ] )

	// Get current location
	const getCurrentLocation=useCallback( async () => {
		setLoading( true )
		setError( null )

		try {
			// Try the improved geolocation service first
			const location=await GeolocationService.getCurrentPosition()
			setCurrentLocation( location )
			await fetchWeatherData( location )
		} catch ( err: any ) {
			console.warn( 'Primary geolocation failed, trying IP fallback...',err )

			try {
				// Try IP-based location as fallback
				const location=await GeolocationService.getCurrentPositionWithIPFallback()
				setCurrentLocation( location )
				await fetchWeatherData( location )
			} catch ( fallbackErr: any ) {
				setError( {
					message: fallbackErr.message,
					code: 'GEOLOCATION_ERROR',
				} )
			}
		} finally {
			setLoading( false )
		}
	},[ fetchWeatherData ] )

	// Add a new location
	const addLocation=useCallback( async ( location: Location ) => {
		setLoading( true )
		setError( null )

		try {
			// Fetch weather data first to validate the location
			await fetchWeatherData( location )

			// Add to storage and state
			StorageService.addLocation( location )
			setLocations( prev => [ ...prev,location ] )
		} catch ( err: any ) {
			setError( {
				message: err.message,
				code: 'ADD_LOCATION_ERROR',
			} )
		} finally {
			setLoading( false )
		}
	},[ fetchWeatherData ] )

	// Remove a location
	const removeLocation=useCallback( ( locationId: string ) => {
		StorageService.removeLocation( locationId )
		setLocations( prev => prev.filter( loc => loc.id!==locationId ) )
		setWeatherData( prev => {
			const newData={ ...prev }
			delete newData[ locationId ]
			return newData
		} )
	},[] )

	// Search for cities
	const searchCities=useCallback( async ( query: string ): Promise<WeatherData[]> => {
		if ( !query.trim() ) return []

		try {
			return await weatherAPI.searchCities( query )
		} catch ( err: any ) {
			setError( {
				message: err.message,
				code: 'SEARCH_ERROR',
			} )
			return []
		}
	},[ weatherAPI ] )

	// Refresh weather data for all locations
	const refreshAllWeather=useCallback( async () => {
		setLoading( true )
		setError( null )

		try {
			const promises=locations.map( location => fetchWeatherData( location ) )
			if ( currentLocation ) {
				promises.push( fetchWeatherData( currentLocation ) )
			}
			await Promise.all( promises )
		} catch ( err: any ) {
			setError( {
				message: err.message,
				code: 'REFRESH_ERROR',
			} )
		} finally {
			setLoading( false )
		}
	},[ locations,currentLocation,fetchWeatherData ] )

	// Clear error
	const clearError=useCallback( () => {
		setError( null )
	},[] )

	return {
		locations,
		currentLocation,
		weatherData,
		loading,
		error,
		getCurrentLocation,
		addLocation,
		removeLocation,
		searchCities,
		refreshAllWeather,
		clearError,
	}
}
