import { analyticsService } from '@/lib/analytics'
import { useRouter } from 'next/navigation'
import { useCallback,useEffect } from 'react'

export const useAnalytics=() => {
	const router=useRouter()

	// Track page views automatically
	useEffect( () => {
		const handleRouteChange=( url: string ) => {
			analyticsService.trackPageView( url,{
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
		analyticsService.trackWeatherEvent( 'weather-search',{
			query,
			resultsCount,
			searchType: 'city'
		} )
	},[] )

	const trackLocationAdded=useCallback( ( location: { name: string; state?: string; country: string } ) => {
		analyticsService.trackWeatherEvent( 'location-added',{
			locationName: location.name,
			state: location.state,
			country: location.country
		} )
	},[] )

	const trackLocationRemoved=useCallback( ( locationId: string,locationName: string ) => {
		analyticsService.trackWeatherEvent( 'location-removed',{
			locationId,
			locationName
		} )
	},[] )

	const trackWeatherLayerChanged=useCallback( ( layer: string ) => {
		analyticsService.trackWeatherEvent( 'weather-layer-changed',{
			layer,
			previousLayer: 'unknown' // We could track this if needed
		} )
	},[] )

	const trackForecastViewed=useCallback( ( locationId: string,days: number ) => {
		analyticsService.trackWeatherEvent( 'forecast-viewed',{
			locationId,
			days
		} )
	},[] )

	const trackMapInteraction=useCallback( ( interaction: string,properties?: Record<string,any> ) => {
		analyticsService.trackWeatherEvent( 'map-interaction',{
			interaction,
			...properties
		} )
	},[] )

	// User action tracking functions
	const trackButtonClick=useCallback( ( buttonId: string,page: string,properties?: Record<string,any> ) => {
		analyticsService.trackUserAction( 'button-click',{
			buttonId,
			page,
			...properties
		} )
	},[] )

	const trackNavigation=useCallback( ( from: string,to: string ) => {
		analyticsService.trackUserAction( 'navigation',{
			from,
			to
		} )
	},[] )

	const trackSettingsChanged=useCallback( ( setting: string,value: any ) => {
		analyticsService.trackUserAction( 'settings-changed',{
			setting,
			value
		} )
	},[] )

	// Feature usage tracking
	const trackFeatureUsed=useCallback( ( feature: string,properties?: Record<string,any> ) => {
		analyticsService.trackFeatureUsage( feature,properties )
	},[] )

	// Error tracking
	const trackAppError=useCallback( ( error: string,context?: string,properties?: Record<string,any> ) => {
		analyticsService.trackError( error,{
			context,
			...properties
		} )
	},[] )

	// Performance tracking
	const trackPerformanceMetric=useCallback( ( metric: string,value: number,properties?: Record<string,any> ) => {
		analyticsService.trackPerformance( metric,value,properties )
	},[] )

	// Batch tracking for multiple events
	const trackBatch=useCallback( ( events: Array<{ event: string; properties?: Record<string,any>; namespace?: string }> ) => {
		analyticsService.trackBatch( events )
	},[] )

	return {
		// Page tracking
		trackPageView: ( page: string,properties?: Record<string,any> ) =>
			analyticsService.trackPageView( page,properties ),

		// Weather tracking
		trackWeatherSearch,
		trackLocationAdded,
		trackLocationRemoved,
		trackWeatherLayerChanged,
		trackForecastViewed,
		trackMapInteraction,

		// User action tracking
		trackUserAction: ( action: string,properties?: Record<string,any> ) =>
			analyticsService.trackUserAction( action,properties ),
		trackButtonClick,
		trackNavigation,
		trackSettingsChanged,

		// Feature and error tracking
		trackFeatureUsed,
		trackAppError,
		trackPerformanceMetric,

		// Batch tracking
		trackBatch,

		// Direct access to analytics service
		analyticsService
	}
}
