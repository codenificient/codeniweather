'use client'

import InstrumentMap from '@/components/InstrumentMap'
import { useWeather } from '@/contexts/WeatherContext'
import { analytics } from '@/lib/analytics'
import { condCode,coordLine,dewPoint,EMPTY,readout,uvIndex,visibility } from '@/lib/instrument'
import { WeatherAPI } from '@/lib/weather-api'
import { DailyForecast,ForecastData,Location,WeatherData } from '@/types/weather'
import { useParams,useRouter } from 'next/navigation'
import { useEffect,useState } from 'react'

export default function CityDetailPage () {
	const params=useParams()
	const router=useRouter()
	const { locations,units,setCurrentLocation,currentLocation,removeLocation }=useWeather()

	const [ weather,setWeather ]=useState<WeatherData|null>( null )
	const [ location,setLocation ]=useState<Location|null>( null )
	const [ hourly,setHourly ]=useState<ForecastData[]>( [] )
	const [ daily,setDaily ]=useState<DailyForecast[]>( [] )
	const [ loading,setLoading ]=useState( true )
	const [ error,setError ]=useState<string|null>( null )

	const weatherAPI=WeatherAPI.getInstance()

	useEffect( () => {
		let cancelled=false

		const load=async () => {
			setLoading( true )
			setError( null )
			try {
				// Prefer the context; fall back to storage so a deep link still
				// resolves before the provider has rehydrated.
				let found=locations.find( loc => loc.id===params.id )??null
				if ( !found ) {
					const saved=JSON.parse( localStorage.getItem( 'codeniweather-locations' )||'[]' )
					const current=JSON.parse( localStorage.getItem( 'codeniweather-current-location' )||'null' )
					found=[ ...saved,...( current? [ current ]:[] ) ]
						.find( ( loc: Location ) => loc.id===params.id )??null
				}

				if ( !found ) {
					if ( !cancelled ) setError( 'City not found' )
					return
				}
				if ( cancelled ) return
				setLocation( found )

				const [ current,forecast ]=await Promise.all( [
					weatherAPI.getCurrentWeather( found.lat,found.lon,units ),
					weatherAPI.get5DayForecast( found.lat,found.lon,units ),
				] )

				if ( cancelled ) return
				setWeather( current )
				setHourly( forecast.slice( 0,12 ) )
				setDaily( weatherAPI.processForecastData( forecast ) )
			} catch ( err ) {
				if ( !cancelled ) setError( err instanceof Error? err.message:'Could not load this city' )
			} finally {
				if ( !cancelled ) setLoading( false )
			}
		}

		if ( params.id ) load()
		return () => { cancelled=true }
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},[ params.id,units,locations.length ] )

	useEffect( () => {
		analytics.pageView( `/city/${params.id}`,{
			title: 'city-detail',
			referrer: 'cities',
			userId: "cmfombacy0001l204jdhysr04",
		} )
	},[ location?.name,params.id ] )

	if ( loading ) {
		return (
			<div className="px-[30px] py-16 font-mono text-[13px] text-mute">ACQUIRING STATION DATA…</div>
		)
	}

	if ( error||!weather||!location ) {
		return (
			<div className="px-[30px] py-16">
				<div className="font-mono text-[13px] text-mute mb-4">
					{( error??'City not found' ).toUpperCase()}
				</div>
				<button
					onClick={() => router.push( '/cities' )}
					className="font-mono text-[11px] border border-line px-[11px] py-[7px] text-mute hover:text-ink"
				>
					← CITIES
				</button>
			</div>
		)
	}

	const isCurrent=currentLocation?.id===location.id
	const dew=dewPoint( weather.main.temp,weather.main.humidity,units )
	const peakPop=Math.max( ...hourly.map( h => h.pop??0 ),0.01 )
	const tempUnit=units==='imperial'? '°F':'°C'
	const speedUnit=units==='imperial'? 'mph':'m/s'
	const depthUnit=units==='imperial'? 'IN':'MM'

	/** Daily precipitation total, converted for imperial. */
	const precip=( day: DailyForecast ): string => {
		const mm=( day.rain??0 )+( day.snow??0 )
		if ( mm<=0 ) return EMPTY
		return units==='imperial'
			? `${( mm/25.4 ).toFixed( 2 )} ${depthUnit}`
			:`${mm.toFixed( 1 )} ${depthUnit}`
	}

	return (
		<div className="flex flex-col min-h-full">
			{/* Header */}
			<div className="flex flex-wrap items-center gap-5 px-[30px] py-4 border-b border-line">
				<button
					onClick={() => router.push( '/cities' )}
					className="font-mono text-[11px] border border-line px-[11px] py-[7px] text-mute hover:text-ink transition-colors"
				>
					← CITIES
				</button>
				<div className="min-w-0">
					<div className="text-xl font-medium truncate">
						{location.name}{location.state? `, ${location.state}`:''}
					</div>
					<div className="font-mono text-[11px] text-mute2 mt-[3px]">
						{weather.sys.country} · {coordLine( weather.coord.lat,weather.coord.lon )} · UPDATED{' '}
						{weatherAPI.getTimeFromTimestamp( weather.dt )}
					</div>
				</div>
				<div className="ml-auto flex items-center gap-3 font-mono text-[11px]">
					<button
						onClick={() => setCurrentLocation( location )}
						disabled={isCurrent}
						className={`px-[11px] py-[7px] border border-line transition-colors ${isCurrent
							? 'text-accent cursor-default'
							:'text-mute hover:text-ink'}`}
					>
						{isCurrent? 'CURRENT':'SET AS CURRENT'}
					</button>
					<button
						onClick={() => { removeLocation( location.id ); router.push( '/cities' ) }}
						className="px-[11px] py-[7px] border border-line text-accent hover:underline"
					>
						REMOVE
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-2">
				{/* Left: headline, hourly, map */}
				<div className="p-[30px] border-b xl:border-b-0 xl:border-r border-line min-w-0">
					<div className="flex flex-wrap items-end gap-3">
						<span className="font-mono text-[104px] font-light leading-[.82] tracking-[-.04em]">
							{readout( weather.main.temp )}
						</span>
						<span className="font-mono text-[22px] text-mute pb-2.5">{tempUnit}</span>
						<div className="pb-3 ml-3.5">
							<div className="text-[17px] capitalize">{weather.weather[ 0 ].description}</div>
							<div className="text-sm text-mute mt-1">
								Feels {readout( weather.main.feels_like )}° · H {readout( weather.main.temp_max )} L {readout( weather.main.temp_min )}
							</div>
						</div>
					</div>

					{hourly.length>0&&(
						<div className="grid grid-cols-6 sm:grid-cols-12 gap-px mt-[30px] font-mono">
							{hourly.map( slot => {
								const pop=slot.pop??0
								return (
									<div key={slot.dt} className="bg-panel px-1.5 py-2.5">
										<div className="text-[10px] text-mute">
											{new Date( slot.dt*1000 ).getHours().toString().padStart( 2,'0' )}
										</div>
										<div className="text-[15px] my-[5px]">{readout( slot.main.temp )}</div>
										<div className="h-[34px] flex items-end" title={`${Math.round( pop*100 )}% precipitation probability`}>
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

					<div className="mt-[26px]">
						<InstrumentMap height="210px" />
					</div>
				</div>

				{/* Right: readout panels */}
				<div className="min-w-0">
					<div className="grid grid-cols-1 sm:grid-cols-2 border-b border-line">
						<Panel title="TEMPERATURE" className="sm:border-r border-line">
							<Line label="CURRENT" value={`${readout( weather.main.temp )}${tempUnit}`} />
							<Line label="FEELS LIKE" value={`${readout( weather.main.feels_like )}${tempUnit}`} />
							<Line label="MIN" value={`${readout( weather.main.temp_min )}${tempUnit}`} />
							<Line label="MAX" value={`${readout( weather.main.temp_max )}${tempUnit}`} last />
						</Panel>
						<Panel title="WIND">
							<Line label="SPEED" value={`${readout( weather.wind.speed,1 )} ${speedUnit}`} />
							<Line label="DIRECTION" value={weatherAPI.getWindDirection( weather.wind.deg )} />
							<Line label="DEGREES" value={`${readout( weather.wind.deg )}°`} />
							<Line
								label="GUST"
								value={weather.wind.gust!==undefined? `${readout( weather.wind.gust,1 )} ${speedUnit}`:EMPTY}
								last
							/>
						</Panel>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 border-b border-line">
						<Panel title="MOISTURE" className="sm:border-r border-line">
							<Line label="HUMIDITY" value={`${readout( weather.main.humidity )}%`} />
							<Line label="DEW POINT" value={dew!==null? `${readout( dew )}${tempUnit}`:EMPTY} />
							<Line label="PRESSURE" value={`${readout( weather.main.pressure )} hPa`} />
							<Line label="CLOUDS" value={`${readout( weather.clouds.all )}%`} last />
						</Panel>
						<Panel title="SUN / VISIBILITY">
							<Line label="SUNRISE" value={weatherAPI.getTimeFromTimestamp( weather.sys.sunrise )} />
							<Line label="SUNSET" value={weatherAPI.getTimeFromTimestamp( weather.sys.sunset )} />
							<Line label="VISIBILITY" value={visibility( weather.visibility,units )} />
							<Line label="UV INDEX" value={uvIndex()} last />
						</Panel>
					</div>

					<div className="px-[26px] py-6">
						<div className="font-mono text-[11px] tracking-[.14em] text-mute2 mb-3.5">7 DAY</div>
						{daily.length===0? (
							<div className="font-mono text-[13px] text-mute2">NO FORECAST</div>
						):(
							<div className="flex flex-col font-mono text-[13px]">
								{daily.slice( 0,7 ).map( ( day,index ) => (
									<div
										key={day.date}
										className="grid grid-cols-[46px_1fr_84px_66px] gap-2.5 py-2.5 border-b border-line2 last:border-b-0"
									>
										<span>{index===0? 'TODAY':day.dayOfWeek.slice( 0,3 ).toUpperCase()}</span>
										<span className="text-mute">{condCode( day.weather )}</span>
										<span className="text-mute">{precip( day )}</span>
										<span className="text-right">
											<span className="text-mute2">{readout( day.temp_min )}</span>{' '}
											{readout( day.temp_max )}
										</span>
									</div>
								) )}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

const Panel=( { title,className='',children }: { title: string; className?: string; children: React.ReactNode } ) => (
	<div className={`px-[26px] py-6 ${className}`}>
		<div className="font-mono text-[11px] tracking-[.14em] text-mute2 mb-3.5">{title}</div>
		<div className="flex flex-col font-mono text-[13px]">{children}</div>
	</div>
)

const Line=( { label,value,last=false }: { label: string; value: string; last?: boolean } ) => (
	<div className={`flex justify-between py-2 ${last? '':'border-b border-line2'}`}>
		<span className="text-mute">{label}</span>
		<span>{value}</span>
	</div>
)
