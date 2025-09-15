import { US_STATES } from './state-boundaries'

export interface StateWeatherData {
	stateId: string
	stateName: string
	averageValue: number
	unit: string
	sampleCount: number
	lastUpdated: Date
}

export interface WeatherSample {
	lat: number
	lng: number
	value: number
	timestamp: Date
}

// Weather layer configuration
const WEATHER_LAYER_CONFIG={
	temperature: {
		unit: '°C',
		icon: '🌡️',
		variant: 'temperature' as const,
		aggregationMethod: 'average' as const
	},
	precipitation: {
		unit: 'mm/h',
		icon: '🌧️',
		variant: 'precipitation' as const,
		aggregationMethod: 'average' as const
	},
	wind: {
		unit: 'm/s',
		icon: '💨',
		variant: 'wind' as const,
		aggregationMethod: 'average' as const
	},
	pressure: {
		unit: 'hPa',
		icon: '📊',
		variant: 'pressure' as const,
		aggregationMethod: 'average' as const
	},
	radar: {
		unit: 'dBZ',
		icon: '📡',
		variant: 'radar' as const,
		aggregationMethod: 'average' as const
	},
	clouds: {
		unit: '%',
		icon: '☁️',
		variant: 'clouds' as const,
		aggregationMethod: 'average' as const
	},
	'frozen-precipitation': {
		unit: '%',
		icon: '❄️',
		variant: 'frozen' as const,
		aggregationMethod: 'average' as const
	}
}

export class StateWeatherAggregator {
	private samples: Map<string,WeatherSample[]>=new Map()
	private stateWeatherData: Map<string,StateWeatherData>=new Map()

	// Add a weather sample for a specific state
	addSample ( stateId: string,sample: WeatherSample ) {
		if ( !this.samples.has( stateId ) ) {
			this.samples.set( stateId,[] )
		}

		const stateSamples=this.samples.get( stateId )!
		stateSamples.push( sample )

		// Keep only the last 100 samples per state to prevent memory issues
		if ( stateSamples.length>100 ) {
			stateSamples.splice( 0,stateSamples.length-100 )
		}

		this.updateStateWeatherData( stateId )
	}

	// Update aggregated weather data for a state
	private updateStateWeatherData ( stateId: string ) {
		const samples=this.samples.get( stateId )
		if ( !samples||samples.length===0 ) return

		const state=US_STATES.find( s => s.id===stateId )
		if ( !state ) return

		// Calculate average value
		const averageValue=samples.reduce( ( sum,sample ) => sum+sample.value,0 )/samples.length
		const latestTimestamp=new Date( Math.max( ...samples.map( s => s.timestamp.getTime() ) ) )

		this.stateWeatherData.set( stateId,{
			stateId,
			stateName: state.name,
			averageValue,
			unit: '', // Will be set by the layer type
			sampleCount: samples.length,
			lastUpdated: latestTimestamp
		} )
	}

	// Get weather data for all states
	getStateWeatherData ( layerType: string ): StateWeatherData[] {
		const config=WEATHER_LAYER_CONFIG[ layerType as keyof typeof WEATHER_LAYER_CONFIG ]
		if ( !config ) return []

		return Array.from( this.stateWeatherData.values() ).map( data => ( {
			...data,
			unit: config.unit
		} ) )
	}

	// Get weather data for a specific state
	getStateWeatherDataById ( stateId: string,layerType: string ): StateWeatherData|null {
		const config=WEATHER_LAYER_CONFIG[ layerType as keyof typeof WEATHER_LAYER_CONFIG ]
		if ( !config ) return null

		const data=this.stateWeatherData.get( stateId )
		if ( !data ) return null

		return {
			...data,
			unit: config.unit
		}
	}

	// Clear old samples (older than 1 hour)
	clearOldSamples () {
		const oneHourAgo=new Date( Date.now()-60*60*1000 )

		const stateIds=Array.from( this.samples.keys() )
		for ( const stateId of stateIds ) {
			const samples=this.samples.get( stateId )
			if ( !samples ) continue

			const filteredSamples=samples.filter( sample => sample.timestamp>oneHourAgo )
			this.samples.set( stateId,filteredSamples )

			if ( filteredSamples.length===0 ) {
				this.samples.delete( stateId )
				this.stateWeatherData.delete( stateId )
			} else {
				this.updateStateWeatherData( stateId )
			}
		}
	}

	// Get layer configuration
	getLayerConfig ( layerType: string ) {
		return WEATHER_LAYER_CONFIG[ layerType as keyof typeof WEATHER_LAYER_CONFIG ]
	}

	// Simulate weather data for demonstration (in real app, this would come from API)
	generateSampleData ( layerType: string,bounds: { north: number,south: number,east: number,west: number } ) {
		const statesInBounds=US_STATES.filter( state =>
			state.bounds.north>=bounds.south&&
			state.bounds.south<=bounds.north&&
			state.bounds.east>=bounds.west&&
			state.bounds.west<=bounds.east
		)

		statesInBounds.forEach( state => {
			// Generate 5-10 sample points per state
			const sampleCount=Math.floor( Math.random()*6 )+5

			for ( let i=0; i<sampleCount; i++ ) {
				const lat=state.bounds.south+Math.random()*( state.bounds.north-state.bounds.south )
				const lng=state.bounds.west+Math.random()*( state.bounds.east-state.bounds.west )

				// Generate realistic weather values based on layer type
				let value=0
				switch ( layerType ) {
					case 'temperature':
						value=15+Math.random()*20-10 // 5-25°C
						break
					case 'precipitation':
						value=Math.random()*10 // 0-10 mm/h
						break
					case 'wind':
						value=Math.random()*15 // 0-15 m/s
						break
					case 'pressure':
						value=980+Math.random()*40 // 980-1020 hPa
						break
					case 'radar':
						value=Math.random()*50 // 0-50 dBZ
						break
					case 'clouds':
						value=Math.random()*100 // 0-100%
						break
					case 'frozen-precipitation':
						value=Math.random()*100 // 0-100%
						break
				}

				this.addSample( state.id,{
					lat,
					lng,
					value,
					timestamp: new Date()
				} )
			}
		} )
	}
}

// Singleton instance
export const stateWeatherAggregator=new StateWeatherAggregator()
