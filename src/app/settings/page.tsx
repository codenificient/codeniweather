'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useWeather } from '@/contexts/WeatherContext'
import { analytics } from '@/lib/analytics'
import { EMPTY } from '@/lib/instrument'
import { useEffect,useState } from 'react'

/**
 * 1b settings panel.
 *
 * The design lays out six panels; this builds the ones the app can actually
 * honour — appearance, units, privacy and data sources. Accent choice, density,
 * a separate wind unit, 12/24h clock, geolocation accuracy, refresh interval
 * and the whole alerts group have nothing behind them, and rendering dead
 * switches would misrepresent what the app does. They come back when the
 * features do.
 */
export default function SettingsPage () {
	const { theme,toggleTheme }=useTheme()
	const { units,setUnits,locations }=useWeather()
	const [ storedKeys,setStoredKeys ]=useState<number|null>( null )

	useEffect( () => {
		analytics.pageView( '/settings',{
			title: 'settings',
			referrer: 'settings',
			userId: "cmfombacy0001l204jdhysr04",
		} )
	},[] )

	useEffect( () => {
		setStoredKeys(
			Object.keys( localStorage ).filter( k => k.startsWith( 'codeniweather-' )||k==='theme' ).length
		)
	},[ locations.length,units,theme ] )

	const clearStored=() => {
		Object.keys( localStorage )
			.filter( k => k.startsWith( 'codeniweather-' )||k==='theme' )
			.forEach( k => localStorage.removeItem( k ) )
		window.location.href='/'
	}

	const analyticsOn=process.env.NEXT_PUBLIC_ANALYTICS_ENABLED==='true'

	return (
		<div className="flex flex-col min-h-full">
			<div className="flex flex-wrap items-center gap-4 px-[26px] py-4 border-b border-line">
				<div className="text-[17px] font-medium">Settings</div>
				<div className="ml-auto font-mono text-[11px] text-mute2">SAVED LOCALLY · NO ACCOUNT</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 border-b border-line">
				<Panel title="APPEARANCE" className="lg:border-r border-line">
					<Row label="Dark mode" hint="Applies to every panel and the basemap">
						<button
							onClick={toggleTheme}
							role="switch"
							aria-checked={theme==='dark'}
							aria-label={`Switch to ${theme==='dark'? 'light':'dark'} mode`}
							className="relative w-[46px] h-6 inline-block transition-colors"
							style={{ background: theme==='dark'? 'var(--accent)':'var(--track)' }}
						>
							<span
								className="absolute top-0.5 w-5 h-5 transition-all"
								style={{
									left: theme==='dark'? '24px':'2px',
									background: theme==='dark'? 'var(--accent-ink)':'var(--bg)',
								}}
							/>
						</button>
					</Row>
				</Panel>

				<Panel title="UNITS">
					<Row label="Temperature" hint="Applies to every panel">
						<Segmented
							options={[ { id: 'imperial',label: '°F' },{ id: 'metric',label: '°C' } ]}
							value={units}
							onChange={id => setUnits( id as 'metric'|'imperial' )}
						/>
					</Row>
					<Row label="Wind" hint="Follows the temperature unit" last>
						<span className="font-mono text-[13px] border border-line px-[11px] py-1.5 text-mute">
							{units==='imperial'? 'MPH':'M/S'}
						</span>
					</Row>
				</Panel>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2">
				<Panel title="PRIVACY" className="lg:border-r border-line">
					<Row label="Usage analytics" hint="Self-hosted, no third parties">
						<span className="font-mono text-[11px] border border-line px-[11px] py-1.5 text-mute">
							{analyticsOn? 'ENABLED':'DISABLED'}
						</span>
					</Row>
					<Row
						label="Stored data"
						hint={`${locations.length} ${locations.length===1? 'city':'cities'} and your preferences, in this browser only`}
						last
					>
						<button
							onClick={clearStored}
							className="font-mono text-[11px] border border-line text-accent px-[11px] py-1.5 hover:underline"
						>
							CLEAR ALL
						</button>
					</Row>
				</Panel>

				<Panel title="DATA SOURCES">
					<div className="flex flex-col font-mono text-[13px]">
						<Source label="CONDITIONS" value="OPENWEATHER" />
						<Source label="BASEMAP" value="MAPTILER" />
						<Source label="WEATHER LAYERS" value="MAPTILER WEATHER" />
						<Source label="GEOCODING" value="MAPTILER" />
						<Source
							label="STORED KEYS"
							value={storedKeys===null? EMPTY:String( storedKeys )}
							last
						/>
					</div>
				</Panel>
			</div>
		</div>
	)
}

const Panel=( { title,className='',children }: { title: string; className?: string; children: React.ReactNode } ) => (
	<div className={`p-[26px] border-b lg:border-b-0 border-line ${className}`}>
		<div className="font-mono text-[11px] tracking-[.14em] text-mute2 mb-[18px]">{title}</div>
		{children}
	</div>
)

const Row=( {
	label,hint,last=false,children,
}: { label: string; hint: string; last?: boolean; children: React.ReactNode } ) => (
	<div className={`flex items-center justify-between gap-4 py-3.5 ${last? '':'border-b border-line2'}`}>
		<div className="min-w-0">
			<div className="text-[15px]">{label}</div>
			<div className="text-[13px] text-mute mt-[3px]">{hint}</div>
		</div>
		<div className="flex-shrink-0">{children}</div>
	</div>
)

const Segmented=( {
	options,value,onChange,
}: { options: { id: string; label: string }[]; value: string; onChange: ( id: string ) => void } ) => (
	<div className="flex gap-px font-mono text-[11px]">
		{options.map( opt => (
			<button
				key={opt.id}
				onClick={() => onChange( opt.id )}
				className={`px-[11px] py-1.5 transition-colors ${value===opt.id
					? 'bg-[var(--inv-bg)] text-[var(--inv-ink)]'
					:'border border-line text-mute hover:text-ink'}`}
			>
				{opt.label}
			</button>
		) )}
	</div>
)

const Source=( { label,value,last=false }: { label: string; value: string; last?: boolean } ) => (
	<div className={`flex justify-between py-2.5 ${last? '':'border-b border-line2'}`}>
		<span className="text-mute">{label}</span>
		<span>{value}</span>
	</div>
)
