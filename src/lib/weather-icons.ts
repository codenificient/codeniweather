/**
 * Weather icon utility for theme-aware weather icons
 * Provides different icon sets for light and dark modes
 */

export type Theme='light'|'dark'

export interface WeatherIconSets {
	light: { [ key: string ]: string }
	dark: { [ key: string ]: string }
}

export const weatherIcons: WeatherIconSets={
	light: {
		'clear sky': '☀️',
		'few clouds': '🌤️',
		'scattered clouds': '⛅',
		'broken clouds': '☁️',
		'shower rain': '🌦️',
		'rain': '🌧️',
		'thunderstorm': '⛈️',
		'snow': '❄️',
		'mist': '🌫️',
		'fog': '🌫️',
		'haze': '🌫️'
	},
	dark: {
		'clear sky': '🌙',
		'few clouds': '☁️',
		'scattered clouds': '☁️',
		'broken clouds': '☁️',
		'shower rain': '🌧️',
		'rain': '🌧️',
		'thunderstorm': '⛈️',
		'snow': '❄️',
		'mist': '🌫️',
		'fog': '🌫️',
		'haze': '🌫️'
	}
}

/**
 * Get weather icon based on condition and theme
 * @param condition - Weather condition string
 * @param theme - Current theme ('light' or 'dark')
 * @returns Weather icon emoji
 */
export const getWeatherIcon=( condition: string,theme: Theme='light' ): string => {
	const iconMap=weatherIcons[ theme ]
	return iconMap[ condition.toLowerCase() ]||( theme==='dark'? '☁️':'🌤️' )
}

/**
 * Get all weather icons for a specific theme
 * @param theme - Current theme ('light' or 'dark')
 * @returns Object with all weather icons for the theme
 */
export const getWeatherIconsForTheme=( theme: Theme ) => {
	return weatherIcons[ theme ]
}
