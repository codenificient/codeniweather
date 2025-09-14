import { geocoding } from '@maptiler/client'

export interface MapTilerLocation {
	name: string
	country: string
	state?: string
	lat: number
	lon: number
	place_name: string
	context: Array<{
		id: string
		text: string
		short_code?: string
	}>
}

export class GeocodingAPI {
	private static instance: GeocodingAPI
	private apiKey: string

	private constructor() {
		this.apiKey=process.env.NEXT_PUBLIC_MAPTILER_API_KEY||'YOUR_MAPTILER_API_KEY'
		console.log( 'GeocodingAPI initialized with MapTiler API key:',this.apiKey? `${this.apiKey.substring( 0,8 )}...`:'NOT SET' )
	}

	public static getInstance (): GeocodingAPI {
		if ( !GeocodingAPI.instance ) {
			GeocodingAPI.instance=new GeocodingAPI()
		}
		return GeocodingAPI.instance
	}

	async searchCities ( query: string ): Promise<MapTilerLocation[]> {
		// Validate API key
		if ( !process.env.NEXT_PUBLIC_MAPTILER_API_KEY||process.env.NEXT_PUBLIC_MAPTILER_API_KEY==='YOUR_MAPTILER_API_KEY' ) {
			throw new Error( 'MapTiler API key is not configured. Please check your .env.local file.' )
		}

		// Validate query
		if ( !query||typeof query!=='string'||query.trim().length===0 ) {
			console.warn( `Invalid search query: "${query}"` )
			return []
		}

		try {
			console.log( `Searching for cities using MapTiler: "${query}"` )

			// Use MapTiler geocoding API
			const response=await geocoding.forward( query,{
				limit: 5,
				language: 'en',
				// Remove types filter for now to avoid type errors
			} )

			const locations: MapTilerLocation[]=response.features.map( ( feature ) => {
				// Extract location details from MapTiler response
				const geometry=feature.geometry as any // Type assertion to handle geometry types
				const coordinates=geometry.coordinates
				const properties=feature.properties as any // Type assertion to handle properties
				const context=feature.context||[]

				// Extract city, state, and country from context
				let city=''
				let state=''
				let country=''

				context.forEach( ( item ) => {
					if ( item.id.startsWith( 'place.' )||item.id.startsWith( 'locality.' )||item.id.startsWith( 'city.' ) ) {
						city=item.text
					} else if ( item.id.startsWith( 'region.' )||item.id.startsWith( 'state.' ) ) {
						state=item.text
					} else if ( item.id.startsWith( 'country.' ) ) {
						country=item.text
					}
				} )

				// If no city found in context, use the main text
				if ( !city ) {
					city=properties.name||feature.text||'Unknown'
				}

				// If no country found in context, try to get it from properties
				if ( !country ) {
					country=properties.country||'Unknown'
				}

				return {
					name: city,
					country,
					state: state||undefined,
					lat: coordinates[ 1 ], // MapTiler returns [lon, lat]
					lon: coordinates[ 0 ],
					place_name: feature.place_name,
					context,
				}
			} )

			console.log( `Found ${locations.length} locations using MapTiler for "${query}"` )
			return locations
		} catch ( error: any ) {
			console.error( 'MapTiler geocoding error:',error.response?.data||error.message )

			// Provide more specific error messages
			if ( error.response?.status===401 ) {
				throw new Error( 'Invalid MapTiler API key. Please check your .env.local file.' )
			} else if ( error.response?.status===429 ) {
				throw new Error( 'MapTiler API rate limit exceeded. Please try again later.' )
			} else if ( error.code==='ENOTFOUND'||error.code==='ECONNREFUSED' ) {
				throw new Error( 'Network error. Please check your internet connection.' )
			}

			throw new Error( `Failed to search cities using MapTiler: ${error.response?.data?.message||error.message}` )
		}
	}

	async reverseGeocode ( lat: number,lon: number ): Promise<MapTilerLocation|null> {
		// Validate API key
		if ( !process.env.NEXT_PUBLIC_MAPTILER_API_KEY||process.env.NEXT_PUBLIC_MAPTILER_API_KEY==='YOUR_MAPTILER_API_KEY' ) {
			throw new Error( 'MapTiler API key is not configured. Please check your .env.local file.' )
		}

		// Validate coordinates
		if ( !lat||!lon||isNaN( lat )||isNaN( lon ) ) {
			console.warn( `Invalid coordinates for reverse geocoding: lat=${lat}, lon=${lon}` )
			return null
		}

		// Validate coordinate ranges
		if ( lat<-90||lat>90||lon<-180||lon>180 ) {
			console.warn( `Coordinates out of valid range: lat=${lat}, lon=${lon}` )
			return null
		}

		try {
			console.log( `Reverse geocoding using MapTiler: ${lat}, ${lon}` )

			// Use MapTiler reverse geocoding API
			const response=await geocoding.reverse( [ lon,lat ],{
				limit: 1,
				language: 'en',
			} )

			if ( response.features.length===0 ) {
				return null
			}

			const feature=response.features[ 0 ]
			const geometry=feature.geometry as any // Type assertion to handle geometry types
			const coordinates=geometry.coordinates
			const properties=feature.properties as any // Type assertion to handle properties
			const context=feature.context||[]

			// Extract city, state, and country from context
			let city=''
			let state=''
			let country=''

			context.forEach( ( item ) => {
				if ( item.id.startsWith( 'place.' )||item.id.startsWith( 'locality.' )||item.id.startsWith( 'city.' ) ) {
					city=item.text
				} else if ( item.id.startsWith( 'region.' )||item.id.startsWith( 'state.' ) ) {
					state=item.text
				} else if ( item.id.startsWith( 'country.' ) ) {
					country=item.text
				}
			} )

			// If no city found in context, use the main text
			if ( !city ) {
				city=properties.name||feature.text||'Unknown'
			}

			// If no country found in context, try to get it from properties
			if ( !country ) {
				country=properties.country||'Unknown'
			}

			return {
				name: city,
				country,
				state: state||undefined,
				lat: coordinates[ 1 ], // MapTiler returns [lon, lat]
				lon: coordinates[ 0 ],
				place_name: feature.place_name,
				context,
			}
		} catch ( error: any ) {
			console.error( 'MapTiler reverse geocoding error:',error.response?.data||error.message )
			throw new Error( `Failed to reverse geocode using MapTiler: ${error.response?.data?.message||error.message}` )
		}
	}
}
