'use client'

import { useEffect } from 'react'

export default function SettingsError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('Settings error:', error)
	}, [error])

	return (
		<div className="min-h-[60vh] flex items-center justify-center px-4">
			<div className="glass-card-strong rounded-3xl p-12 max-w-lg text-center">
				<div className="text-6xl mb-6">⚙️</div>
				<h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
					Settings failed to load
				</h2>
				<p className="text-slate-600 dark:text-slate-400 mb-8">
					Could not load your settings. Please try again.
				</p>
				<button
					onClick={() => reset()}
					className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200"
				>
					Try again
				</button>
			</div>
		</div>
	)
}
