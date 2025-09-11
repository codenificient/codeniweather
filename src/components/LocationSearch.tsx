'use client'

import { WeatherData } from '@/types/weather'
import { AnimatePresence,motion } from 'framer-motion'
import { MapPin,Plus,Search } from 'lucide-react'
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

	useEffect( () => {
		if ( query.trim().length<2 ) {
			setResults( [] )
			setShowResults( false )
			return
		}

		// Debounce search
		if ( searchTimeoutRef.current ) {
			clearTimeout( searchTimeoutRef.current )
		}

		searchTimeoutRef.current=setTimeout( async () => {
			setSearchLoading( true )
			try {
				const searchResults=await onSearch( query )
				setResults( searchResults.slice( 0,5 ) ) // Limit to 5 results
				setShowResults( true )
			} catch ( error ) {
				console.error( 'Search error:',error )
				setResults( [] )
			} finally {
				setSearchLoading( false )
			}
		},300 )

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
		<div className="relative w-full max-w-md">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={( e ) => setQuery( e.target.value )}
					onFocus={handleInputFocus}
					onBlur={handleInputBlur}
					placeholder="Search for a city..."
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
								className="w-full flex items-center space-x-3 px-4 py-3 hover:glass-card transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl text-slate-700"
							>
								<MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
								<div className="flex-1 text-left">
									<div className="font-medium">
										{weather.name}{weather.state&&`, ${weather.state}`}, {weather.sys.country}
									</div>
									<div className="text-slate-500 text-sm">
										{weather.weather[ 0 ].description}
									</div>
								</div>
								<Plus className="w-4 h-4 text-blue-600 flex-shrink-0" />
							</motion.button>
						) )}
					</motion.div>
				)}
			</AnimatePresence>

			{showResults&&results.length===0&&query.trim().length>=2&&!searchLoading&&(
				<motion.div
					initial={{ opacity: 0,y: -10 }}
					animate={{ opacity: 1,y: 0 }}
					exit={{ opacity: 0,y: -10 }}
					className="absolute top-full left-0 right-0 mt-2 glass-card-strong rounded-xl shadow-xl z-50 p-4"
				>
					<div className="text-center text-slate-600">
						No cities found for &quot;{query}&quot;
					</div>
				</motion.div>
			)}
		</div>
	)
}

export default LocationSearch
