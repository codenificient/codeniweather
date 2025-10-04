import { Analytics } from '@codenificient/analytics-sdk'

// Check if analytics is properly configured
const isAnalyticsConfigured=() => {
	const apiKey=process.env.NEXT_PUBLIC_ANALYTICS_API_KEY || 'proj_codeniweather_main'
	const endpoint=process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT||'https://analytics-dashboard-phi-six.vercel.app'

	console.log( '🔍 Analytics Configuration Check:' )
	console.log( '  - API Key:',apiKey??'NOT SET' )
	console.log( '  - Endpoint:',endpoint )
	console.log( '  - NODE_ENV:',process.env.NODE_ENV )

	// Check if we have valid configuration (not placeholder values)
	const isValid=apiKey&&
		apiKey!=='your_analytics_api_key_here'&&
		endpoint&&
		endpoint!=='https://your-analytics-api.com'&&
		!endpoint.includes( 'your-analytics-api.com' )

	console.log( '  - Is Valid Configuration:',isValid )
	return isValid
}

// Create analytics instance only if properly configured
let analytics: Analytics|null=null

if ( isAnalyticsConfigured() ) {
	try {
		analytics=new Analytics( {
			apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY!,
			endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT||'https://analytics-dashboard-phi-six.vercel.app',
			debug: process.env.NODE_ENV==='development',
		} )
		console.log( '✅ Analytics SDK initialized successfully' )
	} catch ( error ) {
		console.warn( '⚠️ Failed to initialize Analytics SDK:',error )
		analytics=null
	}
} else {
	console.log( 'ℹ️ Analytics not configured - using API proxy mode' )
}

// Enhanced analytics wrapper with API proxy
const enhancedAnalytics={
	// Use API proxy for page views
	async pageView ( url: string,properties: Record<string,any>={} ) {
		try {
			console.log( '📊 Tracking page view via API proxy:',url )

			const response=await fetch( '/api/analytics',{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( {
					event: 'page_view',
					properties: {
						...properties,
						url,
						pageTitle: properties.pageTitle||document.title,
						timestamp: new Date().toISOString(),
						userAgent: typeof window!=='undefined'? window.navigator.userAgent:'server',
						referrer: typeof window!=='undefined'? document.referrer:'',
					}
				} )
			} )

			if ( !response.ok ) {
				throw new Error( `API request failed: ${response.status}` )
			}

			const result=await response.json()
			console.log( '✅ Page view tracked successfully:',result )
			return result
		} catch ( error ) {
			console.warn( '⚠️ Analytics pageView failed:',error )
			return Promise.resolve()
		}
	},

	async track ( event: string,properties: Record<string,any>={} ) {
		try {
			console.log( '📊 Tracking event via API proxy:',event )

			const response=await fetch( '/api/analytics',{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( {
					event,
					properties: {
						...properties,
						timestamp: new Date().toISOString(),
						userAgent: typeof window!=='undefined'? window.navigator.userAgent:'server',
						url: typeof window!=='undefined'? window.location.href:'',
						referrer: typeof window!=='undefined'? document.referrer:'',
					}
				} )
			} )

			if ( !response.ok ) {
				throw new Error( `API request failed: ${response.status}` )
			}

			const result=await response.json()
			console.log( '✅ Event tracked successfully:',result )
			return result
		} catch ( error ) {
			console.warn( '⚠️ Analytics track failed:',error )
			return Promise.resolve()
		}
	},

	async blogView ( slug: string,properties: Record<string,any>={} ) {
		try {
			console.log( '📊 Tracking blog view via API proxy:',slug )

			const response=await fetch( '/api/analytics',{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( {
					event: 'blog_view',
					properties: {
						...properties,
						slug,
						timestamp: new Date().toISOString(),
						userAgent: typeof window!=='undefined'? window.navigator.userAgent:'server',
						url: typeof window!=='undefined'? window.location.href:'',
						referrer: typeof window!=='undefined'? document.referrer:'',
					}
				} )
			} )

			if ( !response.ok ) {
				throw new Error( `API request failed: ${response.status}` )
			}

			const result=await response.json()
			console.log( '✅ Blog view tracked successfully:',result )
			return result
		} catch ( error ) {
			console.warn( '⚠️ Analytics blogView failed:',error )
			return Promise.resolve()
		}
	},

	// Track weather-related events
	trackWeatherEvent ( event: string,properties?: Record<string,any> ) {
		return this.track( `weather_${event}`,{
			...properties,
			category: 'weather'
		} )
	},

	// Track user interactions
	trackUserAction ( action: string,properties?: Record<string,any> ) {
		return this.track( `user_${action}`,{
			...properties,
			category: 'user_action'
		} )
	},

	// Track app performance
	trackPerformance ( metric: string,value: number,properties?: Record<string,any> ) {
		return this.track( 'performance_metric',{
			metric,
			value,
			...properties,
			category: 'performance'
		} )
	},

	// Track errors
	trackError ( error: string,properties?: Record<string,any> ) {
		return this.track( 'error_occurred',{
			error,
			...properties,
			category: 'error'
		} )
	},

	// Track feature usage
	trackFeatureUsage ( feature: string,properties?: Record<string,any> ) {
		return this.track( 'feature_used',{
			feature,
			...properties,
			category: 'feature'
		} )
	},

	// Add a method to check if analytics is available
	getAnalyticsInstance () {
		return analytics
	},

	// Fetch analytics data for current project
	async fetchAnalytics ( options?: {
		namespace?: string;
		eventType?: string;
		startDate?: string;
		endDate?: string;
		groupBy?: 'day'|'week'|'month';
		limit?: number;
	} ) {
		try {
			if ( !analytics ) {
				console.warn( '⚠️ Analytics SDK not initialized' )
				return null
			}

			console.log( '📊 Fetching analytics data with options:',options )
			const data=await analytics.getAnalytics( options )
			console.log( '✅ Analytics data retrieved:',data )
			return data
		} catch ( error ) {
			console.error( '❌ Failed to fetch analytics:',error )
			return null
		}
	},

	// Test analytics connection
	async testConnection () {
		console.log( '🧪 Testing Analytics Connection:' )
		console.log( '  - Analytics Instance:',analytics? 'Available':'NULL' )
		console.log( '  - Configuration Valid:',isAnalyticsConfigured() )

		if ( !analytics ) {
			console.log( '❌ Cannot test - Analytics instance is null' )
			return false
		}

		try {
			// Test with a simple track event
			const testResult=await this.track( 'analytics-test',{
				test: true,
				timestamp: new Date().toISOString()
			} )
			console.log( '✅ Analytics connection test successful:',testResult )
			return true
		} catch ( error ) {
			console.error( '❌ Analytics connection test failed:',error )
			return false
		}
	}
}

export { enhancedAnalytics as analytics }