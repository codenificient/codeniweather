import { Location } from '@/types/weather'

export class GeolocationService {
	private static readonly DEFAULT_TIMEOUT=15000; // 15 seconds
	private static readonly FALLBACK_TIMEOUT=5000; // 5 seconds for fallback
	private static readonly MAX_AGE=300000; // 5 minutes

	static async getCurrentPosition (): Promise<Location> {
		return new Promise( ( resolve,reject ) => {
			if ( !navigator.geolocation ) {
				reject( new Error( 'Geolocation is not supported by this browser.' ) )
				return
			}

			// First attempt with high accuracy
			navigator.geolocation.getCurrentPosition(
				async ( position ) => {
					try {
						const location=await this.processPosition( position )
						resolve( location )
					} catch ( error ) {
						reject( error )
					}
				},
				( error ) => {
					// If high accuracy fails, try with lower accuracy as fallback
					this.tryFallbackGeolocation( resolve,reject,error )
				},
				{
					enableHighAccuracy: true,
					timeout: this.DEFAULT_TIMEOUT,
					maximumAge: this.MAX_AGE,
				}
			)
		} )
	}

	private static tryFallbackGeolocation (
		resolve: ( value: Location ) => void,
		reject: ( reason: Error ) => void,
		originalError: GeolocationPositionError
	): void {
		console.warn( 'High accuracy geolocation failed, trying fallback...',originalError )

		navigator.geolocation.getCurrentPosition(
			async ( position ) => {
				try {
					const location=await this.processPosition( position )
					resolve( location )
				} catch ( error: any ) {
					reject( error )
				}
			},
			( fallbackError ) => {
				// If both attempts fail, provide a helpful error message
				const errorMessage=this.getErrorMessage( originalError,fallbackError )
				reject( new Error( errorMessage ) )
			},
			{
				enableHighAccuracy: false,
				timeout: this.FALLBACK_TIMEOUT,
				maximumAge: this.MAX_AGE,
			}
		)
	}

	private static async processPosition ( position: GeolocationPosition ): Promise<Location> {
		const { latitude,longitude }=position.coords

		try {
			// Add timeout for reverse geocoding
			const location=await this.reverseGeocodeWithTimeout( latitude,longitude )
			return location
		} catch ( error ) {
			console.warn( 'Reverse geocoding failed, using coordinates:',error )
			// Fallback to coordinates if reverse geocoding fails
			return {
				id: `current-${Date.now()}`,
				name: `${latitude.toFixed( 2 )}, ${longitude.toFixed( 2 )}`,
				country: 'Unknown',
				lat: latitude,
				lon: longitude,
				isCurrentLocation: true,
			}
		}
	}

	private static async reverseGeocodeWithTimeout (
		latitude: number,
		longitude: number
	): Promise<Location> {
		const controller=new AbortController()
		const timeoutId=setTimeout( () => controller.abort(),5000 ) // 5 second timeout

		try {
			const response=await fetch(
				`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY||'your-api-key-here'}`,
				{ signal: controller.signal }
			)

			clearTimeout( timeoutId )

			if ( !response.ok ) {
				throw new Error( `Reverse geocoding failed: ${response.status}` )
			}

			const data=await response.json()
			const locationData=data[ 0 ]

			if ( !locationData ) {
				throw new Error( 'No location data found' )
			}

			return {
				id: `current-${Date.now()}`,
				name: locationData.name||`${latitude.toFixed( 2 )}, ${longitude.toFixed( 2 )}`,
				country: locationData.country||'Unknown',
				lat: latitude,
				lon: longitude,
				isCurrentLocation: true,
			}
		} catch ( error ) {
			clearTimeout( timeoutId )
			throw error
		}
	}

	private static getErrorMessage (
		originalError: GeolocationPositionError,
		fallbackError: GeolocationPositionError
	): string {
		// Check if it's a timeout issue
		if ( originalError.code===originalError.TIMEOUT||fallbackError.code===fallbackError.TIMEOUT ) {
			return 'Location request timed out. Please check your internet connection and try again, or search for a city manually.'
		}

		// Check for permission issues
		if ( originalError.code===originalError.PERMISSION_DENIED||fallbackError.code===fallbackError.PERMISSION_DENIED ) {
			return 'Location access denied. Please enable location permissions in your browser settings, or search for a city manually.'
		}

		// Check for position unavailable
		if ( originalError.code===originalError.POSITION_UNAVAILABLE||fallbackError.code===fallbackError.POSITION_UNAVAILABLE ) {
			return 'Unable to determine your location. Please check your GPS settings or search for a city manually.'
		}

		// Generic error
		return 'Unable to get your current location. Please search for a city manually.'
	}

	// Alternative method for getting location with IP fallback
	static async getCurrentPositionWithIPFallback (): Promise<Location> {
		try {
			return await this.getCurrentPosition()
		} catch ( error ) {
			console.warn( 'Geolocation failed, trying IP-based location...',error )
			return this.getLocationByIP()
		}
	}

	private static async getLocationByIP (): Promise<Location> {
		try {
			const response=await fetch( 'https://ipapi.co/json/' )
			const data=await response.json()

			if ( data.error ) {
				throw new Error( 'IP-based location failed' )
			}

			return {
				id: `ip-${Date.now()}`,
				name: data.city||'Unknown City',
				country: data.country_name||'Unknown',
				lat: data.latitude,
				lon: data.longitude,
				isCurrentLocation: true,
			}
		} catch ( error ) {
			throw new Error( 'Unable to determine your location. Please search for a city manually.' )
		}
	}
}
