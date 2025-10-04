import { AnalyticsConfig,CodeniWeatherEvent } from '@/types/analytics'
import { Analytics } from '@codenificient/analytics-sdk'

class CodeniWeatherAnalytics {
	private analytics: Analytics|null=null;
	private config: AnalyticsConfig
	private isInitialized=false;

	constructor ( config: AnalyticsConfig ) {
		this.config=config
		this.initialize()
	}

	private initialize () {
		if ( typeof window==='undefined'||!this.config.enabled ) {
			return
		}

		try {
			this.analytics=new Analytics( {
				apiKey: this.config.apiKey,
				endpoint: this.config.endpoint,
				debug: this.config.debug||false,
			} )
			this.isInitialized=true
			console.log( '✅ Analytics initialized successfully' )
		} catch ( error ) {
			console.error( '⚠️ Failed to initialize analytics:',error )
		}
	}

	private async trackEvent ( event: CodeniWeatherEvent ): Promise<void> {
		if ( !this.isInitialized ) {
			if ( this.config.debug ) {
				console.log( 'Analytics not initialized, skipping event:',event )
			}
			return
		}

		try {
			// Send directly to our API instead of using external SDK
			await fetch( '/api/analytics/track',{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( {
					namespace: event.namespace||'default',
					eventType: event.event,
					properties: event.properties
				} ),
			} )

			if ( this.config.debug ) {
				console.log( '📊 Analytics event tracked:',event.event,event.properties )
			}
		} catch ( error ) {
			console.error( '⚠️ Failed to track analytics event:',error )
		}
	}

	// Page view tracking
	async pageView ( page: string,properties?: Record<string,any> ): Promise<void> {
		await this.trackEvent( {
			event: 'page-view',
			properties: {
				page,
				title: properties?.title||( typeof document!=='undefined'? document.title:'' ),
				referrer: properties?.referrer||( typeof document!=='undefined'? document.referrer:'' ),
				url: typeof window!=='undefined'? window.location.href:'',
				...properties,
			},
			namespace: 'page-views',
		} )
	}

	// Weather-specific tracking methods
	async trackWeatherSearch ( query: string,resultsCount: number ): Promise<void> {
		await this.trackEvent( {
			event: 'weather-action',
			properties: {
				action: 'search',
				query,
				resultsCount,
				page: typeof window!=='undefined'? window.location.pathname:'',
			},
			namespace: 'weather-events',
		} )
	}

	async trackLocationAdded ( location: { name: string; state?: string; country: string } ): Promise<void> {
		await this.trackEvent( {
			event: 'weather-action',
			properties: {
				action: 'location-added',
				locationName: location.name,
				metadata: {
					state: location.state,
					country: location.country,
				},
				page: typeof window!=='undefined'? window.location.pathname:'',
			},
			namespace: 'weather-events',
		} )
	}

	async trackLocationRemoved ( locationId: string,locationName: string ): Promise<void> {
		await this.trackEvent( {
			event: 'weather-action',
			properties: {
				action: 'location-removed',
				locationId,
				locationName,
				page: typeof window!=='undefined'? window.location.pathname:'',
			},
			namespace: 'weather-events',
		} )
	}

	async trackWeatherLayerChanged ( layer: string,previousLayer?: string ): Promise<void> {
		await this.trackEvent( {
			event: 'weather-action',
			properties: {
				action: 'layer-changed',
				layer,
				metadata: { previousLayer },
				page: typeof window!=='undefined'? window.location.pathname:'',
			},
			namespace: 'weather-events',
		} )
	}

	async trackForecastViewed ( locationId: string,days: number ): Promise<void> {
		await this.trackEvent( {
			event: 'weather-action',
			properties: {
				action: 'forecast-viewed',
				locationId,
				days,
				page: typeof window!=='undefined'? window.location.pathname:'',
			},
			namespace: 'weather-events',
		} )
	}

	async trackMapInteraction ( interaction: string,properties?: Record<string,any> ): Promise<void> {
		await this.trackEvent( {
			event: 'weather-action',
			properties: {
				action: 'map-interaction',
				interaction,
				page: typeof window!=='undefined'? window.location.pathname:'',
				...properties,
			},
			namespace: 'weather-events',
		} )
	}

	// User action tracking
	async trackUserAction ( action: string,properties?: Record<string,any> ): Promise<void> {
		await this.trackEvent( {
			event: 'user-action',
			properties: {
				action,
				page: typeof window!=='undefined'? window.location.pathname:'',
				...properties,
			},
			namespace: 'user-actions',
		} )
	}

	async trackButtonClick ( buttonId: string,page: string,properties?: Record<string,any> ): Promise<void> {
		await this.trackUserAction( 'button-click',{
			buttonId,
			page,
			...properties,
		} )
	}

	async trackNavigation ( from: string,to: string ): Promise<void> {
		await this.trackUserAction( 'navigation',{
			from,
			to,
		} )
	}

	async trackSettingsChanged ( setting: string,value: any ): Promise<void> {
		await this.trackUserAction( 'settings-changed',{
			setting,
			value,
		} )
	}

