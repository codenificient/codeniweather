'use client'

import { analytics } from '@/lib/analytics'
import { cityTag,condCode } from '@/lib/instrument'
import { WeatherData } from '@/types/weather'
import React,{ useEffect,useRef,useState } from 'react'

interface LocationSearchProps {
	onLocationSelect: ( weather: WeatherData ) => void
	onSearch: ( query: string ) => Promise<WeatherData[]>
	loading?: boolean
}

const LocationSearch: React.FC<LocationSearchProps>=( {
	onLocationSelect,
	onSearch,
	loading=false,
} ) => {
	const [ query,setQuery ]=useState( '' )
	const [ results,setResults ]=useState<WeatherData[]>( [] )
	const [ showResults,setShowResults ]=useState( false )
	const [ searchLoading,setSearchLoading ]=useState( false )
	const inputRef=useRef<HTMLInputElement>( null )
	const searchTimeoutRef=useRef<NodeJS.Timeout>( undefined )
	const lastSearchRef=useRef<string>( '' )
	const searchCooldownRef=useRef<number>( 0 )

	useEffect( () => {
		// Clear results if query is too short
		if ( query.trim().length<3 ) {
			setResults( [] )
			setShowResults( false )
			setSearchLoading( false )
			return
		}

		// Clear existing timeout
		if ( searchTimeoutRef.current ) {
			clearTimeout( searchTimeoutRef.current )
		}

		// Set loading state immediately
		setSearchLoading( true )

		// Debounce search with longer delay to prevent API spam
		searchTimeoutRef.current=setTimeout( async () => {
			const trimmedQuery=query.trim()

			// Prevent duplicate searches
			if ( lastSearchRef.current===trimmedQuery ) {
				setSearchLoading( false )
				return
			}

			// Check cooldown period (1 second between searches)
			const now=Date.now()
			if ( now-searchCooldownRef.current<1000 ) {
				setSearchLoading( false )
				return
			}

			try {
				lastSearchRef.current=trimmedQuery
				searchCooldownRef.current=now

				const searchResults=await onSearch( trimmedQuery )
				setResults( searchResults.slice( 0,5 ) ) // Limit to 5 results
				setShowResults( true )

				// Track search analytics
				analytics.trackWeatherSearch( trimmedQuery,searchResults.length )
			} catch ( error ) {
				console.error( 'Search error:',error )
				setResults( [] )

				// Track search error
				analytics.trackError( 'search-failed',{
					context: 'location-search',
					query: trimmedQuery,
					error: error instanceof Error? error.message:'Unknown error'
				} )
			} finally {
				setSearchLoading( false )
			}
		},800 ) // Increased debounce time to 800ms

		return () => {
			if ( searchTimeoutRef.current ) {
				clearTimeout( searchTimeoutRef.current )
			}
		}
	},[ query,onSearch ] )

	const handleLocationSelect=( weather: WeatherData ) => {
		onLocationSelect( weather )
		setQuery( '' )
		setResults( [] )
		setShowResults( false )
		inputRef.current?.blur()
	}

	const handleInputFocus=() => {
		if ( results.length>0 ) {
			setShowResults( true )
		}
	}

	const handleInputBlur=() => {
		// Delay hiding results to allow clicking on them
		setTimeout( () => setShowResults( false ),150 )
	}

	return (
		<div className="relative w-full max-w-[460px]">
			<div className="flex items-center gap-3 bg-panel border border-line px-[13px] py-2.5">
				<span className="font-mono text-xs text-accent select-none">/</span>
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={( e ) => setQuery( e.target.value )}
					onFocus={handleInputFocus}
					onBlur={handleInputBlur}
					placeholder="Find a city — MapTiler geocoding"
					className="flex-1 bg-transparent border-0 p-0 text-sm text-ink placeholder:text-mute focus:outline-none focus:ring-0 disabled:opacity-50"
					disabled={loading}
				/>
				{( searchLoading||loading )&&(
					<span className="font-mono text-[10px] tracking-[.1em] text-mute">···</span>
				)}
			</div>

			{showResults&&results.length>0&&(
				<div className="absolute top-full left-0 right-0 mt-px bg-panel border border-line shadow-[var(--shadow)] z-50 max-h-72 overflow-y-auto">
					{results.map( ( weather,index ) => (
						<button
							key={`${weather.id}-${index}`}
							onClick={() => handleLocationSelect( weather )}
							className="w-full flex items-center gap-3 px-[13px] py-2.5 text-left border-b border-line2 last:border-b-0 hover:bg-panel2 transition-colors"
						>
							<span className="font-mono text-[11px] text-mute2 w-9 flex-shrink-0">
								{cityTag( weather.name )}
							</span>
							<span className="flex-1 text-sm text-ink">
								{weather.name}{weather.state&&`, ${weather.state}`}, {weather.sys.country}
							</span>
							<span className="font-mono text-[11px] text-mute flex-shrink-0">
								{condCode( weather.weather[ 0 ] )}
							</span>
						</button>
					) )}
				</div>
			)}

			{showResults&&results.length===0&&query.trim().length>=3&&!searchLoading&&(
				<div className="absolute top-full left-0 right-0 mt-px bg-panel border border-line shadow-[var(--shadow)] z-50 px-[13px] py-2.5">
					<span className="font-mono text-[11px] tracking-[.08em] text-mute">
						NO MATCH — {query.trim().toUpperCase()}
					</span>
				</div>
			)}
		</div>
	)
}

export default LocationSearch
