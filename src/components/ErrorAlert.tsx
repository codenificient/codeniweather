'use client'

import { motion } from 'framer-motion'
// Icons replaced with emojis
import React from 'react'

interface ErrorAlertProps {
	error: {
		message: string
		code?: string
	}
	onDismiss?: () => void
	onRetry?: () => void
	onSearch?: () => void
}

const ErrorAlert: React.FC<ErrorAlertProps>=( { error,onDismiss,onRetry,onSearch } ) => {
	const isGeolocationError=error.code==='GEOLOCATION_ERROR'
	const isTimeoutError=error.message.includes( 'timed out' )
	const isPermissionError=error.message.includes( 'denied' )

	return (
		<motion.div
			initial={{ opacity: 0,y: -20 }}
			animate={{ opacity: 1,y: 0 }}
			exit={{ opacity: 0,y: -20 }}
			className="bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl p-4"
		>
			<div className="flex items-start space-x-3">
				<span className="text-red-300 flex-shrink-0 mt-0.5 text-lg">⚠️</span>
				<div className="flex-1">
					<h4 className="text-red-200 font-medium mb-1">
						{isGeolocationError? 'Location Error':'Error'}
					</h4>
					<p className="text-red-300 text-sm mb-2">{error.message}</p>

					{/* Geolocation-specific help */}
					{isGeolocationError&&(
						<div className="mt-3 space-y-2">
							{isTimeoutError&&(
								<div className="text-red-400 text-xs">
									<p>• Check your internet connection</p>
									<p>• Try searching for a city manually</p>
								</div>
							)}
							{isPermissionError&&(
								<div className="text-red-400 text-xs">
									<p>• Enable location permissions in your browser</p>
									<p>• Look for the location icon in your address bar</p>
								</div>
							)}
							{!isTimeoutError&&!isPermissionError&&(
								<div className="text-red-400 text-xs">
									<p>• Try searching for a city manually</p>
									<p>• Check your GPS settings</p>
								</div>
							)}
						</div>
					)}

					{/* Action buttons */}
					<div className="flex flex-wrap gap-2 mt-3">
						{onRetry&&(
							<button
								onClick={onRetry}
								className="inline-flex items-center px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 dark:bg-red-500/30 dark:hover:bg-red-500/40 text-red-700 dark:text-red-300 text-xs rounded-lg transition-colors"
							>
								<span className="mr-1 text-sm">🔄</span>
								Try Again
							</button>
						)}
						{onSearch&&(
							<button
								onClick={onSearch}
								className="inline-flex items-center px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 dark:bg-blue-500/30 dark:hover:bg-blue-500/40 text-blue-700 dark:text-blue-300 text-xs rounded-lg transition-colors"
							>
								<span className="mr-1 text-sm">📍</span>
								Search City
							</button>
						)}
					</div>

					{error.code&&(
						<p className="text-red-400 text-xs mt-2">Code: {error.code}</p>
					)}
				</div>
				{onDismiss&&(
					<button
						onClick={onDismiss}
						className="text-red-300 dark:text-red-400 hover:text-red-200 dark:hover:text-red-300 transition-colors"
						aria-label="Dismiss error"
					>
						<span className="text-lg">✕</span>
					</button>
				)}
			</div>
		</motion.div>
	)
}

export default ErrorAlert
