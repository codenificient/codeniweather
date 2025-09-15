'use client'

import { Badge } from '@/components/ui/badge'
import { StateWeatherData } from '@/lib/state-weather-aggregator'
import React from 'react'

interface StateWeatherBadgeProps {
	data: StateWeatherData
	layerType: string
	position: { x: number; y: number }
	isVisible: boolean
}

const StateWeatherBadge: React.FC<StateWeatherBadgeProps>=( {
	data,
	layerType,
	position,
	isVisible
} ) => {
	const config={
		temperature: { icon: '🌡️',variant: 'temperature' as const },
		precipitation: { icon: '🌧️',variant: 'precipitation' as const },
		wind: { icon: '💨',variant: 'wind' as const },
		pressure: { icon: '📊',variant: 'pressure' as const },
		radar: { icon: '📡',variant: 'radar' as const },
		clouds: { icon: '☁️',variant: 'clouds' as const },
		'frozen-precipitation': { icon: '❄️',variant: 'frozen' as const }
	}

	const layerConfig=config[ layerType as keyof typeof config ]||config.temperature

	if ( !isVisible ) return null

	return (
		<div
			className="absolute pointer-events-none z-50 transition-all duration-300 ease-in-out"
			style={{
				left: `${position.x}px`,
				top: `${position.y}px`,
				transform: 'translate(-50%, -50%)'
			}}
		>
			<Badge
				variant={layerConfig.variant}
				className="px-1 py-0.5 text-xs font-medium shadow-lg backdrop-blur-sm border border-white/20 dark:border-white/10"
			>
				<span className="font-semibold text-xs leading-none">
					{data.averageValue.toFixed( 1 )}
				</span>
			</Badge>
		</div>
	)
}

export default StateWeatherBadge
