export interface WeatherData {
	id: number
	name: string
	country: string
	state?: string // State/province information
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
	state?: string // State/province information
	lat: number
	lon: number
	isCurrentLocation?: boolean
}

export interface WeatherError {
	message: string
	code?: string
}

export interface ForecastData {
	dt: number
	main: {
		temp: number
		temp_min: number
		temp_max: number
		humidity: number
		pressure: number
	}
	weather: {
		id: number
		main: string
		description: string
		icon: string
	}[]
	wind: {
		speed: number
		deg: number
	}
	pop: number // Probability of precipitation
	rain?: {
		'3h': number
	}
	snow?: {
		'3h': number
	}
}

export interface DailyForecast {
	date: string
	dayOfWeek: string
	temp_max: number
	temp_min: number
	weather: {
		id: number
		main: string
		description: string
		icon: string
	}
	pop: number
	rain?: number
	snow?: number
}

export interface WeatherState {
	locations: Location[]
	currentLocation: Location|null
	weatherData: Record<string,WeatherData>
	forecastData: Record<string,DailyForecast[]>
	loading: boolean
	error: WeatherError|null
}
