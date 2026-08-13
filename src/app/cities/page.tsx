'use client'

import LocationSearch from '@/components/LocationSearch'
import WeatherCard from '@/components/WeatherCard'
import { useWeather } from '@/contexts/WeatherContext'
import { analytics } from '@/lib/analytics'
import { GeolocationService } from '@/lib/geolocation'
import { cityTag,readout } from '@/lib/instrument'
import { Location,WeatherData } from '@/types/weather'
import { useEffect,useState } from 'react'

export default function CitiesPage () {
	const {
		locations,
		weatherData,
		loading,
		removeLocation,
		units,
		setCurrentLocation,
		currentLocation,
		addLocation,
		searchCities,
		refreshAllWeather,
	}=useWeather()

	const [ locating,setLocating ]=useState( false )
	const [ locateError,setLocateError ]=useState<string|null>( null )

	useEffect( () => {
		analytics.pageView( '/cities',{
			title: 'cities-list',
			referrer: 'cities-list',
			userId: "cmfombacy0001l204jdhysr04"
		} )
	},[ locations.length,currentLocation ] )

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
			analytics.track( 'location_added',{ name: location.name,country: location.country } )
		} catch ( err ) {
			console.error( 'Error adding location:',err )
		}
	}

	const handleUseMyLocation=async () => {
		setLocating( true )
		setLocateError( null )
		try {
			const location=await GeolocationService.getCurrentPosition()
			await addLocation( location )
			analytics.track( 'location_added',{ name: location.name,source: 'geolocation' } )
		} catch ( err ) {
			setLocateError( err instanceof Error? err.message:'Could not determine your location' )
		} finally {
			setLocating( false )
		}
	}

	// The ranked strip is sorted hottest-first and each bar is scaled against the
	// warmest city in view, so the comparison stays readable whatever the range.
	const ranked=locations
		.map( loc => ( { loc,temp: weatherData[ loc.id ]?.main.temp } ) )
		.filter( ( r ): r is { loc: Location; temp: number } => typeof r.temp==='number' )
		.sort( ( a,b ) => b.temp-a.temp )
	const hottest=ranked.length>0? Math.max( ...ranked.map( r => r.temp ),1 ):1
	const coldest=ranked.length>0? Math.min( ...ranked.map( r => r.temp ) ):0
	const span=Math.max( hottest-coldest,1 )

	return (
		<div className="flex flex-col min-h-full">
			<div className="flex flex-wrap items-center gap-4 px-[26px] py-4 border-b border-line">
				<div className="text-[17px] font-medium">Cities</div>
				<div className="font-mono text-[11px] text-mute2">
					{locations.length} SAVED
					{currentLocation? ` · CURRENT ${cityTag( currentLocation.name )}`:''}
				</div>
				<div className="ml-auto flex flex-wrap items-center gap-3.5">
					<div className="w-[300px]">
						<LocationSearch
							onLocationSelect={handleLocationSelect}
							onSearch={searchCities}
							loading={loading}
						/>
					</div>
					<button
						onClick={() => refreshAllWeather()}
						disabled={loading}
						className="font-mono text-[11px] px-[13px] py-2 bg-[var(--inv-bg)] text-[var(--inv-ink)] disabled:opacity-50 transition-opacity"
					>
						{loading? 'REFRESHING…':'REFRESH ALL'}
					</button>
				</div>
			</div>

			{locations.length>0? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border-b border-line">
					{locations.map( location => {
						const weather=weatherData[ location.id ]
						const isCurrent=currentLocation?.id===location.id

						if ( !weather ) {
							return (
								<div
									key={location.id}
									className={`bg-bg px-6 py-[22px] border-l-2 ${isCurrent? 'border-accent':'border-transparent'}`}
								>
									<div className="font-mono text-[10px] tracking-[.14em] text-mute2">
										{cityTag( location.name )}
									</div>
									<div className="text-[19px] font-medium mt-[7px]">{location.name}</div>
									<div className="text-[13px] text-mute mt-[3px]">
										{[ location.state,location.country ].filter( Boolean ).join( ', ' )}
									</div>
									<div className="font-mono text-[11px] text-mute2 mt-5">ACQUIRING…</div>
								</div>
							)
						}

						return (
							<WeatherCard
								key={location.id}
								weather={weather}
								location={location}
								isCurrentLocation={isCurrent}
								onRemove={() => removeLocation( location.id )}
								onSetCurrent={() => setCurrentLocation( location )}
								units={units}
							/>
						)
					} )}
				</div>
			):(
				<div className="px-[26px] py-16 font-mono text-[13px] text-mute">
					NO CITIES SAVED — ADD ONE ABOVE OR USE YOUR LOCATION
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-[26px] px-[26px] pt-5 pb-[26px]">
				<div>
					<div className="font-mono text-[11px] tracking-[.14em] text-mute2 mb-3">
						ADD A CITY
					</div>
					<div className="border border-dashed border-line p-5 flex flex-wrap items-center justify-between gap-3">
						<span className="text-sm text-mute">
							Search by name above, or add wherever you are now
						</span>
						<button
							onClick={handleUseMyLocation}
							disabled={locating}
							className="font-mono text-[11px] text-accent hover:underline disabled:opacity-50"
						>
							{locating? 'LOCATING…':'USE MY LOCATION'}
						</button>
					</div>
					{locateError&&(
						<div className="font-mono text-[11px] text-[var(--alert-ink)] bg-[var(--alert-bg)] border border-[var(--alert-line)] px-3 py-2 mt-2">
							{locateError.toUpperCase()}
						</div>
					)}
				</div>

				<div>
					<div className="font-mono text-[11px] tracking-[.14em] text-mute2 mb-3">
						RANKED BY TEMPERATURE
					</div>
					{ranked.length===0? (
						<div className="font-mono text-xs text-mute2">NO READINGS YET</div>
					):(
						<div className="flex flex-col gap-[7px] font-mono text-xs">
							{ranked.map( ( { loc,temp },index ) => (
								<div
									key={loc.id}
									className="grid grid-cols-[64px_1fr_34px] gap-2.5 items-center"
								>
									<span className={currentLocation?.id===loc.id? 'text-ink':'text-mute'}>
										{cityTag( loc.name )}
									</span>
									<span className="h-2 bg-line2 block">
										<span
											className={`block h-full ${index<2? 'bg-accent':'bg-[var(--bar)]'}`}
											style={{ width: `${Math.max( 6,( ( temp-coldest )/span )*100 )}%` }}
										/>
									</span>
									<span className="text-right">{readout( temp )}</span>
								</div>
							) )}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
