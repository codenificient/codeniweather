import { WeatherData } from '@/types/weather'
import axios from 'axios'

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

	async getCurrentWeather ( lat: number,lon: number ): Promise<WeatherData> {
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
					units: 'metric',
				},
			} )
			return response.data
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

	async searchCities ( query: string ): Promise<WeatherData[]> {
		// Validate API key
		if ( !this.apiKey||this.apiKey==='your-api-key-here' ) {
			throw new Error( 'OpenWeatherMap API key is not configured. Please check your .env.local file.' )
		}

		try {
			console.log( `Searching for cities: "${query}"` )

			// Use the new geocoding API for city search
			const response=await axios.get( `https://api.openweathermap.org/geo/1.0/direct`,{
				params: {
					q: query,
					limit: 5,
					appid: this.apiKey,
				},
			} )

			const locations=response.data||[]
			console.log( `Found ${locations.length} locations for "${query}"` )

			if ( locations.length===0 ) {
				return []
			}

			// Convert geocoding results to weather data by fetching weather for each location
			const weatherPromises=locations.map( async ( location: any ) => {
				try {
					const weatherData=await this.getCurrentWeather( location.lat,location.lon )
					// Add state information from geocoding API to weather data
					if ( location.state ) {
						weatherData.state=location.state
					}
					return weatherData
				} catch ( error ) {
					console.warn( `Failed to fetch weather for ${location.name}:`,error )
					return null
				}
			} )

			const weatherResults=await Promise.all( weatherPromises )
			const validResults=weatherResults.filter( ( data ) => data!==null ) as WeatherData[]

			console.log( `Successfully fetched weather for ${validResults.length} locations` )
			return validResults
		} catch ( error: any ) {
			console.error( 'City search error:',error.response?.data||error.message )

			// Provide more specific error messages
			if ( error.response?.status===401 ) {
				throw new Error( 'Invalid API key. Please check your OpenWeatherMap API key in .env.local' )
			} else if ( error.response?.status===429 ) {
				throw new Error( 'API rate limit exceeded. Please try again later.' )
			} else if ( error.code==='ENOTFOUND'||error.code==='ECONNREFUSED' ) {
				throw new Error( 'Network error. Please check your internet connection.' )
			}

			throw new Error( `Failed to search cities: ${error.response?.data?.message||error.message}` )
		}
	}

	getWeatherIconUrl ( iconCode: string ): string {
		return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
	}

	formatTemperature ( temp: number ): string {
		return `${Math.round( temp )}°C`
	}

	formatWindSpeed ( speed: number ): string {
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
}
