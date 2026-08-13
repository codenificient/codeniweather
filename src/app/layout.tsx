import ClientLayout from '@/components/ClientLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { WeatherProvider } from '@/contexts/WeatherContext'
import type { Metadata } from 'next'
import { Geist,JetBrains_Mono } from 'next/font/google'
import './globals.css'

// The 1b instrument-panel design pairs Geist for UI text with JetBrains Mono
// for every readout (temperatures, wind, pressure) so figures stay column-
// aligned across cards.
const geist=Geist( {
	subsets: [ 'latin' ],
	display: 'swap',
	weight: [ '300','400','500','600' ],
	variable: '--font-geist',
} )

const jetbrainsMono=JetBrains_Mono( {
	subsets: [ 'latin' ],
	display: 'swap',
	weight: [ '300','400','500' ],
	variable: '--font-mono',
} )

export const metadata: Metadata={
	title: 'CodeniWeather - Weather Companion',
	description: 'A modern weather app built with Next.js 14. Track weather for multiple locations with real-time updates, interactive maps, and beautiful forecasts.',
	keywords: 'weather, forecast, temperature, locations, Next.js, React, weather app, weather companion',
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
		<html lang="en" className={`${geist.variable} ${jetbrainsMono.variable}`}>
			<head>
        <script defer src="/a/script.js" data-host-url="/a" data-website-id="000208fa-ccd0-4f92-9d30-37ff05d7ae67"></script>
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/favicon.svg" />
			</head>
			<body className={`${geist.className} font-sans`}>
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
