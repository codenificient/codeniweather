'use client'

import ErrorAlert from '@/components/ErrorAlert'
import LoadingSpinner from '@/components/LoadingSpinner'
import { WeatherAPI } from '@/lib/weather-api'
import { Location,WeatherData } from '@/types/weather'
import { motion } from 'framer-motion'
import {
	ArrowLeft,
	Compass,
	Droplets,
	Eye,
	Gauge,
	MapPin,
	Sunrise,
	Thermometer,
	Wind
} from 'lucide-react'
import { useParams,useRouter } from 'next/navigation'
import { useEffect,useState } from 'react'

export default function CityDetailsPage () {
	const params=useParams()
	const router=useRouter()
	const [ weather,setWeather ]=useState<WeatherData|null>( null )
	const [ location,setLocation ]=useState<Location|null>( null )
	const [ loading,setLoading ]=useState( true )
	const [ error,setError ]=useState<string|null>( null )

	const weatherAPI=WeatherAPI.getInstance()

	useEffect( () => {
		const fetchCityDetails=async () => {
			try {
				setLoading( true )
				setError( null )

				// Get location data from localStorage
				const savedLocations=JSON.parse( localStorage.getItem( 'codeniweather-locations' )||'[]' )
				const currentLocation=JSON.parse( localStorage.getItem( 'codeniweather-current-location' )||'null' )

				const allLocations=[ ...savedLocations,...( currentLocation? [ currentLocation ]:[] ) ]
				const foundLocation=allLocations.find( ( loc: Location ) => loc.id===params.id )

				if ( !foundLocation ) {
					throw new Error( 'Location not found' )
				}

				setLocation( foundLocation )

				// Fetch fresh weather data
				const weatherData=await weatherAPI.getCurrentWeather( foundLocation.lat,foundLocation.lon )
				setWeather( weatherData )
			} catch ( err: any ) {
				console.error( 'Error fetching city details:',err )
				setError( err.message )
			} finally {
				setLoading( false )
			}
		}

		if ( params.id ) {
			fetchCityDetails()
		}
	},[ params.id ] )

	const handleBack=() => {
		router.back()
	}

	const getWeatherIcon=( iconCode: string ) => {
		return weatherAPI.getWeatherIconUrl( iconCode )
	}

	const getWindDirection=( deg: number ) => {
		return weatherAPI.getWindDirection( deg )
	}

	const formatTime=( timestamp: number ) => {
		return weatherAPI.getTimeFromTimestamp( timestamp )
	}

	const getUVIndexDescription=( uv: number ) => {
		if ( uv<=2 ) return 'Low'
		if ( uv<=5 ) return 'Moderate'
		if ( uv<=7 ) return 'High'
		if ( uv<=10 ) return 'Very High'
		return 'Extreme'
	}

	const getUVIndexColor=( uv: number ) => {
		if ( uv<=2 ) return 'text-green-400'
		if ( uv<=5 ) return 'text-yellow-400'
		if ( uv<=7 ) return 'text-orange-400'
		if ( uv<=10 ) return 'text-red-400'
		return 'text-purple-400'
	}

	if ( loading ) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" text="Loading city details..." />
			</div>
		)
	}

	if ( error ) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="max-w-md w-full">
					<ErrorAlert
						error={{ message: error }}
						onDismiss={() => setError( null )}
						onRetry={() => window.location.reload()}
					/>
					<button
						onClick={handleBack}
						className="mt-4 w-full btn-primary"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Go Back
					</button>
				</div>
			</div>
		)
	}

	if ( !weather||!location ) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">City Not Found</h1>
					<button
						onClick={handleBack}
						className="btn-primary"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Go Back
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="w-full">
			{/* Header */}
			<div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-white/20 dark:border-white/10">
				<div className="w-full px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center space-x-4">
						<button
							onClick={handleBack}
							className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
						>
							<ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
						</button>
						<div className="flex items-center space-x-3">
							<MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
							<div>
								<h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
									{location.name}
								</h1>
								<p className="text-slate-600 dark:text-slate-400">
									{location.state&&`${location.state}, `}{location.country}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="w-full px-4 sm:px-6 lg:px-8 py-8">
				<motion.div
					initial={{ opacity: 0,y: 20 }}
					animate={{ opacity: 1,y: 0 }}
					className="space-y-8"
				>
					{/* Current Weather Card */}
					<div className="glass-card-strong rounded-3xl p-8">
						<div className="flex items-center justify-between mb-8">
							<div className="flex items-center space-x-6">
								<img
									src={getWeatherIcon( weather.weather[ 0 ].icon )}
									alt={weather.weather[ 0 ].description}
									className="w-24 h-24 filter drop-shadow-2xl"
								/>
								<div>
									<div className="text-6xl font-bold gradient-text-primary mb-2">
										{weatherAPI.formatTemperature( weather.main.temp )}
									</div>
									<div className="text-2xl text-slate-600 dark:text-slate-400 capitalize font-medium">
										{weather.weather[ 0 ].description}
									</div>
									<div className="text-lg text-slate-500 dark:text-slate-500">
										Feels like {weatherAPI.formatTemperature( weather.main.feels_like )}
									</div>
								</div>
							</div>
							<div className="text-right space-y-2">
								<div className="text-lg text-slate-600 dark:text-slate-400">
									H: {weatherAPI.formatTemperature( weather.main.temp_max )}
								</div>
								<div className="text-lg text-slate-600 dark:text-slate-400">
									L: {weatherAPI.formatTemperature( weather.main.temp_min )}
								</div>
							</div>
						</div>
					</div>

					{/* Weather Details Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Temperature Details */}
						<div className="glass-card rounded-2xl p-6">
							<div className="flex items-center space-x-3 mb-4">
								<div className="p-2 bg-orange-500/20 dark:bg-orange-400/20 rounded-xl">
									<Thermometer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
								</div>
								<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Temperature</h3>
							</div>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Current</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatTemperature( weather.main.temp )}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Feels like</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatTemperature( weather.main.feels_like )}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Min</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatTemperature( weather.main.temp_min )}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Max</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatTemperature( weather.main.temp_max )}</span>
								</div>
							</div>
						</div>

						{/* Wind Details */}
						<div className="glass-card rounded-2xl p-6">
							<div className="flex items-center space-x-3 mb-4">
								<div className="p-2 bg-blue-500/20 dark:bg-blue-400/20 rounded-xl">
									<Wind className="w-5 h-5 text-blue-600 dark:text-blue-400" />
								</div>
								<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Wind</h3>
							</div>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Speed</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatWindSpeed( weather.wind.speed )}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Direction</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center">
										<Compass className="w-4 h-4 mr-1" />
										{getWindDirection( weather.wind.deg )}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Degrees</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{weather.wind.deg}°</span>
								</div>
							</div>
						</div>

						{/* Humidity & Pressure */}
						<div className="glass-card rounded-2xl p-6">
							<div className="flex items-center space-x-3 mb-4">
								<div className="p-2 bg-cyan-500/20 dark:bg-cyan-400/20 rounded-xl">
									<Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
								</div>
								<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Humidity</h3>
							</div>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Humidity</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatHumidity( weather.main.humidity )}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Pressure</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatPressure( weather.main.pressure )}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Clouds</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{weather.clouds.all}%</span>
								</div>
							</div>
						</div>

						{/* Visibility */}
						<div className="glass-card rounded-2xl p-6">
							<div className="flex items-center space-x-3 mb-4">
								<div className="p-2 bg-purple-500/20 dark:bg-purple-400/20 rounded-xl">
									<Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
								</div>
								<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Visibility</h3>
							</div>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Distance</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{weatherAPI.formatVisibility( weather.visibility )}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Cloud Cover</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{weather.clouds.all}%</span>
								</div>
							</div>
						</div>

						{/* Sunrise/Sunset */}
						<div className="glass-card rounded-2xl p-6">
							<div className="flex items-center space-x-3 mb-4">
								<div className="p-2 bg-yellow-500/20 dark:bg-yellow-400/20 rounded-xl">
									<Sunrise className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
								</div>
								<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Sun Times</h3>
							</div>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Sunrise</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{formatTime( weather.sys.sunrise )}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Sunset</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200">{formatTime( weather.sys.sunset )}</span>
								</div>
							</div>
						</div>

						{/* Additional Info */}
						<div className="glass-card rounded-2xl p-6">
							<div className="flex items-center space-x-3 mb-4">
								<div className="p-2 bg-green-500/20 dark:bg-green-400/20 rounded-xl">
									<Gauge className="w-5 h-5 text-green-600 dark:text-green-400" />
								</div>
								<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Additional</h3>
							</div>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Last Updated</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
										{new Date( weather.dt*1000 ).toLocaleTimeString()}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-600 dark:text-slate-400">Coordinates</span>
									<span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
										{weather.coord.lat.toFixed( 2 )}, {weather.coord.lon.toFixed( 2 )}
									</span>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
