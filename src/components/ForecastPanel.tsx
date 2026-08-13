'use client'

import { condCode,readout } from '@/lib/instrument'
import { convertTemperature } from '@/lib/unit-conversion'
import { DailyForecast } from '@/types/weather'
import React from 'react'

interface ForecastPanelProps {
	forecast: DailyForecast[]
	loading?: boolean
	units?: 'metric'|'imperial'
}

/**
 * 1b "7 DAY" column: day tag, condition code, then low/high right-aligned.
 * Everything is mono so the temperature columns line up down the list.
 */
const ForecastPanel: React.FC<ForecastPanelProps>=( {
	forecast,
	loading=false,
	units='metric',
} ) => {
	const rows=forecast.slice( 0,7 )

	return (
		<div>
			<div className="font-mono text-[11px] tracking-[.14em] text-mute2 mb-3.5">
				7 DAY
			</div>

			{loading&&rows.length===0&&(
				<div className="flex flex-col font-mono text-[13px]">
					{[ ...Array( 7 ) ].map( ( _,i ) => (
						<div
							key={i}
							className="grid grid-cols-[40px_1fr_62px] gap-2 py-2.5 border-b border-line2 last:border-b-0"
						>
							<span className="text-mute2">···</span>
							<span className="text-mute2">···</span>
							<span className="text-right text-mute2">··</span>
						</div>
					) )}
				</div>
			)}

			{!loading&&rows.length===0&&(
				<div className="font-mono text-[13px] text-mute2">NO FORECAST</div>
			)}

			{rows.length>0&&(
				<div className="flex flex-col font-mono text-[13px]">
					{rows.map( ( day,index ) => (
						<div
							key={day.date}
							className="grid grid-cols-[40px_1fr_62px] gap-2 py-2.5 border-b border-line2 last:border-b-0"
						>
							<span>{index===0? 'TODAY':day.dayOfWeek.slice( 0,3 ).toUpperCase()}</span>
							<span className="text-mute">{condCode( day.weather )}</span>
							<span className="text-right">
								<span className="text-mute2">
									{readout( convertTemperature( day.temp_min,units ) )}
								</span>{' '}
								{readout( convertTemperature( day.temp_max,units ) )}
							</span>
						</div>
					) )}
				</div>
			)}
		</div>
	)
}

export default ForecastPanel
