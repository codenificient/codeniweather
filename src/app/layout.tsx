import ClientLayout from '@/components/ClientLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { WeatherProvider } from '@/contexts/WeatherContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter=Inter( {
	subsets: [ 'latin' ],
	display: 'swap',
	variable: '--font-inter',
} )

export const metadata: Metadata={
	title: 'CodeniWeather - Weather Companion',
	description: 'A modern weather app built with Next.js 14. Track weather for multiple locations with real-time updates.',
	keywords: 'weather, forecast, temperature, locations, Next.js, React',
	authors: [ { name: 'CodenificienT' } ],
	icons: {
		icon: [
			{ url: '/favicon.ico',sizes: 'any' },
			{ url: '/favicon.svg',type: 'image/svg+xml' },
		],
		apple: [
			{ url: '/favicon.svg',sizes: '180x180',type: 'image/svg+xml' },
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
		<html lang="en" className={inter.variable}>
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/favicon.svg" />
			</head>
			<body className={`${inter.className} font-sans`}>
				{/* Animated background gradient orbs */}
				<div className="gradient-orb-1"></div>
				<div className="gradient-orb-2"></div>
				<div className="gradient-orb-3"></div>
				<div className="gradient-orb-4"></div>

				<ThemeProvider>
					<WeatherProvider>
						<ClientLayout>
							{children}
						</ClientLayout>
					</WeatherProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
