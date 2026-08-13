'use client'

import { analytics } from '@/lib/analytics'
import { cityTag,condCode,readout } from '@/lib/instrument'
import { WeatherAPI } from '@/lib/weather-api'
import { Location,WeatherData } from '@/types/weather'
import { useRouter } from 'next/navigation'
import React from 'react'

interface WeatherCardProps {
	weather: WeatherData
	location: Location
	onRemove?: () => void
	onSetCurrent?: () => void
	isCurrentLocation?: boolean
	units?: 'metric'|'imperial'
}

/**
 * 1b city tile. Selecting the tile makes the city current — the temperature
 * column and the four readouts below it line up across the grid because
 * everything numeric is mono.
 */
const WeatherCard: React.FC<WeatherCardProps>=( {
	weather,
	location,
	onRemove,
	onSetCurrent,
	isCurrentLocation=false,
	units='metric',
} ) => {
	const weatherAPI=WeatherAPI.getInstance()
	const router=useRouter()

	const handleCardClick=() => {
		if ( onSetCurrent ) {
			onSetCurrent()
			analytics.trackUserAction( 'set-current-location',{
				locationId: location.id,
				locationName: location.name,
				page: 'cities'
			} )
		} else {
			router.push( `/city/${location.id}` )
			analytics.trackNavigation( 'cities',`city-details-${location.id}` )
		}
	}

	const tag=cityTag( location.name )
	const region=[ location.state,location.country ].filter( Boolean ).join( ', ' )

	return (
		<div
			onClick={handleCardClick}
			role="button"
			tabIndex={0}
			onKeyDown={e => { if ( e.key==='Enter'||e.key===' ' ) { e.preventDefault(); handleCardClick() } }}
			className={`group relative bg-bg px-6 py-[22px] cursor-pointer transition-colors hover:bg-panel2
				border-l-2 ${isCurrentLocation? 'border-accent':'border-transparent'}`}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<div
						className={`font-mono text-[10px] tracking-[.14em] ${isCurrentLocation? 'text-accent':'text-mute2'}`}
					>
						{isCurrentLocation? `CURRENT · ${tag}`:tag}
					</div>
					<div className="text-[19px] font-medium mt-[7px] truncate">{location.name}</div>
					<div className="text-[13px] text-mute mt-[3px] truncate">{region}</div>
				</div>
				<div className="text-right font-mono flex-shrink-0">
					<div className="text-[40px] font-light leading-none">
						{readout( weather.main.temp )}
					</div>
					<div className="text-[11px] text-mute mt-1.5">
						{readout( weather.main.temp_min )} / {readout( weather.main.temp_max )}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-4 gap-2.5 mt-5 font-mono">
				<Cell label="SKY" value={condCode( weather.weather[ 0 ] )} />
				<Cell label="RH" value={`${readout( weather.main.humidity )}%`} />
				<Cell label="WIND" value={readout( weather.wind.speed )} />
				<Cell label="QNH" value={readout( weather.main.pressure )} />
			</div>

			{onRemove&&(
				<button
					onClick={e => {
						e.stopPropagation()
						onRemove()
						analytics.trackUserAction( 'remove-location',{
							locationId: location.id,
							locationName: location.name,
							page: 'cities'
						} )
					}}
					title={`Remove ${location.name}`}
					className="absolute top-4 right-4 font-mono text-[11px] text-mute2 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-accent transition-opacity"
				>
					✕
				</button>
			)}

			<span className="sr-only">
				{weather.weather[ 0 ].description}, wind {weatherAPI.getWindDirection( weather.wind.deg )}
			</span>
		</div>
	)
}

const Cell=( { label,value }: { label: string; value: string } ) => (
	<div>
		<div className="text-[10px] text-mute2">{label}</div>
		<div className="text-sm mt-1">{value}</div>
	</div>
)

export default WeatherCard