	// Track weather-related events with namespace
	async trackWeatherEvent ( event: string,properties?: Record<string,any> ): Promise<void> {
		await this.trackEvent( {
			event: 'weather-action',
			properties: {
				action: event,
				page: typeof window!=='undefined'? window.location.pathname:'',
				...properties,
			},
			namespace: 'weather-events',
		} )
	}

	// Track app performance with namespace
	async trackPerformance ( metric: string,value: number,properties?: Record<string,any> ): Promise<void> {
		await this.trackEvent( {
			event: 'user-action',
			properties: {
				action: metric,
				value,
				page: typeof window!=='undefined'? window.location.pathname:'',
				...properties,
			},
			namespace: 'performance',
		} )
	}

	// Error tracking
	async trackError ( error: string,properties?: Record<string,any> ): Promise<void> {
		await this.trackEvent( {
			event: 'error',
			properties: {
				error,
				message: properties?.message||error,
				stack: properties?.stack,
				context: properties?.context,
				page: typeof window!=='undefined'? window.location.pathname:'',
				...properties,
			},
			namespace: 'errors',
		} )
	}

	// Track feature usage with namespace
	async trackFeatureUsage ( feature: string,properties?: Record<string,any> ): Promise<void> {
		await this.trackUserAction( 'feature-used',{
			feature,
			...properties,
		} )
	}

	// Blog view tracking (for compatibility)
	async blogView ( slug: string,properties?: Record<string,any> ): Promise<void> {
		await this.trackEvent( {
			event: 'page-view',
			properties: {
				page: `/blog/${slug}`,
				slug,
				...properties,
			},
			namespace: 'page-views',
		} )
	}

	// Custom event tracking
	async track ( event: string,properties?: Record<string,any>,namespace?: string ): Promise<void> {
		await this.trackEvent( {
			event: event as any,
			properties: {
				page: typeof window!=='undefined'? window.location.pathname:'',
				...properties,
			},
			namespace: namespace||'custom',
		} )
	}

	// Get analytics data
	async fetchAnalytics (): Promise<any> {
		if ( !this.isInitialized ) return null

		try {
			// Fetch from our API
			const response=await fetch( '/api/analytics/data' )
			if ( !response.ok ) {
				throw new Error( 'Failed to fetch analytics data' )
			}
			return await response.json()
		} catch ( error ) {
			console.error( '❌ Failed to get analytics data:',error )
			return null
		}
	}

	// Get analytics instance
	getAnalyticsInstance () {
		return this.analytics
	}

	// Test analytics connection
	async testConnection (): Promise<boolean> {
		if ( !this.isInitialized ) {
			console.log( '❌ Cannot test - Analytics not initialized' )
			return false
		}

		try {
			// Test with a simple track event
			await this.track( 'analytics-test',{
				test: true,
				timestamp: new Date().toISOString()
			} )
			console.log( '✅ Analytics connection test successful' )
			return true
		} catch ( error ) {
			console.error( '❌ Analytics connection test failed:',error )
			return false
		}
	}

	// Set user ID for tracking
	setUserId ( userId: string ) {
		this.config={ ...this.config,userId }
	}

	// Check if analytics is enabled
	isEnabled (): boolean {
		return this.isInitialized&&this.config.enabled!==false
	}
}

// Create singleton instance
let analyticsInstance: CodeniWeatherAnalytics|null=null

export function initializeAnalytics ( config: AnalyticsConfig ): CodeniWeatherAnalytics {
	if ( !analyticsInstance ) {
		analyticsInstance=new CodeniWeatherAnalytics( config )
	}
	return analyticsInstance
}

export function getAnalyticsInstance (): CodeniWeatherAnalytics|null {
	return analyticsInstance
}

// Default configuration
const defaultConfig: AnalyticsConfig={
	apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY||'proj_codeniweather_main',
	endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT||'https://analytics-dashboard-phi-six.vercel.app',
	debug: process.env.NODE_ENV==='development',
	enabled: process.env.NODE_ENV==='production'||process.env.NEXT_PUBLIC_ANALYTICS_ENABLED==='true',
}

// Initialize with default config
if ( typeof window!=='undefined' ) {
	initializeAnalytics( defaultConfig )
}

// Export singleton for convenience
export const analytics=getAnalyticsInstance()||{
	pageView: async () => {},
	trackWeatherSearch: async () => {},
	trackLocationAdded: async () => {},
	trackLocationRemoved: async () => {},
	trackWeatherLayerChanged: async () => {},
	trackForecastViewed: async () => {},
	trackMapInteraction: async () => {},
	trackUserAction: async () => {},
	trackButtonClick: async () => {},
	trackNavigation: async () => {},
	trackSettingsChanged: async () => {},
	trackWeatherEvent: async () => {},
	trackPerformance: async () => {},
	trackError: async () => {},
	trackFeatureUsage: async () => {},
	blogView: async () => {},
	track: async () => {},
	fetchAnalytics: async () => null,
	getAnalyticsInstance: () => null,
	testConnection: async () => false,
	setUserId: () => {},
	isEnabled: () => false,
}

export { CodeniWeatherAnalytics }
