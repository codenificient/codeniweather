'use client'

import InstrumentMap,{ MAP_LAYERS } from '@/components/InstrumentMap'
import { useWeather } from '@/contexts/WeatherContext'
import { analytics } from '@/lib/analytics'
import { readout } from '@/lib/instrument'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Fullscreen variant of screen 2d: the same instrument chrome, but the map
 * takes the whole viewport and the view frames every saved city rather than
 * centring on the current one.
 */
export default function FullscreenMapPage () {
	const router=useRouter()
	const { locations,weatherData,currentLocation,selectedLayer,setSelectedLayer }=useWeather()

	const active=MAP_LAYERS.find( l => l.id===selectedLayer )??MAP_LAYERS[ 1 ]

	useEffect( () => {
		const onKey=( event: KeyboardEvent ) => {
			if ( event.key==='Escape' ) router.push( '/map' )
		}
		document.addEventListener( 'keydown',onKey )
		return () => document.removeEventListener( 'keydown',onKey )
	},[ router ] )

	useEffect( () => {
		analytics.pageView( '/map/fullscreen',{
			title: 'weather-map-fullscreen',
			referrer: 'weather-map-fullscreen',
			userId: "cmfombacy0001l204jdhysr04",
			locationsCount: locations.length,
			selectedLayer,
		} )
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},[ locations.length ] )

	return (
		<div className="fixed inset-0 z-50 bg-bg text-ink flex flex-col overflow-hidden">
			<div className="flex flex-wrap items-center gap-4 px-[26px] py-4 border-b border-line flex-shrink-0">
				<div className="text-[17px] font-medium">{active.title}</div>
				<div className="font-mono text-[11px] text-mute2 hidden sm:block">
					MAPTILER WEATHER · {locations.length} MARKER{locations.length===1? '':'S'} · FULLSCREEN
				</div>
				<div className="ml-auto flex items-center gap-3 font-mono text-[11px]">
					<span className="text-mute2 hidden md:inline">ESC TO EXIT</span>
					<button
						onClick={() => router.push( '/map' )}
						className="px-[11px] py-[7px] border border-line text-mute hover:text-ink transition-colors"
					>
						← MAP
					</button>
				</div>
			</div>

			<div className="relative flex-1 min-h-0">
				<InstrumentMap height="100%" className="border-0" fitAll />

				<div className="absolute top-[18px] left-[18px] flex flex-wrap gap-px font-mono text-[11px] z-10">
					{MAP_LAYERS.map( layer => (
						<button
							key={layer.id}
							onClick={() => setSelectedLayer( layer.id )}
							className={`px-3 py-[7px] transition-colors ${selectedLayer===layer.id
								? 'bg-accent text-[var(--accent-ink)]'
								:'bg-panel border border-line text-mute hover:text-ink'}`}
						>
							{layer.code}
						</button>
					) )}
				</div>

				{locations.length>0&&(
					<div className="absolute top-[18px] right-[18px] w-[250px] bg-panel border border-line z-10 max-h-[calc(100%-36px)] overflow-y-auto">
						<div className="px-3.5 py-3 border-b border-line font-mono text-[10px] tracking-[.14em] text-mute2">
							MARKERS
						</div>
						{locations.map( loc => (
							<div
								key={loc.id}
								className="flex justify-between px-3.5 py-2.5 border-b border-line2 last:border-b-0 font-mono text-xs"
							>
								<span className="truncate pr-2">{loc.name.toUpperCase()}</span>
								<span className={currentLocation?.id===loc.id? 'text-accent':'text-ink2'}>
									{readout( weatherData[ loc.id ]?.main.temp )}
								</span>
							</div>
						) )}
					</div>
				)}

				<div className="absolute bottom-[18px] left-[18px] bg-panel border border-line px-3.5 py-3 z-10">
					<div className="font-mono text-[10px] tracking-[.14em] text-mute2 mb-2.5">
						{active.legend}
					</div>
					<div
						className="w-[260px] max-w-[50vw] h-2.5"
						style={{ background: 'linear-gradient(90deg, #2b4a7a, #3f8fb0, #6fb98a, #dfc75a, #d9603f, #8d2f22)' }}
					/>
					<div className="flex justify-between mt-1.5 font-mono text-[10px] text-mute">
						<span>LIGHT</span><span>MODERATE</span><span>HEAVY</span>
					</div>
				</div>

				<div className="absolute bottom-[18px] right-[18px] font-mono text-[10px] text-mute bg-bg border border-line px-2.5 py-[5px] z-10">
					© MapTiler © OpenStreetMap
				</div>
			</div>
		</div>
	)
}
