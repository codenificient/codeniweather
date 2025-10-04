export interface AnalyticsEvent {
	event: string
	properties?: Record<string,any>
	namespace?: string
	timestamp?: number
	userId?: string
	sessionId?: string
}

export interface PageViewEvent extends AnalyticsEvent {
	event: 'page-view'
	properties: {
		page: string
		title?: string
		referrer?: string
		url?: string
		slug?: string
		[ key: string ]: any
	}
}

export interface WeatherEvent extends AnalyticsEvent {
	event: 'weather-action'
	properties: {
		action: string
		query?: string
		locationName?: string
		locationId?: string
		resultsCount?: number
		layer?: string
		days?: number
		interaction?: string
		page: string
		metadata?: Record<string,any>
		[ key: string ]: any
	}
}

export interface UserActionEvent extends AnalyticsEvent {
	event: 'user-action'
	properties: {
		action: string
		element?: string
		page: string
		value?: number
		metadata?: Record<string,any>
	}
}

export interface ErrorEvent extends AnalyticsEvent {
	event: 'error'
	properties: {
		error: string
		message: string
		stack?: string
		page: string
		context?: string
	}
}

export interface AnalyticsConfig {
	apiKey: string
	endpoint?: string
	debug?: boolean
	timeout?: number
	enabled?: boolean
	userId?: string
}

export interface AnalyticsData {
	totalVisitors: number
	visitorsToday: number
	avgVisitorsDaily: string
	topCountries: Array<{
		country: string
		count: number
	}>
	timeseriesData: Array<{
		date: string
		events: Array<{ [ key: string ]: number }>
	}>
}

export type CodeniWeatherEvent=
	|PageViewEvent
	|WeatherEvent
	|UserActionEvent
	|ErrorEvent
