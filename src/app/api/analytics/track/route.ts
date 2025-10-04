import type { AnalyticsResponse } from '@codenificient/analytics-sdk'
import { NextRequest,NextResponse } from 'next/server'

const ANALYTICS_ENDPOINT='https://analytics-dashboard-phi-six.vercel.app/api'
const API_KEY=process.env.NEXT_PUBLIC_ANALYTICS_API_KEY||'proj_codeniweather_main'

interface EventData {
	namespace: string
	eventType: string
	properties: Record<string,unknown>
}

interface AnalyticsApiPayload {
	apiKey: string
	events: EventData[]
}

export async function POST ( request: NextRequest ) {
	try {
		const body=await request.json()
		const { namespace,eventType,properties }=body

		// Validate required fields
		if ( !namespace||!eventType ) {
			return NextResponse.json(
				{ error: 'Missing required fields: namespace and eventType' },
				{ status: 400 }
			)
		}

		// Prepare the analytics payload
		const eventData: EventData={
			namespace,
			eventType,
			properties: properties||{}
		}

		const analyticsPayload: AnalyticsApiPayload={
			apiKey: API_KEY,
			events: [ eventData ]
		}

		// Add headers to make the request look legitimate
		const headers: HeadersInit={
			'Content-Type': 'application/json',
			'User-Agent': 'CodeniWeather/1.0 (+https://codeniweather.app)',
			'Accept': 'application/json',
			'X-Forwarded-For': request.headers.get( 'x-forwarded-for' )||request.headers.get( 'x-real-ip' )||'127.0.0.1',
			'X-Forwarded-Proto': request.headers.get( 'x-forwarded-proto' )||'https',
			'X-Forwarded-Host': request.headers.get( 'host' )||'localhost:3000',
		}

		// Make the request to the analytics service
		const response=await fetch( `${ANALYTICS_ENDPOINT}/events`,{
			method: 'POST',
			headers,
			body: JSON.stringify( analyticsPayload ),
		} )

		if ( !response.ok ) {
			const errorText=await response.text()
			console.error( '❌ Analytics API error:',{
				status: response.status,
				statusText: response.statusText,
				error: errorText
			} )

			return NextResponse.json(
				{
					success: false,
					error: 'Analytics request failed',
					details: errorText,
					status: response.status
				},
				{ status: response.status }
			)
		}

		const data: AnalyticsResponse=await response.json()

		// Log successful analytics request (only in development)
		if ( process.env.NODE_ENV==='development' ) {
			console.log( '✅ Analytics event tracked:',{
				namespace,
				eventType,
				success: data.success
			} )
		}

		return NextResponse.json( data )

	} catch ( error ) {
		console.error( '❌ Analytics track API error:',error )

		return NextResponse.json(
			{
				success: false,
				error: 'Internal server error',
				details: error instanceof Error? error.message:'Unknown error'
			},
			{ status: 500 }
		)
	}
}
