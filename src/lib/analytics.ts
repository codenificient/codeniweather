import { Analytics } from '@codenificient/analytics-sdk'

// Check if analytics is properly configured
const isAnalyticsConfigured=() => {
	const apiKey=process.env.NEXT_PUBLIC_ANALYTICS_API_KEY||'proj_codeniweather_main'
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

// Enhanced analytics wrapper using SDK
const enhancedAnalytics={
	// Track page views using SDK
	async pageView ( url: string,properties: Record<string,any>={} ) {
		try {
			if ( !analytics ) {
				console.warn( '⚠️ Analytics SDK not initialized' )
				return Promise.resolve()
			}

			console.log( '📊 Tracking page view via SDK:',url )

			const enhancedProps={
				...properties,
				url,
				pageTitle: properties.pageTitle||( typeof document!=='undefined'? document.title:'' ),
				timestamp: new Date().toISOString(),
				userAgent: typeof window!=='undefined'? window.navigator.userAgent:'server',
				referrer: typeof window!=='undefined'? document.referrer:'',
			}

			const result=await analytics.pageView( url,enhancedProps )
			console.log( '✅ Page view tracked successfully:',result )
			return result
		} catch ( error ) {
			console.warn( '⚠️ Analytics pageView failed:',error )
			return Promise.resolve()
		}
	},

	// Track custom events using SDK
	async track ( event: string,properties: Record<string,any>={},namespace?: string ) {
		try {
			if ( !analytics ) {
				console.warn( '⚠️ Analytics SDK not initialized' )
				return Promise.resolve()
			}

			console.log( '📊 Tracking event via SDK:',event )

			const enhancedProps={
				...properties,
				timestamp: new Date().toISOString(),
				userAgent: typeof window!=='undefined'? window.navigator.userAgent:'server',
				url: typeof window!=='undefined'? window.location.href:'',
				referrer: typeof window!=='undefined'? document.referrer:'',
			}

			const result=await analytics.track( namespace||'general',event,enhancedProps )
			console.log( '✅ Event tracked successfully:',result )
			return result
		} catch ( error ) {
			console.warn( '⚠️ Analytics track failed:',error )
			return Promise.resolve()
		}
	},

	// Track blog views using SDK
	async blogView ( slug: string,properties: Record<string,any>={} ) {
		try {
			if ( !analytics ) {
				console.warn( '⚠️ Analytics SDK not initialized' )
				return Promise.resolve()
			}

			console.log( '📊 Tracking blog view via SDK:',slug )

			const enhancedProps={
				...properties,
				slug,
				timestamp: new Date().toISOString(),
				userAgent: typeof window!=='undefined'? window.navigator.userAgent:'server',
				url: typeof window!=='undefined'? window.location.href:'',
				referrer: typeof window!=='undefined'? document.referrer:'',
			}

			const result=await analytics.blogView( slug,enhancedProps )
			console.log( '✅ Blog view tracked successfully:',result )
			return result
		} catch ( error ) {
			console.warn( '⚠️ Analytics blogView failed:',error )
			return Promise.resolve()
		}
	},

	// Track weather-related events with namespace
	trackWeatherEvent ( event: string,properties?: Record<string,any> ) {
		return this.track( event,properties,'weather-events' )
	},

	// Track user interactions with namespace
	trackUserAction ( action: string,properties?: Record<string,any> ) {
		return this.track( action,properties,'user-actions' )
	},

	// Track app performance with namespace
	trackPerformance ( metric: string,value: number,properties?: Record<string,any> ) {
		return this.track( metric,{
			value,
			...properties
		},'performance' )
	},

	// Track errors with namespace
	trackError ( error: string,properties?: Record<string,any> ) {
		return this.track( 'error-occurred',{
			error,
			...properties
		},'system-events' )
	},

	// Track feature usage with namespace
	trackFeatureUsage ( feature: string,properties?: Record<string,any> ) {
		return this.track( 'feature-used',{
			feature,
			...properties
		},'feature-usage' )
	},

	// Weather-specific tracking methods
	trackWeatherSearch ( query: string,resultsCount: number ) {
		return this.trackWeatherEvent( 'search',{
			query,
			resultsCount,
			searchType: 'city'
		} )
	},

	trackLocationAdded ( location: { name: string; state?: string; country: string } ) {
		return this.trackWeatherEvent( 'location_added',{
			locationName: location.name,
			state: location.state,
			country: location.country
		} )
	},

	trackLocationRemoved ( locationId: string,locationName: string ) {
		return this.trackWeatherEvent( 'location_removed',{
			locationId,
			locationName
		} )
	},

	trackWeatherLayerChanged ( layer: string,previousLayer?: string ) {
		return this.trackWeatherEvent( 'layer_changed',{
			layer,
			previousLayer: previousLayer||'unknown'
		} )
	},

	trackForecastViewed ( locationId: string,days: number ) {
		return this.trackWeatherEvent( 'forecast_viewed',{
			locationId,
			days
		} )
	},

	trackMapInteraction ( interaction: string,properties?: Record<string,any> ) {
		return this.trackWeatherEvent( 'map_interaction',{
			interaction,
			...properties
		} )
	},

	// User action tracking methods
	trackButtonClick ( buttonId: string,page: string,properties?: Record<string,any> ) {
		return this.trackUserAction( 'button_click',{
			buttonId,
			page,
			...properties
		} )
	},

	trackNavigation ( from: string,to: string ) {
		return this.trackUserAction( 'navigation',{
			from,
			to
		} )
	},

	trackSettingsChanged ( setting: string,value: any ) {
		return this.trackUserAction( 'settings_changed',{
			setting,
			value
		} )
	},

	// Add a method to check if analytics is available
	getAnalyticsInstance () {
		return analytics
	},

	// Fetch analytics data via API proxy
	async fetchAnalytics ( options?: {
		namespace?: string
		eventType?: string
		startDate?: string
		endDate?: string
		groupBy?: 'day'|'week'|'month'
		limit?: number
	} ) {
		try {
			// Build query string from options
			const queryParams=new URLSearchParams()
			if ( options?.namespace ) queryParams.set( 'namespace',options.namespace )
			if ( options?.eventType ) queryParams.set( 'eventType',options.eventType )
			if ( options?.startDate ) queryParams.set( 'startDate',options.startDate )
			if ( options?.endDate ) queryParams.set( 'endDate',options.endDate )
			if ( options?.groupBy ) queryParams.set( 'groupBy',options.groupBy )
			if ( options?.limit ) queryParams.set( 'limit',options.limit.toString() )

			const queryString=queryParams.toString()
			const url=`/api/analytics${queryString? `?${queryString}`:''}`

			console.log( '📊 Fetching analytics data via proxy:',url )

			const response=await fetch( url,{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			} )

			if ( !response.ok ) {
				throw new Error( `Failed to fetch analytics: ${response.status}` )
			}

			const data=await response.json()
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
