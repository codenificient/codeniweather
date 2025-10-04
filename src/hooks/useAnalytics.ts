import { analytics } from '@/lib/analytics'
import { useRouter } from 'next/navigation'
import { useCallback,useEffect } from 'react'

export const useAnalytics=() => {
	const router=useRouter()

	// Track page views automatically
	useEffect( () => {
		const handleRouteChange=( url: string ) => {
			analytics.pageView( url,{
				page: url,
				timestamp: Date.now()
			} )
		}

		// Track initial page load
		if ( typeof window!=='undefined' ) {
			handleRouteChange( window.location.pathname )
		}

		// Note: Next.js App Router doesn't have a built-in route change event
		// We'll need to track page changes manually in each page component
	},[] )

	// Weather-specific tracking functions
	const trackWeatherSearch=useCallback( ( query: string,resultsCount: number ) => {
		analytics.trackWeatherEvent( 'search',{
			query,
			resultsCount,
			searchType: 'city'
		} )
	},[] )

	const trackLocationAdded=useCallback( ( location: { name: string; state?: string; country: string } ) => {
		analytics.trackWeatherEvent( 'location_added',{
			locationName: location.name,
			state: location.state,
			country: location.country
		} )
	},[] )

	const trackLocationRemoved=useCallback( ( locationId: string,locationName: string ) => {
		analytics.trackWeatherEvent( 'location_removed',{
			locationId,
			locationName
		} )
	},[] )

	const trackWeatherLayerChanged=useCallback( ( layer: string ) => {
		analytics.trackWeatherEvent( 'layer_changed',{
			layer,
			previousLayer: 'unknown' // We could track this if needed
		} )
	},[] )

	const trackForecastViewed=useCallback( ( locationId: string,days: number ) => {
		analytics.trackWeatherEvent( 'forecast_viewed',{
			locationId,
			days
		} )
	},[] )

	const trackMapInteraction=useCallback( ( interaction: string,properties?: Record<string,any> ) => {
		analytics.trackWeatherEvent( 'map_interaction',{
			interaction,
			...properties
		} )
	},[] )

	// User action tracking functions
	const trackButtonClick=useCallback( ( buttonId: string,page: string,properties?: Record<string,any> ) => {
		analytics.trackUserAction( 'button_click',{
			buttonId,
			page,
			...properties
		} )
	},[] )

	const trackNavigation=useCallback( ( from: string,to: string ) => {
		analytics.trackUserAction( 'navigation',{
			from,
			to
		} )
	},[] )

	const trackSettingsChanged=useCallback( ( setting: string,value: any ) => {
		analytics.trackUserAction( 'settings_changed',{
			setting,
			value
		} )
	},[] )

	// Feature usage tracking
	const trackFeatureUsed=useCallback( ( feature: string,properties?: Record<string,any> ) => {
		analytics.trackFeatureUsage( feature,properties )
	},[] )

	// Error tracking
	const trackAppError=useCallback( ( error: string,context?: string,properties?: Record<string,any> ) => {
		analytics.trackError( error,{
			context,
			...properties
		} )
	},[] )

	// Performance tracking
	const trackPerformanceMetric=useCallback( ( metric: string,value: number,properties?: Record<string,any> ) => {
		analytics.trackPerformance( metric,value,properties )
	},[] )

	return {
		// Page tracking
		trackPageView: ( page: string,properties?: Record<string,any> ) =>
			analytics.pageView( page,properties ),

		// Weather tracking
		trackWeatherSearch,
		trackLocationAdded,
		trackLocationRemoved,
		trackWeatherLayerChanged,
		trackForecastViewed,
		trackMapInteraction,

		// User action tracking
		trackUserAction: ( action: string,properties?: Record<string,any> ) =>
			analytics.trackUserAction( action,properties ),
		trackButtonClick,
		trackNavigation,
		trackSettingsChanged,

		// Feature and error tracking
		trackFeatureUsed,
		trackAppError,
		trackPerformanceMetric,

		// Direct access to analytics
		analytics
	}
}
