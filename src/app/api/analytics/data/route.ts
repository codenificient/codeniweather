import { NextRequest,NextResponse } from 'next/server'

const ANALYTICS_ENDPOINT=process.env.ANALYTICS_ENDPOINT||'https://analytics-dashboard-phi-six.vercel.app/api'
const ANALYTICS_API_KEY=process.env.ANALYTICS_API_KEY||process.env.NEXT_PUBLIC_ANALYTICS_API_KEY||'proj_codeniweather_main'

export async function GET ( request: NextRequest ) {
	try {
		if ( !ANALYTICS_API_KEY ) {
			return NextResponse.json(
				{ error: 'Analytics API key not configured' },
				{ status: 500 }
			)
		}

		const { searchParams }=new URL( request.url )
		const projectId=searchParams.get( 'projectId' )
		const startDate=searchParams.get( 'startDate' )
		const endDate=searchParams.get( 'endDate' )

		// Build query parameters
		const queryParams=new URLSearchParams()
		queryParams.append( 'apiKey',ANALYTICS_API_KEY )
		if ( projectId ) queryParams.append( 'projectId',projectId )
		if ( startDate ) queryParams.append( 'startDate',startDate )
		if ( endDate ) queryParams.append( 'endDate',endDate )

		const url=`${ANALYTICS_ENDPOINT}/analytics?${queryParams.toString()}`

		// Forward to analytics service
		const response=await fetch( url,{
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${ANALYTICS_API_KEY}`,
				'X-API-Key': ANALYTICS_API_KEY,
				'User-Agent': 'CodeniWeather/1.0 (+https://codeniweather.app)',
				'Accept': 'application/json',
			},
		} )

		if ( !response.ok ) {
			const errorText=await response.text()
			console.error( '❌ Analytics data API error:',response.status,errorText )
			return NextResponse.json(
				{ error: 'Failed to fetch analytics data',details: errorText },
				{ status: response.status }
			)
		}

		const data=await response.json()

		// Log successful request (only in development)
		if ( process.env.NODE_ENV==='development' ) {
			console.log( '✅ Analytics data fetched successfully' )
		}

		return NextResponse.json( data )

	} catch ( error ) {
		console.error( '❌ Analytics data fetch error:',error )
		return NextResponse.json(
			{
				error: 'Internal server error',
				details: error instanceof Error? error.message:'Unknown error'
			},
			{ status: 500 }
		)
	}
}

export async function POST () {
	return NextResponse.json(
		{ error: 'Method not allowed' },
		{ status: 405 }
	)
}
