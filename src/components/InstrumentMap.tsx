'use client'

import { useWeather } from '@/contexts/WeatherContext'
import dynamic from 'next/dynamic'
import React,{ useEffect,useState } from 'react'

// MapTiler touches `window` during module init, so the map may only load in the
// browser.
const MapComponent=dynamic( () => import( './MapComponent' ),{ ssr: false } )

interface InstrumentMapProps {
	/** Height of the map surface. The 2a preview uses 300px; 2d goes full-bleed. */
	height?: string
	className?: string
}

const apiKey=(): string => process.env.NEXT_PUBLIC_MAPTILER_API_KEY||''

/**
 * The bare map surface used by the 1b screens — no controls, no legend, no
 * layer picker. Each screen draws its own chrome around this in the design's
 * own idiom, which is why the stock WeatherMap (which ships its own toolbar)
 * is not reused here.
 */
const InstrumentMap: React.FC<InstrumentMapProps>=( { height='300px',className='' } ) => {
	const { locations,currentLocation,selectedLayer }=useWeather()
	const [ webglSupported,setWebglSupported ]=useState( true )

	useEffect( () => {
		const canvas=document.createElement( 'canvas' )
		const gl=canvas.getContext( 'webgl' )||canvas.getContext( 'webgl2' )
		if ( !gl ) setWebglSupported( false )
	},[] )

	const view=currentLocation
		? { center: [ currentLocation.lon,currentLocation.lat ] as [ number,number ],zoom: 8 }
		:locations.length>0
			? { center: [ locations[ 0 ].lon,locations[ 0 ].lat ] as [ number,number ],zoom: 7 }
			:{ center: [ 0,20 ] as [ number,number ],zoom: 2 }

	// `relative` + `overflow-hidden` matter: MapComponent positions its legend,
	// badges and attribution absolutely, and without a positioned, clipping
	// ancestor they escape and land on top of the panels below.
	const surface=`relative overflow-hidden border border-line bg-[var(--map)] ${className}`

	if ( !apiKey() ) {
		return (
			<div className={`${surface} flex items-end justify-between p-3.5`} style={{ height }}>
				<span className="font-mono text-[11px] text-mute bg-bg border border-line px-2 py-1">
					MAPTILER KEY NOT CONFIGURED
				</span>
			</div>
		)
	}

	if ( !webglSupported ) {
		return (
			<div className={`${surface} flex items-end justify-between p-3.5`} style={{ height }}>
				<span className="font-mono text-[11px] text-mute bg-bg border border-line px-2 py-1">
					WEBGL UNAVAILABLE — LAYERS DISABLED
				</span>
			</div>
		)
	}

	return (
		<div className={surface} style={{ height }}>
			<MapComponent
				apiKey={apiKey()}
				center={view.center}
				zoom={view.zoom}
				selectedLayer={selectedLayer}
				locations={locations}
				currentLocation={currentLocation}
				webglSupported={webglSupported}
				bare
			/>
		</div>
	)
}

export default InstrumentMap
