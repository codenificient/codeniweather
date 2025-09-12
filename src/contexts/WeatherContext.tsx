'use client'

import { StorageService } from '@/lib/storage'
import { WeatherAPI } from '@/lib/weather-api'
import { DailyForecast,Location,WeatherData,WeatherError,WeatherState } from '@/types/weather'
import React,{ createContext,useContext,useEffect,useReducer } from 'react'

interface WeatherContextType extends WeatherState {
	addLocation: ( location: Location ) => Promise<void>
	removeLocation: ( locationId: string ) => void
	searchCities: ( query: string ) => Promise<WeatherData[]>
	refreshAllWeather: () => Promise<void>
	clearError: () => void
	getForecast: ( locationIdOrLocation: string|Location ) => Promise<DailyForecast[]>
}

const WeatherContext=createContext<WeatherContextType|undefined>( undefined )

type WeatherAction=
	|{ type: 'SET_LOADING'; payload: boolean }
	|{ type: 'SET_ERROR'; payload: WeatherError|null }
	|{ type: 'ADD_LOCATION'; payload: Location }
	|{ type: 'REMOVE_LOCATION'; payload: string }
	|{ type: 'SET_WEATHER_DATA'; payload: { locationId: string; weather: WeatherData } }
	|{ type: 'SET_FORECAST_DATA'; payload: { locationId: string; forecast: DailyForecast[] } }
	|{ type: 'LOAD_LOCATIONS'; payload: Location[] }
	|{ type: 'CLEAR_ERROR' }

const weatherReducer=( state: WeatherState,action: WeatherAction ): WeatherState => {
	switch ( action.type ) {
		case 'SET_LOADING':
			return { ...state,loading: action.payload }
		case 'SET_ERROR':
			return { ...state,error: action.payload }
		case 'ADD_LOCATION':
			return { ...state,locations: [ ...state.locations,action.payload ] }
		case 'REMOVE_LOCATION':
			return { ...state,locations: state.locations.filter( loc => loc.id!==action.payload ) }
		case 'SET_WEATHER_DATA':
			return { ...state,weatherData: { ...state.weatherData,[ action.payload.locationId ]: action.payload.weather } }
		case 'SET_FORECAST_DATA':
			return { ...state,forecastData: { ...state.forecastData,[ action.payload.locationId ]: action.payload.forecast } }
		case 'LOAD_LOCATIONS':
			return { ...state,locations: action.payload }
		case 'CLEAR_ERROR':
			return { ...state,error: null }
		default:
			return state
	}
}

const initialState: WeatherState={
	locations: [],
	currentLocation: null,
	weatherData: {},
	forecastData: {},
	loading: false,
	error: null,
}

export const WeatherProvider: React.FC<{ children: React.ReactNode }>=( { children } ) => {
	const [ state,dispatch ]=useReducer( weatherReducer,initialState )
	const weatherAPI=WeatherAPI.getInstance()

	// Load saved locations on mount
	useEffect( () => {
		const savedLocations=StorageService.getLocations()
		dispatch( { type: 'LOAD_LOCATIONS',payload: savedLocations } )

		// Fetch weather data for loaded locations
		if ( savedLocations.length>0 ) {
			savedLocations.forEach( location => {
				fetchWeatherData( location )
			} )
		}
	},[] )

	// Fetch weather data for a location
	const fetchWeatherData=async ( location: Location ) => {
		try {
			const data=await weatherAPI.getCurrentWeather( location.lat,location.lon )
			dispatch( { type: 'SET_WEATHER_DATA',payload: { locationId: location.id,weather: data } } )

			// Also fetch forecast data
			await getForecast( location )
		} catch ( err: any ) {
			dispatch( { type: 'SET_ERROR',payload: { message: err.message,code: 'FETCH_ERROR' } } )
		}
	}


	// Add a new location
	const addLocation=async ( location: Location ) => {
		dispatch( { type: 'SET_LOADING',payload: true } )
		dispatch( { type: 'SET_ERROR',payload: null } )

		try {
			// Fetch weather data first to validate the location (includes forecast)
			await fetchWeatherData( location )

			// Add to storage and state
			StorageService.addLocation( location )
			dispatch( { type: 'ADD_LOCATION',payload: location } )
		} catch ( err: any ) {
			dispatch( { type: 'SET_ERROR',payload: { message: err.message,code: 'ADD_LOCATION_ERROR' } } )
		} finally {
			dispatch( { type: 'SET_LOADING',payload: false } )
		}
	}

	// Remove a location
	const removeLocation=( locationId: string ) => {
		StorageService.removeLocation( locationId )
		dispatch( { type: 'REMOVE_LOCATION',payload: locationId } )
	}

	// Search for cities
	const searchCities=async ( query: string ): Promise<WeatherData[]> => {
		if ( !query.trim() ) return []

		try {
			return await weatherAPI.searchCities( query )
		} catch ( err: any ) {
			dispatch( { type: 'SET_ERROR',payload: { message: err.message,code: 'SEARCH_ERROR' } } )
			return []
		}
	}

	// Refresh weather data for all locations
	const refreshAllWeather=async () => {
		dispatch( { type: 'SET_LOADING',payload: true } )
		dispatch( { type: 'SET_ERROR',payload: null } )

		try {
			const promises=state.locations.map( location => fetchWeatherData( location ) )
			await Promise.all( promises )
		} catch ( err: any ) {
			dispatch( { type: 'SET_ERROR',payload: { message: err.message,code: 'REFRESH_ERROR' } } )
		} finally {
			dispatch( { type: 'SET_LOADING',payload: false } )
		}
	}

	// Get forecast data
	const getForecast=async ( locationIdOrLocation: string|Location ): Promise<DailyForecast[]> => {
		try {
			let location: Location

			// Handle both string ID and Location object
			if ( typeof locationIdOrLocation==='string' ) {
				const foundLocation=state.locations.find( loc => loc.id===locationIdOrLocation )
				if ( !foundLocation ) {
					throw new Error( 'Location not found' )
				}
				location=foundLocation
			} else {
				location=locationIdOrLocation
			}

			// Fetch 5-day forecast from API
			const forecastData=await weatherAPI.get5DayForecast( location.lat,location.lon )

			// Process the forecast data into daily forecasts
			const dailyForecasts=weatherAPI.processForecastData( forecastData )

			// Store forecast data in state
			dispatch( { type: 'SET_FORECAST_DATA',payload: { locationId: location.id,forecast: dailyForecasts } } )

			return dailyForecasts
		} catch ( err: any ) {
			console.error( 'Error fetching forecast:',err )
			console.error( 'Location ID or Location:',locationIdOrLocation )
			console.error( 'Available locations:',state.locations.map( loc => ( { id: loc.id,name: loc.name } ) ) )
			dispatch( { type: 'SET_ERROR',payload: { message: err.message,code: 'FORECAST_ERROR' } } )
			return []
		}
	}

	// Clear error
	const clearError=() => {
		dispatch( { type: 'CLEAR_ERROR' } )
	}

	const value: WeatherContextType={
		...state,
		addLocation,
		removeLocation,
		searchCities,
		refreshAllWeather,
		clearError,
		getForecast,
	}

	return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
}

export const useWeather=() => {
	const context=useContext( WeatherContext )
	if ( context===undefined ) {
		throw new Error( 'useWeather must be used within a WeatherProvider' )
	}
	return context
}
