// Enhanced analytics wrapper with API proxy approach
const enhancedAnalytics = {
	// Track page views via API proxy (non-blocking)
	pageView(page: string, properties: Record<string, any> = {}) {
		// Fire and forget - don't block UI
		if (typeof window === 'undefined') return Promise.resolve()

		console.log('📊 Tracking page view via API proxy:', page)

		fetch('/api/analytics', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				event: 'page_view',
				properties: {
					...properties,
					page,
					pageTitle: properties.pageTitle || document.title,
					timestamp: new Date().toISOString(),
					userAgent: window.navigator.userAgent,
					referrer: document.referrer,
					url: window.location.href,
				}
			}),
			keepalive: true // Ensure request completes even if page unloads
		}).then(response => {
			if (response.ok) {
				console.log('✅ Page view tracked successfully')
			}
		}).catch(error => {
			console.warn('⚠️ Analytics pageView failed:', error)
		})

		return Promise.resolve()
	},

	// Track generic events via API proxy (non-blocking)
	track(event: string, properties: Record<string, any> = {}) {
		// Fire and forget - don't block UI
		if (typeof window === 'undefined') return Promise.resolve()

		console.log('📊 Tracking event via API proxy:', event)

		fetch('/api/analytics', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				event,
				properties: {
					...properties,
					timestamp: new Date().toISOString(),
					userAgent: window.navigator.userAgent,
					url: window.location.href,
					referrer: document.referrer,
				}
			}),
			keepalive: true // Ensure request completes even if page unloads
		}).then(response => {
			if (response.ok) {
				console.log('✅ Event tracked successfully')
			}
		}).catch(error => {
			console.warn('⚠️ Analytics track failed:', error)
		})

		return Promise.resolve()
	},

	// Track weather-related events (non-blocking)
	trackWeatherEvent(event: string, properties?: Record<string, any>) {
		return this.track(`weather_${event}`, {
			...properties,
			category: 'weather'
		})
	},

	// Track user interactions (non-blocking)
	trackUserAction(action: string, properties?: Record<string, any>) {
		return this.track(`user_${action}`, {
			...properties,
			category: 'user_action'
		})
	},

	// Track app performance (non-blocking)
	trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
		return this.track('performance_metric', {
			metric,
			value,
			...properties,
			category: 'performance'
		})
	},

	// Track errors (non-blocking)
	trackError(error: string, properties?: Record<string, any>) {
		return this.track('error_occurred', {
			error,
			...properties,
			category: 'error'
		})
	},

	// Track feature usage (non-blocking)
	trackFeatureUsage(feature: string, properties?: Record<string, any>) {
		return this.track('feature_used', {
			feature,
			...properties,
			category: 'feature'
		})
	},

	// Test analytics connection
	testConnection() {
		console.log('🧪 Testing Analytics Connection...')
		this.track('analytics_test', {
			test: true,
			timestamp: new Date().toISOString()
		})
		return Promise.resolve(true)
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
