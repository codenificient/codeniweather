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
			{ url: '/favicon.svg',type: 'image/svg+xml' },
			{ url: '/favicon-16x16.png',sizes: '16x16',type: 'image/png' },
			{ url: '/favicon-32x32.png',sizes: '32x32',type: 'image/png' },
		],
		apple: [
			{ url: '/apple-touch-icon.png',sizes: '180x180',type: 'image/png' },
		],
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
			<body className={`${inter.className} font-sans`}>
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
