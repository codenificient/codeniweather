'use client'

import { useWeather } from '@/contexts/WeatherContext'
import dynamic from 'next/dynamic'
import React,{ useEffect,useMemo,useState } from 'react'

// MapTiler touches `window` during module init, so the map may only load in the
// browser.
const MapComponent=dynamic( () => import( './MapComponent' ),{ ssr: false } )

/**
 * The seven weather layers wired to MapTiler, in the design's order and using
 * its mono codes. Shared by the map screen and the fullscreen view so the two
 * can never drift apart.
 */
export const MAP_LAYERS=[
	{ id: 'radar',code: 'RADAR',title: 'Radar',legend: 'REFLECTIVITY' },
	{ id: 'temperature',code: 'TEMP',title: 'Temperature',legend: 'TEMPERATURE' },
	{ id: 'precipitation',code: 'PRECIP',title: 'Precipitation',legend: 'PRECIPITATION' },
	{ id: 'wind',code: 'WIND',title: 'Wind',legend: 'WIND SPEED' },
	{ id: 'pressure',code: 'QNH',title: 'Pressure',legend: 'PRESSURE' },
	{ id: 'clouds',code: 'CLOUD',title: 'Cloud cover',legend: 'CLOUD COVER' },
	{ id: 'frozen-precipitation',code: 'SNOW',title: 'Snow',legend: 'SNOWFALL' },
]

interface InstrumentMapProps {
	/** Height of the map surface. The 2a preview uses 300px; 2d goes full-bleed. */
	height?: string
	className?: string
	/** Frame every saved city rather than centring on the current one. */
	fitAll?: boolean
}

const apiKey=(): string => process.env.NEXT_PUBLIC_MAPTILER_API_KEY||''

/**
 * The bare map surface used by the 1b screens — no controls, no legend, no
 * layer picker. Each screen draws its own chrome around this in the design's
 * own idiom, which is why the stock WeatherMap (which ships its own toolbar)
 * is not reused here.
 */
const InstrumentMap: React.FC<InstrumentMapProps>=( { height='300px',className='',fitAll=false } ) => {
	const { locations,currentLocation,selectedLayer }=useWeather()
	const [ webglSupported,setWebglSupported ]=useState( true )

	useEffect( () => {
		const canvas=document.createElement( 'canvas' )
		const gl=canvas.getContext( 'webgl' )||canvas.getContext( 'webgl2' )
		if ( !gl ) setWebglSupported( false )
	},[] )

	// MapComponent's init effect lists `center` in its dependencies, so handing
	// it a freshly built array each render tears the map down and rebuilds it
	// every time — which eventually loses the WebGL context and leaves an empty
	// panel. Memoise on the primitive coordinates so the reference is stable.
	const lon=currentLocation?.lon??locations[ 0 ]?.lon
	const lat=currentLocation?.lat??locations[ 0 ]?.lat
	const pinned=Boolean( currentLocation )

	// Bounds are reduced to numbers here so the memo below never depends on the
	// `locations` array identity.
	const bounds=locations.reduce(
		( acc,l ) => ( {
			minLat: Math.min( acc.minLat,l.lat ),maxLat: Math.max( acc.maxLat,l.lat ),
			minLon: Math.min( acc.minLon,l.lon ),maxLon: Math.max( acc.maxLon,l.lon ),
		} ),
		{ minLat: Infinity,maxLat: -Infinity,minLon: Infinity,maxLon: -Infinity }
	)
	const spread=Math.max( bounds.maxLat-bounds.minLat,bounds.maxLon-bounds.minLon )

	const view=useMemo( () => {
		if ( fitAll&&locations.length>0&&Number.isFinite( spread ) ) {
			if ( locations.length===1 ) {
				return { center: [ bounds.minLon,bounds.minLat ] as [ number,number ],zoom: 8 }
			}
			const zoom=spread<0.1? 10:spread<0.5? 8:spread<1? 7:spread<2? 6:spread<10? 5:spread<40? 4:3
			return {
				center: [
					( bounds.minLon+bounds.maxLon )/2,
					( bounds.minLat+bounds.maxLat )/2,
				] as [ number,number ],
				zoom,
			}
		}
		return lon!==undefined&&lat!==undefined
			? { center: [ lon,lat ] as [ number,number ],zoom: pinned? 8:7 }
			:{ center: [ 0,20 ] as [ number,number ],zoom: 2 }
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},[ lon,lat,pinned,fitAll,locations.length,spread,bounds.minLat,bounds.maxLat,bounds.minLon,bounds.maxLon ] )

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
