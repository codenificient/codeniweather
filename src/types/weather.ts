export interface WeatherData {
	id: number
	name: string
	country: string
	coord: {
		lat: number
		lon: number
	}
	weather: {
		id: number
		main: string
		description: string
		icon: string
	}[]
	main: {
		temp: number
		feels_like: number
		temp_min: number
		temp_max: number
		pressure: number
		humidity: number
	}
	wind: {
		speed: number
		deg: number
	}
	visibility: number
	clouds: {
		all: number
	}
	dt: number
	sys: {
		country: string
		sunrise: number
		sunset: number
	}
}

export interface Location {
	id: string
	name: string
	country: string
	lat: number
	lon: number
	isCurrentLocation?: boolean
}

export interface WeatherError {
	message: string
	code?: string
}

export interface WeatherState {
	locations: Location[]
	currentLocation: Location|null
	weatherData: Record<string,WeatherData>
	loading: boolean
	error: WeatherError|null
}
