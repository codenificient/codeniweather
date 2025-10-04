import { NextRequest,NextResponse } from 'next/server'

export async function POST ( request: NextRequest ) {
	try {
		const body=await request.json()
		const { event,properties={} }=body

		// Get client IP and user agent
		const clientIP=request.headers.get( 'x-forwarded-for' )||
			request.headers.get( 'x-real-ip' )||
			'unknown'

		const userAgent=request.headers.get( 'user-agent' )||'unknown'

		// Get referrer
		const referrer=request.headers.get( 'referer' )||''

		// Enhanced properties with server-side data
		const enhancedProperties={
			...properties,
			timestamp: new Date().toISOString(),
			clientIP,
			userAgent,
			referrer,
			url: properties.url||'',
			// Add geolocation if available from headers (if using a service like Cloudflare)
			country: request.headers.get( 'cf-ipcountry' )||'unknown',
			city: request.headers.get( 'cf-ipcity' )||'unknown',
		}

		console.log( '📊 Analytics API - Tracking event:',event )
		console.log( '📊 Enhanced properties:',enhancedProperties )

		// Send to your analytics dashboard
		try {
			const analyticsResponse=await fetch( 'https://analytics-dashboard-phi-six.vercel.app/api/events',{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY||'proj_codeniweather_main'}`,
					'User-Agent': 'codeniweather/1.0'
				},
				body: JSON.stringify( {
					event,
					properties: enhancedProperties,
					source: 'codeniweather'
				} )
			} )

			if ( !analyticsResponse.ok ) {
				console.warn( `Analytics dashboard responded with status: ${analyticsResponse.status}` )
			} else {
				console.log( '✅ Analytics data sent to dashboard successfully' )
			}
		} catch ( analyticsError ) {
			console.warn( '⚠️ Failed to send to analytics dashboard:',analyticsError )
			// Continue execution even if analytics fails
		}

		return NextResponse.json( {
			success: true,
			message: 'Event tracked successfully',
			event,
			properties: enhancedProperties
		} )

	} catch ( error ) {
		console.error( '❌ Analytics API error:',error )
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to track event',
				message: error instanceof Error? error.message:'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export async function GET () {
	return NextResponse.json( {
		message: 'Analytics API is running',
		endpoints: {
			POST: '/api/analytics - Track events'
		}
	} )
}