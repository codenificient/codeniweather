import { NextRequest, NextResponse } from 'next/server'

const ANALYTICS_ENDPOINT = 'https://analytics-dashboard-phi-six.vercel.app/api/events'
const ANALYTICS_API_KEY = process.env.ANALYTICS_API_KEY || 'proj_codeniweather_main'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const { event, properties = {} } = body

		// Get client IP and user agent from request headers
		const clientIP = request.headers.get('x-forwarded-for') ||
			request.headers.get('x-real-ip') ||
			'unknown'

		const userAgent = request.headers.get('user-agent') || 'unknown'
		const referrer = request.headers.get('referer') || ''

		// Enhanced properties with server-side data
		const enhancedProperties = {
			...properties,
			timestamp: new Date().toISOString(),
			clientIP,
			userAgent,
			referrer,
			url: properties.url || '',
			// Add geolocation if available from headers (Cloudflare/Vercel)
			country: request.headers.get('x-vercel-ip-country') ||
					 request.headers.get('cf-ipcountry') ||
					 'unknown',
			city: request.headers.get('x-vercel-ip-city') ||
				  request.headers.get('cf-ipcity') ||
				  'unknown',
		}

		console.log('📊 Analytics API - Tracking event:', event)
		console.log('📊 Enhanced properties:', enhancedProperties)

		// Send to analytics dashboard with correct payload structure
		const analyticsResponse = await fetch(ANALYTICS_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${ANALYTICS_API_KEY}`,
				'User-Agent': 'codeniweather/1.0'
			},
			body: JSON.stringify({
				event,
				properties: enhancedProperties,
				source: 'codeniweather'
			})
		})

		if (!analyticsResponse.ok) {
			console.warn(`Analytics dashboard responded with status: ${analyticsResponse.status}`)
			const errorText = await analyticsResponse.text()
			console.warn('Response:', errorText)
		} else {
			console.log('✅ Analytics data sent to dashboard successfully')
		}

		return NextResponse.json({
			success: true,
			message: 'Event tracked successfully',
			event,
			properties: enhancedProperties
		})

	} catch (error) {
		console.error('❌ Analytics API error:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to track event',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export async function GET() {
	return NextResponse.json({
		message: 'Analytics API is running',
		endpoints: {
			POST: '/api/analytics - Track events'
		}
	})
}
