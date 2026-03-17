import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
	const response = NextResponse.next()

	// Security headers
	response.headers.set('X-Frame-Options', 'DENY')
	response.headers.set('X-Content-Type-Options', 'nosniff')
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
	response.headers.set('X-DNS-Prefetch-Control', 'on')

	// Rate-limit analytics API routes (basic protection)
	if (request.nextUrl.pathname.startsWith('/api/analytics')) {
		const origin = request.headers.get('origin')
		const host = request.headers.get('host')

		// Block requests without proper origin in production
		if (process.env.NODE_ENV === 'production' && !origin && request.method === 'POST') {
			return NextResponse.json(
				{ error: 'Forbidden' },
				{ status: 403 }
			)
		}

		// Add CORS headers for API routes
		if (origin) {
			response.headers.set('Access-Control-Allow-Origin', origin)
			response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
			response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
		}

		// Handle preflight
		if (request.method === 'OPTIONS') {
			return new NextResponse(null, {
				status: 204,
				headers: response.headers,
			})
		}
	}

	return response
}

export const config = {
	matcher: [
		// Match all routes except static files and Next.js internals
		'/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
	],
}
