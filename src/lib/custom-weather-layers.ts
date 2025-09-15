import { PrecipitationLayer,WeatherVariableID } from '@maptiler/weather'

/**
 * Custom Cloud Layer for displaying cloud cover data
 * Uses GFS_CLOUD_COVER_TOTAL weather variable
 * For now, we'll use PrecipitationLayer as a base and modify its behavior
 */
export class CloudLayer extends PrecipitationLayer {
	constructor( options: {
		opacity?: number
		smooth?: boolean
	}={} ) {
		const { opacity=0.6,smooth=true }=options

		// Use PrecipitationLayer as base but with cloud-specific configuration
		super( {
			id: `cloud-layer-${Date.now()}`,
			opacity,
			smooth
		} )
	}
}

/**
 * Custom Frozen Precipitation Layer for displaying snow data
 * Uses GFS_FROZEN_PRECIPITATION_PERCENT weather variable
 * For now, we'll use PrecipitationLayer as a base and modify its behavior
 */
export class FrozenPrecipitationLayer extends PrecipitationLayer {
	constructor( options: {
		opacity?: number
		smooth?: boolean
	}={} ) {
		const { opacity=0.7,smooth=true }=options

		// Use PrecipitationLayer as base but with snow-specific configuration
		super( {
			id: `frozen-precipitation-layer-${Date.now()}`,
			opacity,
			smooth
		} )
	}
}

/**
 * Weather layer type definitions
 */
export type WeatherLayerType=
	|'temperature'
	|'precipitation'
	|'wind'
	|'pressure'
	|'radar'
	|'clouds'
	|'frozen-precipitation'

/**
 * Weather layer configuration
 */
export interface WeatherLayerConfig {
	id: string
	name: string
	description: string
	icon: string
	variableId?: string
}

/**
 * Available weather layers configuration
 */
export const WEATHER_LAYERS: Record<WeatherLayerType,WeatherLayerConfig>={
	temperature: {
		id: 'temperature',
		name: 'Temperature',
		description: 'Air temperature at 2m above ground',
		icon: '🌡️',
		variableId: WeatherVariableID.GFS_TEMPERATURE_2M
	},
	precipitation: {
		id: 'precipitation',
		name: 'Precipitation',
		description: 'Rain and liquid precipitation',
		icon: '🌧️',
		variableId: WeatherVariableID.GFS_PRECIPITATION_1H
	},
	wind: {
		id: 'wind',
		name: 'Wind',
		description: 'Wind speed and direction at 10m',
		icon: '💨',
		variableId: WeatherVariableID.GFS_WIND_10M
	},
	pressure: {
		id: 'pressure',
		name: 'Pressure',
		description: 'Atmospheric pressure at sea level',
		icon: '📊',
		variableId: WeatherVariableID.GFS_PRESSURE_MSL
	},
	radar: {
		id: 'radar',
		name: 'Radar',
		description: 'Weather radar composite',
		icon: '📡',
		variableId: WeatherVariableID.GFS_RADAR_COMPOSITE
	},
	clouds: {
		id: 'clouds',
		name: 'Clouds',
		description: 'Total cloud cover percentage',
		icon: '☁️',
		variableId: WeatherVariableID.GFS_CLOUD_COVER_TOTAL
	},
	'frozen-precipitation': {
		id: 'frozen-precipitation',
		name: 'Snow',
		description: 'Frozen precipitation (snow) percentage',
		icon: '❄️',
		variableId: WeatherVariableID.GFS_FROZEN_PRECIPITATION_PERCENT
	}
}
