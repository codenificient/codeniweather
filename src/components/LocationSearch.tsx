'use client'

import { WeatherData } from '@/types/weather'
import { AnimatePresence,motion } from 'framer-motion'
// Icons replaced with emojis
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
	const searchTimeoutRef=useRef<NodeJS.Timeout>()
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
			} catch ( error ) {
				console.error( 'Search error:',error )
				setResults( [] )
			} finally {
				setSearchLoading( false )
			}
		},800 ) // Increased debounce time to 800ms

		return () => {
			if ( searchTimeoutRef.current ) {
				clearTimeout( searchTimeoutRef.current )
			}
		}
	},[ query ] ) // Removed onSearch dependency to prevent unnecessary re-renders

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
		<div className="relative w-full max-w-md">
			<div className="relative">
				<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 text-lg">🔍</span>
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={( e ) => setQuery( e.target.value )}
					onFocus={handleInputFocus}
					onBlur={handleInputBlur}
					placeholder="Search for a city (min 3 characters)..."
					className="input-field w-full pl-10 pr-4 py-3"
					disabled={loading}
				/>
				{( searchLoading||loading )&&(
					<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
						<div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-300 border-t-transparent"></div>
					</div>
				)}
			</div>

			<AnimatePresence>
				{showResults&&results.length>0&&(
					<motion.div
						initial={{ opacity: 0,y: -10 }}
						animate={{ opacity: 1,y: 0 }}
						exit={{ opacity: 0,y: -10 }}
						className="absolute top-full left-0 right-0 mt-2 glass-card-strong rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
					>
						{results.map( ( weather,index ) => (
							<motion.button
								key={`${weather.id}-${index}`}
								initial={{ opacity: 0,x: -20 }}
								animate={{ opacity: 1,x: 0 }}
								transition={{ delay: index*0.05 }}
								onClick={() => handleLocationSelect( weather )}
								className="w-full flex items-center space-x-3 px-4 py-3 hover:glass-card transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl text-slate-800 dark:text-slate-200"
							>
								<span className="text-blue-600 flex-shrink-0 text-lg">📍</span>
								<div className="flex-1 text-left">
									<div className="font-medium text-slate-800 dark:text-slate-200">
										{weather.name}{weather.state&&`, ${weather.state}`}, {weather.sys.country}
									</div>
									<div className="text-slate-600 dark:text-slate-400 text-sm">
										{weather.weather[ 0 ].description}
									</div>
								</div>
								<span className="text-blue-600 flex-shrink-0 text-lg">➕</span>
							</motion.button>
						) )}
					</motion.div>
				)}
			</AnimatePresence>

			{showResults&&results.length===0&&query.trim().length>=3&&!searchLoading&&(
				<motion.div
					initial={{ opacity: 0,y: -10 }}
					animate={{ opacity: 1,y: 0 }}
					exit={{ opacity: 0,y: -10 }}
					className="absolute top-full left-0 right-0 mt-2 glass-card-strong rounded-xl shadow-xl z-50 p-4"
				>
					<div className="text-center text-slate-700 dark:text-slate-300">
						No cities found for &quot;{query}&quot;
					</div>
				</motion.div>
			)}
		</div>
	)
}

export default LocationSearch
