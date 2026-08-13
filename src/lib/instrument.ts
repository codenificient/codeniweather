/**
 * Helpers for the 1b "instrument panel" screens.
 *
 * The design reads like an aviation weather panel: bare mono numerals with the
 * unit carried once in a label, and METAR-style condition codes (SKC, BKN,
 * TSRA) instead of prose. These helpers do that translation.
 *
 * Anything that OpenWeatherMap does not actually return is reported as `EMPTY`
 * rather than guessed — see `uvIndex` below.
 */

/** What a readout shows when the upstream API has no value for it. */
export const EMPTY='—'

type WeatherLike={ id: number; main: string }

/**
 * METAR-ish sky/condition code for an OpenWeatherMap condition.
 *
 * OWM's numeric ids are grouped by hundreds (2xx thunderstorm, 3xx drizzle,
 * 5xx rain, 6xx snow, 7xx atmospheric, 800 clear, 80x cloud cover), which maps
 * onto the codes the design uses. Ids are checked before `main` because the
 * cloud-cover codes (FEW/SCT/BKN/OVC) are only distinguishable by id.
 */
export const condCode=( weather?: WeatherLike|null ): string => {
	if ( !weather ) return EMPTY
	const { id }=weather

	if ( id===800 ) return 'SKC'
	if ( id===801 ) return 'FEW'
	if ( id===802 ) return 'SCT'
	if ( id===803 ) return 'BKN'
	if ( id===804 ) return 'OVC'

	if ( id>=200&&id<300 ) return 'TSRA'
	if ( id>=300&&id<400 ) return 'DZ'
	if ( id>=500&&id<600 ) return 'RA'
	if ( id>=600&&id<700 ) return 'SN'

	// 7xx is a grab-bag of obscurations, each with its own code.
	switch ( id ) {
		case 701: return 'BR'
		case 711: return 'FU'
		case 721: return 'HZ'
		case 731: return 'PO'
		case 741: return 'FG'
		case 751: return 'SA'
		case 761: return 'DU'
		case 762: return 'VA'
		case 771: return 'SQ'
		case 781: return 'FC'
		default: return ( weather.main||EMPTY ).slice( 0,4 ).toUpperCase()
	}
}

/**
 * Dew point from temperature and relative humidity, via the Magnus-Tetens
 * approximation. This is a standard derivation rather than an invented figure:
 * OWM's free current-weather endpoint omits dew point, but temperature and RH
 * are enough to compute it to well within the precision the panel displays.
 *
 * `temp` is in whatever unit the app is currently showing; the result comes
 * back in that same unit.
 */
export const dewPoint=( temp: number,humidity: number,units: 'metric'|'imperial' ): number|null => {
	if ( !Number.isFinite( temp )||!Number.isFinite( humidity )||humidity<=0 ) return null

	const tempC=units==='imperial'? ( temp-32 )*5/9:temp
	const a=17.27
	const b=237.7
	const alpha=( a*tempC )/( b+tempC )+Math.log( humidity/100 )
	const dewC=( b*alpha )/( a-alpha )

	return units==='imperial'? dewC*9/5+32:dewC
}

/**
 * OWM's free `/weather` endpoint carries no UV index — that lives behind One
 * Call 3.0. The panel keeps the row so the layout matches the design, but
 * shows EMPTY rather than a fabricated number.
 */
export const uvIndex=(): string => EMPTY

/** Bare integer for a mono readout, or EMPTY when the value is missing. */
export const readout=( value: number|null|undefined,digits=0 ): string => {
	if ( value===null||value===undefined||!Number.isFinite( value ) ) return EMPTY
	return value.toFixed( digits )
}

/** `32.755N 97.331W` — the coordinate line above the city name. */
export const coordLine=( lat: number,lon: number ): string => {
	const ns=`${Math.abs( lat ).toFixed( 3 )}${lat>=0? 'N':'S'}`
	const ew=`${Math.abs( lon ).toFixed( 3 )}${lon>=0? 'E':'W'}`
	return `${ns} ${ew}`
}

/** Three-letter uppercase tag for the saved-cities list, e.g. "Fort Worth" -> FTW. */
export const cityTag=( name: string ): string => {
	const words=name.trim().split( /[\s-]+/ ).filter( Boolean )
	if ( words.length>=3 ) return words.slice( 0,3 ).map( w => w[ 0 ] ).join( '' ).toUpperCase()
	if ( words.length===2 ) return ( words[ 0 ][ 0 ]+words[ 1 ].slice( 0,2 ) ).toUpperCase()
	return ( words[ 0 ]??'' ).slice( 0,3 ).toUpperCase()
}

/** Visibility in the panel's units — statute miles imperial, kilometres metric. */
export const visibility=( metres: number|null|undefined,units: 'metric'|'imperial' ): string => {
	if ( metres===null||metres===undefined||!Number.isFinite( metres ) ) return EMPTY
	return units==='imperial'
		? `${( metres/1609.34 ).toFixed( 0 )} SM`
		: `${( metres/1000 ).toFixed( 0 )} KM`
}
