'use client'

import InstrumentMap,{ MAP_LAYERS as LAYERS } from '@/components/InstrumentMap'
import { useWeather } from '@/contexts/WeatherContext'
import { analytics } from '@/lib/analytics'
import { readout } from '@/lib/instrument'
import { useRouter } from 'next/navigation'
import { useEffect,useState } from 'react'

export default function MapPage () {
	const { locations,weatherData,selectedLayer,setSelectedLayer,currentLocation }=useWeather()
	const router=useRouter()
	const [ copied,setCopied ]=useState( false )

	useEffect( () => {
		analytics.pageView( '/map',{
			title: 'weather-map',
			referrer: 'weather-map',
			userId: "cmfombacy0001l204jdhysr04",
		} )
	},[ locations.length ] )

	const active=LAYERS.find( l => l.id===selectedLayer )??LAYERS[ 1 ]

	const shareView=async () => {
		try {
			await navigator.clipboard.writeText( window.location.href )
			setCopied( true )
			setTimeout( () => setCopied( false ),2000 )
		} catch {
			setCopied( false )
		}
	}

	return (
		<div className="flex flex-col min-h-full">
			<div className="flex flex-wrap items-center gap-4 px-[26px] py-4 border-b border-line">
				<div className="text-[17px] font-medium">{active.title}</div>
				<div className="font-mono text-[11px] text-mute2">
					MAPTILER WEATHER · {locations.length} MARKER{locations.length===1? '':'S'}
				</div>
				<div className="ml-auto flex items-center gap-3 font-mono text-[11px]">
					<button
						onClick={shareView}
						className="px-[11px] py-[7px] border border-line text-mute hover:text-ink transition-colors"
					>
						{copied? 'COPIED':'SHARE VIEW'}
					</button>
					<button
						onClick={() => router.push( '/map/fullscreen' )}
						className="px-[11px] py-[7px] bg-[var(--inv-bg)] text-[var(--inv-ink)]"
					>
						FULLSCREEN
					</button>
				</div>
			</div>

			<div className="relative">
				<InstrumentMap height="560px" className="border-0 border-b" />

				{/* Layer chips */}
				<div className="absolute top-[18px] left-[18px] flex flex-wrap gap-px font-mono text-[11px] z-10">
					{LAYERS.map( layer => (
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

				{/* Markers panel */}
				{locations.length>0&&(
					<div className="absolute top-[18px] right-[18px] w-[250px] bg-panel border border-line z-10 max-h-[calc(100%-36px)] overflow-y-auto">
						<div className="px-3.5 py-3 border-b border-line font-mono text-[10px] tracking-[.14em] text-mute2">
							MARKERS
						</div>
						<div className="flex flex-col">
							{locations.map( loc => {
								const temp=weatherData[ loc.id ]?.main.temp
								const isCurrent=currentLocation?.id===loc.id
								return (
									<div
										key={loc.id}
										className="flex justify-between px-3.5 py-2.5 border-b border-line2 last:border-b-0 font-mono text-xs"
									>
										<span className="truncate pr-2">{loc.name.toUpperCase()}</span>
										<span className={isCurrent? 'text-accent':'text-ink2'}>{readout( temp )}</span>
									</div>
								)
							} )}
						</div>
					</div>
				)}

				{/* Legend */}
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

			<div className="flex flex-wrap items-center gap-5 px-[26px] py-[18px] border-t border-line">
				<div className="font-mono text-[11px] text-mute">
					{active.code} · LIVE TILES
				</div>
				<div className="flex-1 min-w-[200px] flex flex-col gap-2">
					<div
						className="h-1"
						style={{ background: 'linear-gradient(90deg, var(--bar) 0 68%, var(--accent) 68% 70%, var(--line) 70%)' }}
					/>
					<div className="flex justify-between font-mono text-[10px] text-mute2">
						<span>-12H</span><span>-9H</span><span>-6H</span><span>-3H</span><span>NOW</span>
					</div>
				</div>
			</div>
		</div>
	)
}
