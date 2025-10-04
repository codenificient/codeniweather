import { Analytics } from '@codenificient/analytics-sdk'

// Analytics configuration
const ANALYTICS_CONFIG={
	apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY||'codeniweather-analytics-key',
	endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT||'https://analytics.codenificient.com',
	debug: process.env.NODE_ENV==='development',
	timeout: 5000
}

// Initialize analytics instance
const analytics=new Analytics( ANALYTICS_CONFIG )

// Analytics service class
export class AnalyticsService {
	private static instance: AnalyticsService
	private analytics: Analytics

	private constructor() {
		this.analytics=analytics
	}

	public static getInstance (): AnalyticsService {
		if ( !AnalyticsService.instance ) {
			AnalyticsService.instance=new AnalyticsService()
		}
		return AnalyticsService.instance
	}

	// Track page views
	async trackPageView ( page: string,properties?: Record<string,any> ) {
		try {
			await this.analytics.pageView( page,{
				title: document.title,
				referrer: document.referrer,
				...properties
			} )
		} catch ( error ) {
			console.warn( 'Analytics page view tracking failed:',error )
		}
	}

	// Track weather-related events
	async trackWeatherEvent ( event: string,properties?: Record<string,any> ) {
		try {
			await this.analytics.track( 'weather-events',event,properties )
		} catch ( error ) {
			console.warn( 'Analytics weather event tracking failed:',error )
		}
	}

	// Track user interactions
	async trackUserAction ( action: string,properties?: Record<string,any> ) {
		try {
			await this.analytics.track( 'user-actions',action,properties )
		} catch ( error ) {
			console.warn( 'Analytics user action tracking failed:',error )
		}
	}

	// Track app performance
	async trackPerformance ( metric: string,value: number,properties?: Record<string,any> ) {
		try {
			await this.analytics.track( 'performance','performance-metric',{
				metric,
				value,
				...properties
			} )
		} catch ( error ) {
			console.warn( 'Analytics performance tracking failed:',error )
		}
	}

	// Track errors
	async trackError ( error: string,properties?: Record<string,any> ) {
		try {
			await this.analytics.track( 'system-events','error-occurred',{
				error,
				...properties
			} )
		} catch ( trackingError ) {
			console.warn( 'Analytics error tracking failed:',trackingError )
		}
	}

	// Track feature usage
	async trackFeatureUsage ( feature: string,properties?: Record<string,any> ) {
		try {
			await this.analytics.track( 'feature-usage','feature-used',{
				feature,
				...properties
			} )
		} catch ( error ) {
			console.warn( 'Analytics feature usage tracking failed:',error )
		}
	}

	// Track batch events
	async trackBatch ( events: Array<{ event: string; properties?: Record<string,any>; namespace?: string }> ) {
		try {
			const eventData=events.map( ( { event,properties,namespace } ) => ( {
				namespace: namespace||'general',
				eventType: event,
				properties: {
					...properties,
					timestamp: Date.now()
				}
			} ) )

			await this.analytics.trackBatch( eventData )
		} catch ( error ) {
			console.warn( 'Analytics batch tracking failed:',error )
		}
	}

	// Get analytics data
	async getAnalytics ( options?: {
		namespace?: string;
		eventType?: string;
		startDate?: string;
		endDate?: string;
		groupBy?: 'day'|'week'|'month';
		limit?: number;
	} ) {
		try {
			return await this.analytics.getAnalytics( options )
		} catch ( error ) {
			console.warn( 'Analytics data retrieval failed:',error )
			return null
		}
	}
}

// Export singleton instance
export const analyticsService=AnalyticsService.getInstance()

// Export specific tracking functions for convenience
export const trackPageView=( page: string,properties?: Record<string,any> ) =>
	analyticsService.trackPageView( page,properties )

export const trackWeatherEvent=( event: string,properties?: Record<string,any> ) =>
	analyticsService.trackWeatherEvent( event,properties )

export const trackUserAction=( action: string,properties?: Record<string,any> ) =>
	analyticsService.trackUserAction( action,properties )

export const trackPerformance=( metric: string,value: number,properties?: Record<string,any> ) =>
	analyticsService.trackPerformance( metric,value,properties )

export const trackError=( error: string,properties?: Record<string,any> ) =>
	analyticsService.trackError( error,properties )

export const trackFeatureUsage=( feature: string,properties?: Record<string,any> ) =>
	analyticsService.trackFeatureUsage( feature,properties )

export const trackBatch=( events: Array<{ event: string; properties?: Record<string,any>; namespace?: string }> ) =>
	analyticsService.trackBatch( events )
