export type UnitSystem='metric'|'imperial'

export interface UnitConversion {
	temperature: ( celsius: number ) => number
	speed: ( kmh: number ) => number
	distance: ( km: number ) => number
	pressure: ( hPa: number ) => number
	getTemperatureUnit: () => string
	getSpeedUnit: () => string
	getDistanceUnit: () => string
	getPressureUnit: () => string
}

export const unitConversions: Record<UnitSystem,UnitConversion>={
	metric: {
		temperature: ( celsius: number ) => celsius,
		speed: ( kmh: number ) => kmh,
		distance: ( km: number ) => km,
		pressure: ( hPa: number ) => hPa,
		getTemperatureUnit: () => '°C',
		getSpeedUnit: () => 'km/h',
		getDistanceUnit: () => 'km',
		getPressureUnit: () => 'hPa'
	},
	imperial: {
		temperature: ( celsius: number ) => Math.round( ( celsius*9/5+32 )*10 )/10,
		speed: ( kmh: number ) => Math.round( ( kmh*0.621371 )*10 )/10,
		distance: ( km: number ) => Math.round( ( km*0.621371 )*10 )/10,
		pressure: ( hPa: number ) => Math.round( ( hPa*0.02953 )*100 )/100,
		getTemperatureUnit: () => '°F',
		getSpeedUnit: () => 'mph',
		getDistanceUnit: () => 'mi',
		getPressureUnit: () => 'inHg'
	}
}

export const convertTemperature=( celsius: number,units: UnitSystem ): number => {
	return unitConversions[ units ].temperature( celsius )
}

export const convertSpeed=( kmh: number,units: UnitSystem ): number => {
	return unitConversions[ units ].speed( kmh )
}

export const convertDistance=( km: number,units: UnitSystem ): number => {
	return unitConversions[ units ].distance( km )
}

export const convertPressure=( hPa: number,units: UnitSystem ): number => {
	return unitConversions[ units ].pressure( hPa )
}

export const getTemperatureUnit=( units: UnitSystem ): string => {
	return unitConversions[ units ].getTemperatureUnit()
}

export const getSpeedUnit=( units: UnitSystem ): string => {
	return unitConversions[ units ].getSpeedUnit()
}

export const getDistanceUnit=( units: UnitSystem ): string => {
	return unitConversions[ units ].getDistanceUnit()
}

export const getPressureUnit=( units: UnitSystem ): string => {
	return unitConversions[ units ].getPressureUnit()
}
