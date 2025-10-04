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
			const payload={
				projectId: process.env.ANALYTICS_API_KEY||'proj_codeniweather_main',
				event,
				properties: enhancedProperties,
				source: 'codeniweather',
				timestamp: enhancedProperties.timestamp
			}

			console.log( '📤 Sending to analytics dashboard:',JSON.stringify( payload,null,2 ) )

			const analyticsResponse=await fetch( 'https://analytics-dashboard-phi-six.vercel.app/api/events',{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY||'proj_codeniweather_main'}`,
					'User-Agent': 'codeniweather/1.0'
				},
				body: JSON.stringify( payload )
			} )

			if ( !analyticsResponse.ok ) {
				const errorText=await analyticsResponse.text()
				console.warn( `❌ Analytics dashboard responded with status: ${analyticsResponse.status}` )
				console.warn( `❌ Response body:`,errorText )
			} else {
				const responseData=await analyticsResponse.json()
				console.log( '✅ Analytics data sent to dashboard successfully' )
				console.log( '✅ Response:',responseData )
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

export async function GET ( request: NextRequest ) {
	try {
		const { searchParams }=new URL( request.url )

		// Build query string for filtering
		const queryParams: Record<string,string>={}

		// Optional filters
		if ( searchParams.get( 'namespace' ) ) queryParams.namespace=searchParams.get( 'namespace' )!
		if ( searchParams.get( 'eventType' ) ) queryParams.eventType=searchParams.get( 'eventType' )!
		if ( searchParams.get( 'startDate' ) ) queryParams.startDate=searchParams.get( 'startDate' )!
		if ( searchParams.get( 'endDate' ) ) queryParams.endDate=searchParams.get( 'endDate' )!
		if ( searchParams.get( 'groupBy' ) ) queryParams.groupBy=searchParams.get( 'groupBy' )!
		if ( searchParams.get( 'limit' ) ) queryParams.limit=searchParams.get( 'limit' )!

		const queryString=new URLSearchParams( queryParams ).toString()
		const analyticsUrl=`https://analytics-dashboard-phi-six.vercel.app/api/analytics${queryString? `?${queryString}`:''}`

		console.log( '📊 Fetching analytics from:',analyticsUrl )

		// Fetch analytics data from remote dashboard
		const response=await fetch( analyticsUrl,{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY||'proj_codeniweather_main'}`,
				'User-Agent': 'codeniweather/1.0'
			}
		} )

		if ( !response.ok ) {
			const errorText=await response.text()
			console.warn( `❌ Analytics dashboard responded with status: ${response.status}` )
			console.warn( `❌ Response body:`,errorText )
			return NextResponse.json(
				{
					success: false,
					error: 'Failed to fetch analytics',
					message: `Dashboard responded with ${response.status}`
				},
				{ status: response.status }
			)
		}

		const data=await response.json()
		console.log( '✅ Analytics data fetched successfully' )
		console.log( '📈 Total Visitors:',data.totalVisitors )

		return NextResponse.json( data )

	} catch ( error ) {
		console.error( '❌ Analytics API GET error:',error )
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch analytics',
				message: error instanceof Error? error.message:'Unknown error'
			},
			{ status: 500 }
		)
	}
}