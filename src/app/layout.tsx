import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter=Inter( { subsets: [ 'latin' ] } )

export const metadata: Metadata={
	title: '🌤️ CodeniWeather - Your Personal Weather Companion',
	description: 'A modern weather app built with Next.js 14. Track weather for multiple locations with real-time updates.',
	keywords: 'weather, forecast, temperature, locations, Next.js, React',
	authors: [ { name: 'Codenificient' } ],
	icons: {
		icon: [
			{ url: '/favicon.svg',type: 'image/svg+xml' },
			{ url: '/favicon-16x16.png',sizes: '16x16',type: 'image/png' },
			{ url: '/favicon-32x32.png',sizes: '32x32',type: 'image/png' },
		],
		apple: [
			{ url: '/apple-touch-icon.png',sizes: '180x180',type: 'image/png' },
		],
		shortcut: '/favicon.ico',
	},
	manifest: '/site.webmanifest',
}

export const viewport={
	width: 'device-width',
	initialScale: 1,
	themeColor: '#1e40af',
}

export default function RootLayout ( {
	children,
}: {
	children: React.ReactNode
} ) {
	return (
		<html lang="en">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
			</head>
			<body className={inter.className}>
				{children}
			</body>
		</html>
	)
}
