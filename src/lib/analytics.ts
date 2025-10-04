// Enhanced analytics wrapper with API proxy approach
const enhancedAnalytics = {
	// Track page views via API proxy
	async pageView(page: string, properties: Record<string, any> = {}) {
		try {
			console.log('📊 Tracking page view via API proxy:', page)

			const response = await fetch('/api/analytics', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					event: 'page_view',
					properties: {
						...properties,
						page,
						pageTitle: properties.pageTitle || (typeof document !== 'undefined' ? document.title : ''),
						timestamp: new Date().toISOString(),
						userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
						referrer: typeof window !== 'undefined' ? document.referrer : '',
						url: typeof window !== 'undefined' ? window.location.href : '',
					}
				})
			})

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`)
			}

			const result = await response.json()
			console.log('✅ Page view tracked successfully:', result)
			return result
		} catch (error) {
			console.warn('⚠️ Analytics pageView failed:', error)
			return Promise.resolve()
		}
	},

	// Track generic events via API proxy
	async track(event: string, properties: Record<string, any> = {}) {
		try {
			console.log('📊 Tracking event via API proxy:', event)

			const response = await fetch('/api/analytics', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					event,
					properties: {
						...properties,
						timestamp: new Date().toISOString(),
						userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
						url: typeof window !== 'undefined' ? window.location.href : '',
						referrer: typeof window !== 'undefined' ? document.referrer : '',
					}
				})
			})

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`)
			}

			const result = await response.json()
			console.log('✅ Event tracked successfully:', result)
			return result
		} catch (error) {
			console.warn('⚠️ Analytics track failed:', error)
			return Promise.resolve()
		}
	},

	// Track weather-related events
	async trackWeatherEvent(event: string, properties?: Record<string, any>) {
		return this.track(`weather_${event}`, {
			...properties,
			category: 'weather'
		})
	},

	// Track user interactions
	async trackUserAction(action: string, properties?: Record<string, any>) {
		return this.track(`user_${action}`, {
			...properties,
			category: 'user_action'
		})
	},

	// Track app performance
	async trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
		return this.track('performance_metric', {
			metric,
			value,
			...properties,
			category: 'performance'
		})
	},

	// Track errors
	async trackError(error: string, properties?: Record<string, any>) {
		return this.track('error_occurred', {
			error,
			...properties,
			category: 'error'
		})
	},

	// Track feature usage
	async trackFeatureUsage(feature: string, properties?: Record<string, any>) {
		return this.track('feature_used', {
			feature,
			...properties,
			category: 'feature'
		})
	},

	// Test analytics connection
	async testConnection() {
		console.log('🧪 Testing Analytics Connection...')
		try {
			const testResult = await this.track('analytics_test', {
				test: true,
				timestamp: new Date().toISOString()
			})
			console.log('✅ Analytics connection test successful:', testResult)
			return true
		} catch (error) {
			console.error('❌ Analytics connection test failed:', error)
			return false
		}
	}
}

export const analytics = enhancedAnalytics

// Export specific tracking functions for convenience
export const trackPageView = (page: string, properties?: Record<string, any>) =>
	analytics.pageView(page, properties)

export const trackWeatherEvent = (event: string, properties?: Record<string, any>) =>
	analytics.trackWeatherEvent(event, properties)

export const trackUserAction = (action: string, properties?: Record<string, any>) =>
	analytics.trackUserAction(action, properties)

export const trackPerformance = (metric: string, value: number, properties?: Record<string, any>) =>
	analytics.trackPerformance(metric, value, properties)

export const trackError = (error: string, properties?: Record<string, any>) =>
	analytics.trackError(error, properties)

export const trackFeatureUsage = (feature: string, properties?: Record<string, any>) =>
	analytics.trackFeatureUsage(feature, properties)
