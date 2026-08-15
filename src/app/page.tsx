'use client'

import ForecastPanel from '@/components/ForecastPanel'
import InstrumentMap from '@/components/InstrumentMap'
import LocationSearch from '@/components/LocationSearch'
import { useWeather } from '@/contexts/WeatherContext'
import { analytics } from '@/lib/analytics'
import { condCode,coordLine,dewPoint,EMPTY,readout,uvIndex,visibility } from '@/lib/instrument'
import { WeatherAPI } from '@/lib/weather-api'
import { ForecastData,Location,WeatherData } from '@/types/weather'
import { useEffect,useState } from 'react'

/** Map layers the app actually supports, labelled in the design's mono codes. */
const LAYERS=[
	{ id: 'radar',code: 'RADAR' },
	{ id: 'temperature',code: 'TEMP' },
	{ id: 'wind',code: 'WIND' },
	{ id: 'clouds',code: 'CLOUD' },
	{ id: 'pressure',code: 'QNH' },
	{ id: 'precipitation',code: 'PRECIP' },
]

export default function Home () {
	const {
		weatherData,
		forecastData,
		loading,
		error,
		addLocation,
		searchCities,
		clearError,
		units,
		currentLocation,
		locations,
		selectedLayer,
		setSelectedLayer,
		setUnits,
	}=useWeather()

	const weatherAPI=WeatherAPI.getInstance()

	const currentWeather=currentLocation? weatherData[ currentLocation.id ]:null
	const currentForecast=currentLocation? forecastData[ currentLocation.id ]:null

	// The 3-hourly series behind the HOURLY strip. The context only keeps the
	// daily roll-up, so the raw series is fetched here for the active location.
	const [ hourly,setHourly ]=useState<ForecastData[]>( [] )
	// Clock and date are rendered only after mount — they read the browser's
	// timezone, so emitting them during SSR would cause a hydration mismatch.
	const [ now,setNow ]=useState<Date|null>( null )

	useEffect( () => {
		setNow( new Date() )
		const tick=setInterval( () => setNow( new Date() ),30_000 )
		return () => clearInterval( tick )
	},[] )

	useEffect( () => {
		analytics.pageView( '/',{
			title: 'weather-dashboard',
			referrer: document.referrer,
			userId: "cmfombacy0001l204jdhysr04",
		} )
	},[ locations.length,currentLocation ] )

	useEffect( () => {
		let cancelled=false
		if ( !currentLocation ) {
			setHourly( [] )
			return
		}
		weatherAPI
			.get5DayForecast( currentLocation.lat,currentLocation.lon,units )
			.then( data => { if ( !cancelled ) setHourly( data.slice( 0,12 ) ) } )
			.catch( () => { if ( !cancelled ) setHourly( [] ) } )
		return () => { cancelled=true }
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},[ currentLocation?.id,units ] )

	const handleLocationSelect=async ( weather: WeatherData ) => {
		const location: Location={
			id: `location-${Date.now()}`,
			name: weather.name,
			country: weather.sys.country,
			state: weather.state,
			lat: weather.coord.lat,
			lon: weather.coord.lon,
		}

		try {
			await addLocation( location )
			analytics.track( 'location_added',{
				name: location.name,
				state: location.state,
				country: location.country
			} )
		} catch ( err ) {
			console.error( 'Error adding location:',err )
		}
	}

	const unitSuffix=units==='imperial'? '°F':'°C'
	const dew=currentWeather
		? dewPoint( currentWeather.main.temp,currentWeather.main.humidity,units )
		:null

	// Precipitation probability drives the hourly bar heights, so the tallest
	// bar in view is scaled to the full 44px track.
	const peakPop=Math.max( ...hourly.map( h => h.pop??0 ),0.01 )

	return (
		<div className="flex flex-col min-h-full">
			{/* Top bar */}
			<div className="flex flex-wrap items-center gap-4 px-[26px] py-4 border-b border-line">
				<LocationSearch
					onLocationSelect={handleLocationSelect}
					onSearch={searchCities}
					loading={loading}
				/>
				<div className="ml-auto flex items-center gap-[18px] font-mono text-[11px] text-mute">
					<span className={loading? 'text-mute':'text-accent'}>● {loading? 'SYNC':'LIVE'}</span>
					<span className="hidden sm:inline">
						{now
							? now.toLocaleString( 'en-GB',{
								day: '2-digit',month: 'short',year: 'numeric',
								hour: '2-digit',minute: '2-digit',hour12: false,
							} ).toUpperCase()
							:EMPTY}
					</span>
					<span className="flex gap-px">
						<button
							onClick={() => setUnits( 'imperial' )}
							className={`px-2.5 py-[5px] transition-colors ${units==='imperial'
								? 'bg-[var(--inv-bg)] text-[var(--inv-ink)]'
								:'border border-line hover:text-ink'}`}
						>
							F
						</button>
						<button
							onClick={() => setUnits( 'metric' )}
							className={`px-2.5 py-[5px] transition-colors ${units==='metric'
								? 'bg-[var(--inv-bg)] text-[var(--inv-ink)]'
								:'border border-line hover:text-ink'}`}
						>
							C
						</button>
					</span>
				</div>
			</div>

			{/* Advisory strip — carries the app's own error state */}
			{error&&(
				<div className="flex items-center gap-3.5 px-[26px] py-2.5 bg-[var(--alert-bg)] border-b border-[var(--alert-line)] font-mono text-xs tracking-[.04em] text-[var(--alert-ink)]">
					<span className="bg-accent text-[var(--accent-ink)] px-[7px] py-0.5 flex-shrink-0">
						ADVISORY
					</span>
					<span className="flex-1 min-w-0 truncate">{error.message?.toUpperCase()}</span>
					<button onClick={clearError} className="flex-shrink-0 hover:text-ink">✕</button>
				</div>
			)}

			{!currentWeather&&(
				<div className="px-[26px] py-16 font-mono text-[13px] text-mute">
					{/* A station is picked automatically once locations load, so "no
					    station" is only true when there are genuinely none — otherwise
					    the reading is simply still in flight. */}
					{currentLocation||loading||locations.length>0
						? 'ACQUIRING STATION DATA…'
						:'NO STATION SELECTED — SEARCH FOR A CITY ABOVE'}
				</div>
			)}

			{currentWeather&&(
				<>
					{/* Station / surface / sun */}
					<div className="grid grid-cols-1 lg:grid-cols-3 border-b border-line">
						<div className="p-[26px] border-b lg:border-b-0 lg:border-r border-line">
							<div className="font-mono text-[11px] tracking-[.14em] text-mute2">
								{currentWeather.sys.country} · {coordLine( currentWeather.coord.lat,currentWeather.coord.lon )}
							</div>
							<div className="text-[27px] font-medium mt-2.5">
								{currentWeather.name}
								{currentLocation?.state? `, ${currentLocation.state}`:''}
							</div>
							<div className="flex items-end gap-2.5 mt-[18px]">
								<span className="font-mono text-[96px] font-light leading-[.82] tracking-[-.04em]">
									{readout( currentWeather.main.temp )}
								</span>
								<span className="font-mono text-[22px] text-mute pb-2">{unitSuffix}</span>
							</div>
							<div className="mt-4 text-[15px] text-ink2 capitalize">
								{currentWeather.weather[ 0 ].description} · feels {readout( currentWeather.main.feels_like )}° · H {readout( currentWeather.main.temp_max )} L {readout( currentWeather.main.temp_min )}
							</div>
						</div>

						<div className="p-[26px] border-b lg:border-b-0 lg:border-r border-line">
							<div className="font-mono text-[11px] tracking-[.14em] text-mute2 mb-4">SURFACE</div>
							<div className="grid grid-cols-2 gap-x-3.5 gap-y-[18px] font-mono">
								<Readout
									label="WIND"
									value={`${readout( currentWeather.wind.speed )} ${weatherAPI.getWindDirection( currentWeather.wind.deg )}`}
								/>
								<Readout label="GUST" value={readout( currentWeather.wind.gust )} />
								<Readout label="RH" value={`${readout( currentWeather.main.humidity )}%`} />
								<Readout label="DWPT" value={readout( dew )} />
								<Readout label="QNH" value={readout( currentWeather.main.pressure )} />
								<Readout label="VIS" value={visibility( currentWeather.visibility,units )} />
							</div>
						</div>

						<div className="p-[26px]">
							<div className="font-mono text-[11px] tracking-[.14em] text-mute2 mb-4">SUN / SKY</div>
							<div className="flex flex-col gap-[13px] font-mono text-sm">
								<Row label="SUNRISE" value={weatherAPI.getTimeFromTimestamp( currentWeather.sys.sunrise )} />
								<Row label="SUNSET" value={weatherAPI.getTimeFromTimestamp( currentWeather.sys.sunset )} />
								<Row label="UV INDEX" value={uvIndex()} />
								<Row
									label="CLOUD"
									value={`${readout( currentWeather.clouds.all )}% ${condCode( currentWeather.weather[ 0 ] )}`}
									last
								/>
							</div>
						</div>
					</div>

					{/* Map + 7 day */}
					<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] border-b border-line">
						<div className="px-[26px] py-[22px] border-b lg:border-b-0 border-line min-w-0">
							<div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
								<div className="font-mono text-[11px] tracking-[.14em] text-mute2">
									{LAYERS.find( l => l.id===selectedLayer )?.code??'LAYER'} · LIVE TILES
								</div>
								<div className="flex flex-wrap gap-px font-mono text-[11px]">
									{LAYERS.map( layer => (
										<button
											key={layer.id}
											onClick={() => setSelectedLayer( layer.id )}
											className={`px-[11px] py-1.5 transition-colors ${selectedLayer===layer.id
												? 'bg-accent text-[var(--accent-ink)]'
												:'bg-panel border border-line text-mute hover:text-ink'}`}
										>
											{layer.code}
										</button>
									) )}
								</div>
							</div>
							<InstrumentMap height="300px" />
						</div>

						<div className="px-[22px] py-[22px] lg:border-l border-line">
							<ForecastPanel
								forecast={currentForecast||[]}
								loading={loading}
								units={units}
							/>
						</div>
					</div>

					{/* Hourly */}
					<div className="px-[26px] pt-5 pb-[26px]">
						<div className="font-mono text-[11px] tracking-[.14em] text-mute2 mb-3.5">
							HOURLY · 3H STEPS · TEMP / PRECIP PROBABILITY
						</div>
						{hourly.length===0? (
							<div className="font-mono text-[13px] text-mute2">NO HOURLY DATA</div>
						):(
							<div className="grid grid-cols-6 lg:grid-cols-12 gap-px font-mono">
								{hourly.map( slot => {
									const pop=slot.pop??0
									return (
										<div key={slot.dt} className="bg-panel px-2 py-3">
											<div className="text-[10px] text-mute">
												{new Date( slot.dt*1000 ).getHours().toString().padStart( 2,'0' )}
											</div>
											<div className="text-lg my-1.5">{readout( slot.main.temp )}</div>
											<div className="h-11 flex items-end" title={`${Math.round( pop*100 )}% precipitation probability`}>
												<span
													className={`w-full ${pop>=0.3? 'bg-accent':'bg-[var(--bar)]'}`}
													style={{ height: `${Math.max( 2,( pop/peakPop )*100 )}%` }}
												/>
											</div>
										</div>
									)
								} )}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}

/** Label-over-value pair used in the SURFACE grid. */
const Readout=( { label,value }: { label: string; value: string } ) => (
	<div>
		<div className="text-[11px] text-mute tracking-[.08em]">{label}</div>
		<div className="text-xl mt-1">{value}</div>
	</div>
)

/** Label/value line used in the SUN / SKY column. */
const Row=( { label,value,last=false }: { label: string; value: string; last?: boolean } ) => (
	<div className={`flex justify-between ${last? '':'border-b border-line2 pb-[9px]'}`}>
		<span className="text-mute">{label}</span>
		<span>{value}</span>
	</div>
)
