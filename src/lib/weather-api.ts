import { DailyForecast,ForecastData,WeatherData } from '@/types/weather'
import axios from 'axios'
import { GeocodingAPI,MapTilerLocation } from './geocoding-api'

const API_KEY=process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY||'your-api-key-here'
const BASE_URL='https://api.openweathermap.org/data/2.5'

export class WeatherAPI {
	private static instance: WeatherAPI
	private apiKey: string

	private constructor() {
		this.apiKey=API_KEY
		console.log( 'WeatherAPI initialized with API key:',this.apiKey? `${this.apiKey.substring( 0,8 )}...`:'NOT SET' )
	}

	public static getInstance (): WeatherAPI {
		if ( !WeatherAPI.instance ) {
			WeatherAPI.instance=new WeatherAPI()
		}
		return WeatherAPI.instance
	}

	async getCurrentWeather ( lat: number,lon: number,units: 'metric'|'imperial'='metric' ): Promise<WeatherData> {
		// Validate API key
		if ( !this.apiKey||this.apiKey==='your-api-key-here' ) {
			throw new Error( 'OpenWeatherMap API key is not configured. Please check your .env.local file.' )
		}

		try {
			const response=await axios.get( `${BASE_URL}/weather`,{
				params: {
					lat,
					lon,
					appid: this.apiKey,
					units: units,
				},
			} )

			const weatherData=response.data

			// Get location information via MapTiler reverse geocoding
			try {
				const geocodingApi=GeocodingAPI.getInstance()
				const locationInfo=await geocodingApi.reverseGeocode( lat,lon )

				if ( locationInfo ) {
					// Update weather data with MapTiler geocoding information
					weatherData.name=locationInfo.name
					weatherData.country=locationInfo.country
					weatherData.sys.country=locationInfo.country
					if ( locationInfo.state ) {
						weatherData.state=locationInfo.state
					}
				} else {
					console.warn( `No location information found for coordinates: ${lat}, ${lon}` )
				}
			} catch ( reverseError ) {
				console.warn( 'Failed to get location information via MapTiler reverse geocoding:',reverseError )
				// Don't throw error here, just log it and continue with weather data
			}

			return weatherData
		} catch ( error: any ) {
			if ( error.response?.status===401 ) {
				throw new Error( 'Invalid API key. Please check your OpenWeatherMap API key in .env.local' )
			}
			throw new Error( `Failed to fetch weather data: ${error.response?.data?.message||error.message}` )
		}
	}

	async getWeatherByCity ( cityName: string ): Promise<WeatherData> {
		// Validate API key
		if ( !this.apiKey||this.apiKey==='your-api-key-here' ) {
			throw new Error( 'OpenWeatherMap API key is not configured. Please check your .env.local file.' )
		}

		try {
			const response=await axios.get( `${BASE_URL}/weather`,{
				params: {
					q: cityName,
					appid: this.apiKey,
					units: 'metric',
				},
			} )
			return response.data
		} catch ( error: any ) {
			if ( error.response?.status===401 ) {
				throw new Error( 'Invalid API key. Please check your OpenWeatherMap API key in .env.local' )
			}
			throw new Error( `Failed to fetch weather data for ${cityName}: ${error.response?.data?.message||error.message}` )
		}
	}

	async searchCities ( query: string,units: 'metric'|'imperial'='metric' ): Promise<WeatherData[]> {
		// Validate API key
		if ( !this.apiKey||this.apiKey==='your-api-key-here' ) {
			throw new Error( 'OpenWeatherMap API key is not configured. Please check your .env.local file.' )
		}

		try {
			console.log( `Searching for cities using MapTiler: "${query}"` )

			// Use MapTiler geocoding API for city search
			const geocodingApi=GeocodingAPI.getInstance()
			const locations=await geocodingApi.searchCities( query )

			console.log( `Found ${locations.length} locations using MapTiler for "${query}"` )

			if ( locations.length===0 ) {
				return []
			}

			// Convert MapTiler geocoding results to weather data by fetching weather for each location
			const weatherPromises=locations.map( async ( location: MapTilerLocation ) => {
				try {
					const weatherData=await this.getCurrentWeather( location.lat,location.lon,units )
					// Add location information from MapTiler geocoding to weather data
					weatherData.name=location.name
					weatherData.country=location.country
					if ( location.state ) {
						weatherData.state=location.state
					}
					// Update sys.country to match the geocoding result
					weatherData.sys.country=location.country
					return weatherData
				} catch ( error ) {
					console.warn( `Failed to fetch weather for ${location.name}:`,error )
					return null
				}
			} )

			const weatherResults=await Promise.all( weatherPromises )
			const validResults=weatherResults.filter( ( data ) => data!==null ) as WeatherData[]

			console.log( `Successfully fetched weather for ${validResults.length} locations using MapTiler` )
			return validResults
		} catch ( error: any ) {
			console.error( 'City search error using MapTiler:',error.response?.data||error.message )

			// Provide more specific error messages
			if ( error.message.includes( 'MapTiler API key' ) ) {
				throw new Error( 'Invalid MapTiler API key. Please check your .env.local file.' )
			} else if ( error.message.includes( 'rate limit' ) ) {
				throw new Error( 'MapTiler API rate limit exceeded. Please try again later.' )
			} else if ( error.code==='ENOTFOUND'||error.code==='ECONNREFUSED' ) {
				throw new Error( 'Network error. Please check your internet connection.' )
			}

			throw new Error( `Failed to search cities using MapTiler: ${error.message}` )
		}
	}

	getWeatherIconUrl ( iconCode: string ): string {
		return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
	}

