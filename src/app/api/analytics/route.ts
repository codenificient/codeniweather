import { NextRequest, NextResponse } from 'next/server'

const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || 'https://analytics-dashboard-phi-six.vercel.app/api'

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		// Forward the request to the actual analytics endpoint
		const response = await fetch(ANALYTICS_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body)
		})

		const data = await response.json()

		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Analytics proxy error:', error)
		return NextResponse.json(
			{ success: false, error: 'Analytics tracking failed' },
			{ status: 500 }
		)
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const queryString = searchParams.toString()

		// Forward GET requests (for analytics data retrieval)
		const response = await fetch(`${ANALYTICS_ENDPOINT}${queryString ? `?${queryString}` : ''}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		})

		const data = await response.json()

		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Analytics proxy error:', error)
		return NextResponse.json(
			{ success: false, error: 'Analytics data retrieval failed' },
			{ status: 500 }
		)
	}
}
