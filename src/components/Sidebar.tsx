'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { useWeather } from '@/contexts/WeatherContext'
import { cityTag,readout } from '@/lib/instrument'
import { usePathname,useRouter } from 'next/navigation'
import React,{ useEffect,useState } from 'react'

interface SidebarProps {
	isOpen: boolean
	onToggle: () => void
}

const NAV=[
	{ label: 'Now',path: '/' },
	{ label: 'Cities',path: '/cities' },
	{ label: 'Radar map',path: '/map' },
	{ label: 'Settings',path: '/settings' },
]

/**
 * The 1b navigation rail. Saved cities are listed as three-letter tags with a
 * bare temperature, which is what makes the rail read as an instrument panel
 * rather than a nav menu.
 */
const Sidebar: React.FC<SidebarProps>=( { isOpen,onToggle } ) => {
	const router=useRouter()
	const pathname=usePathname()
	const { locations,weatherData,currentLocation,units }=useWeather()
	const { theme,setTheme }=useTheme()

	// The sync clock is rendered only after mount: it is derived from the
	// browser's locale and timezone, so rendering it during SSR would produce a
	// hydration mismatch.
	const [ syncedAt,setSyncedAt ]=useState<string|null>( null )
	const latestDt=locations
		.map( loc => weatherData[ loc.id ]?.dt )
		.filter( ( dt ): dt is number => typeof dt==='number' )
		.sort( ( a,b ) => b-a )[ 0 ]

	useEffect( () => {
		if ( !latestDt ) {
			setSyncedAt( null )
			return
		}
		setSyncedAt( new Date( latestDt*1000 ).toLocaleTimeString( 'en-GB',{ hour12: false } ) )
	},[ latestDt ] )

	const go=( path: string ) => {
		router.push( path )
		onToggle()
	}

	return (
		<>
			{isOpen&&(
				<div
					onClick={onToggle}
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
				/>
			)}

			<aside
				className={`
					fixed lg:static top-0 left-0 z-50 h-full w-[208px] flex-shrink-0
					bg-bg border-r border-line
					px-[18px] py-[22px] flex flex-col gap-[26px]
					transition-transform lg:translate-x-0
					${isOpen? 'translate-x-0':'-translate-x-full'}
				`}
			>
				<div className="flex items-center gap-2.5">
					<span className="w-2.5 h-2.5 bg-accent flex-shrink-0" />
					<span className="font-mono text-xs tracking-[.14em]">CODENIWEATHER</span>
				</div>

				<nav className="flex flex-col gap-0.5 text-sm">
					{NAV.map( item => {
						const active=pathname===item.path
						return (
							<button
								key={item.path}
								onClick={() => go( item.path )}
								className={`
									text-left px-[11px] py-[9px] border-l-2 transition-colors
									${active
										? 'bg-panel2 border-accent text-ink'
										:'border-transparent text-mute hover:text-ink'}
								`}
							>
								{item.label}
							</button>
						)
					} )}
				</nav>

				<div className="border-t border-line pt-[18px] min-h-0 flex flex-col">
					<div className="font-mono text-[10px] tracking-[.14em] text-mute2 mb-3">
						SAVED / {locations.length}
					</div>
					<div className="flex flex-col gap-2.5 font-mono text-[13px] overflow-y-auto">
						{locations.map( loc => {
							const temp=weatherData[ loc.id ]?.main.temp
							const active=currentLocation?.id===loc.id
							return (
								<div
									key={loc.id}
									className={`flex justify-between ${active? 'text-ink':'text-mute'}`}
								>
									<span>{cityTag( loc.name )}</span>
									<span>{readout( temp )}</span>
								</div>
							)
						} )}
						{locations.length===0&&(
							<div className="text-mute2">NONE</div>
						)}
					</div>
				</div>

				<div className="mt-auto flex flex-col gap-3">
					<div className="flex gap-px font-mono text-[10px] tracking-[.1em]">
						<button
							onClick={() => setTheme( 'dark' )}
							className="flex-1 text-center py-[7px] border border-line bg-[var(--tgd-bg)] text-[var(--tgd-ink)]"
						>
							DARK
						</button>
						<button
							onClick={() => setTheme( 'light' )}
							className="flex-1 text-center py-[7px] border border-line bg-[var(--tgl-bg)] text-[var(--tgl-ink)]"
						>
							LIGHT
						</button>
					</div>
					<div className="font-mono text-[10px] leading-[1.7] text-mute2">
						OPENWEATHER<br />
						MAPTILER WEATHER v3<br />
						{syncedAt? `SYNC ${syncedAt}`:'SYNC —'}
					</div>
					<div className="font-mono text-[10px] text-mute2">
						UNITS {units==='imperial'? 'F':'C'}
					</div>
				</div>
			</aside>
		</>
	)
}

export default Sidebar