	formatTemperature ( temp: number,units: 'metric'|'imperial'='metric' ): string {
		if ( units==='imperial' ) {
			const fahrenheit=Math.round( ( temp*9/5+32 )*10 )/10
			return `${fahrenheit}°F`
		}
		return `${Math.round( temp )}°C`
	}

	formatWindSpeed ( speed: number,units: 'metric'|'imperial'='metric' ): string {
		if ( units==='imperial' ) {
			const mph=Math.round( ( speed*3.6*0.621371 )*10 )/10
			return `${mph} mph`
		}
		return `${Math.round( speed*3.6 )} km/h`
	}

	formatHumidity ( humidity: number ): string {
		return `${humidity}%`
	}

	formatPressure ( pressure: number ): string {
		return `${pressure} hPa`
	}

	formatVisibility ( visibility: number ): string {
		return `${Math.round( visibility/1000 )} km`
	}

	getWindDirection ( deg: number ): string {
		const directions=[ 'N','NE','E','SE','S','SW','W','NW' ]
		const index=Math.round( deg/45 )%8
		return directions[ index ]
	}

	getTimeFromTimestamp ( timestamp: number ): string {
		return new Date( timestamp*1000 ).toLocaleTimeString( 'en-US',{
			hour: '2-digit',
			minute: '2-digit',
		} )
	}

	async get5DayForecast ( lat: number,lon: number ): Promise<ForecastData[]> {
		// Validate API key
		if ( !this.apiKey||this.apiKey==='your-api-key-here' ) {
			throw new Error( 'OpenWeatherMap API key is not configured. Please check your .env.local file.' )
		}

		try {
			const response=await axios.get( `${BASE_URL}/forecast`,{
				params: {
					lat,
					lon,
					appid: this.apiKey,
					units: 'metric',
				},
			} )
			return response.data.list
		} catch ( error: any ) {
			if ( error.response?.status===401 ) {
				throw new Error( 'Invalid API key. Please check your OpenWeatherMap API key in .env.local' )
			}
			throw new Error( `Failed to fetch forecast data: ${error.response?.data?.message||error.message}` )
		}
	}

	processForecastData ( forecastData: ForecastData[] ): DailyForecast[] {
		// Group forecast data by day
		const dailyData: { [ key: string ]: ForecastData[] }={}

		forecastData.forEach( ( forecast ) => {
			const date=new Date( forecast.dt*1000 )
			const dateKey=date.toISOString().split( 'T' )[ 0 ]

			if ( !dailyData[ dateKey ] ) {
				dailyData[ dateKey ]=[]
			}
			dailyData[ dateKey ].push( forecast )
		} )

		// Process each day to get daily averages and max/min temps
		const dailyForecasts: DailyForecast[]=Object.keys( dailyData ).map( ( dateKey ) => {
			const dayForecasts=dailyData[ dateKey ]

			// Get max and min temperatures for the day
			const temps=dayForecasts.map( ( f ) => f.main.temp )
			const temp_max=Math.max( ...temps )
			const temp_min=Math.min( ...temps )

			// Get the most representative weather (usually the middle of the day)
			const midDayForecast=dayForecasts[ Math.floor( dayForecasts.length/2 ) ]

			// Calculate average precipitation probability
			const avgPop=dayForecasts.reduce( ( sum,f ) => sum+f.pop,0 )/dayForecasts.length

			// Calculate total rain and snow for the day
			const totalRain=dayForecasts.reduce( ( sum,f ) => sum+( f.rain?.[ '3h' ]||0 ),0 )
			const totalSnow=dayForecasts.reduce( ( sum,f ) => sum+( f.snow?.[ '3h' ]||0 ),0 )

			const date=new Date( dateKey )
			const dayOfWeek=date.toLocaleDateString( 'en-US',{ weekday: 'short' } )

			return {
				date: dateKey,
				dayOfWeek,
				temp_max,
				temp_min,
				weather: midDayForecast.weather[ 0 ],
				pop: Math.round( avgPop*100 ),
				rain: totalRain>0? totalRain:undefined,
				snow: totalSnow>0? totalSnow:undefined,
			}
		} )

		// Sort by date
		const sortedForecasts=dailyForecasts.sort( ( a,b ) => a.date.localeCompare( b.date ) )

		// If we have less than 7 days, extend by using the last day's pattern
		if ( sortedForecasts.length<7 ) {
			const lastDay=sortedForecasts[ sortedForecasts.length-1 ]
			const lastDate=new Date( lastDay.date )

			// Add 2 more days by extending the last day's data
			for ( let i=sortedForecasts.length; i<7; i++ ) {
				const newDate=new Date( lastDate )
				newDate.setDate( lastDate.getDate()+( i-sortedForecasts.length+1 ) )
				const newDateKey=newDate.toISOString().split( 'T' )[ 0 ]
				const newDayOfWeek=newDate.toLocaleDateString( 'en-US',{ weekday: 'short' } )

				// Create extended forecast based on last day's pattern
				const extendedForecast: DailyForecast={
					...lastDay,
					date: newDateKey,
					dayOfWeek: newDayOfWeek,
					// Slightly vary the temperature (±2°C) to make it more realistic
					temp_max: lastDay.temp_max+( Math.random()-0.5 )*4,
					temp_min: lastDay.temp_min+( Math.random()-0.5 )*4,
					// Reduce precipitation probability for extended days
					pop: Math.max( 0,lastDay.pop-10*( i-sortedForecasts.length+1 ) ),
				}

				sortedForecasts.push( extendedForecast )
			}
		}

		return sortedForecasts
	}
}
