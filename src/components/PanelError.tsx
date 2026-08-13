'use client'

import { useEffect } from 'react'

interface PanelErrorProps {
	/** Which surface failed, e.g. "CITIES". Shown in the advisory badge. */
	scope: string
	error: Error & { digest?: string }
	reset: () => void
}

/**
 * Route error boundary in the 1b idiom.
 *
 * Reuses the advisory strip the design already defines for weather alerts
 * (--alert-bg / --alert-line / --alert-ink), so a failure reads as another
 * instrument reading rather than a separate visual language.
 *
 * The error's own message is shown rather than a generic apology: this app
 * fails mostly on upstream API problems, and "Invalid API key" is far more
 * actionable than "Something went wrong".
 */
export default function PanelError ( { scope,error,reset }: PanelErrorProps ) {
	useEffect( () => {
		console.error( `${scope} error:`,error )
	},[ scope,error ] )

	return (
		<div className="flex flex-col min-h-full">
			<div className="flex items-center gap-3.5 px-[26px] py-2.5 bg-[var(--alert-bg)] border-b border-[var(--alert-line)] font-mono text-xs tracking-[.04em] text-[var(--alert-ink)]">
				<span className="bg-accent text-[var(--accent-ink)] px-[7px] py-0.5 flex-shrink-0">
					FAULT
				</span>
				<span className="flex-1 min-w-0 truncate">{scope}</span>
			</div>

			<div className="px-[26px] py-10">
				<div className="font-mono text-[11px] tracking-[.14em] text-mute2 mb-3.5">
					DIAGNOSTIC
				</div>
				<div className="flex flex-col font-mono text-[13px] max-w-[640px]">
					<div className="flex justify-between gap-6 py-2 border-b border-line2">
						<span className="text-mute flex-shrink-0">MESSAGE</span>
						<span className="text-right break-words">{error.message||'UNKNOWN'}</span>
					</div>
					{error.digest&&(
						<div className="flex justify-between gap-6 py-2 border-b border-line2">
							<span className="text-mute flex-shrink-0">DIGEST</span>
							<span className="text-right">{error.digest}</span>
						</div>
					)}
					<div className="flex justify-between gap-6 py-2">
						<span className="text-mute flex-shrink-0">SURFACE</span>
						<span className="text-right">{scope}</span>
					</div>
				</div>

				<button
					onClick={reset}
					className="mt-6 font-mono text-[11px] px-[13px] py-2 bg-[var(--inv-bg)] text-[var(--inv-ink)]"
				>
					RETRY
				</button>
			</div>
		</div>
	)
}
