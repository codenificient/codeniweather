import Link from 'next/link'

/**
 * 404 in the 1b idiom. There was no custom not-found before, so an unknown URL
 * fell through to Next's stock page — the one screen that carried none of the
 * app's design at all.
 */
export default function NotFound () {
	return (
		<div className="flex flex-col min-h-full">
			<div className="flex items-center gap-3.5 px-[26px] py-2.5 bg-[var(--alert-bg)] border-b border-[var(--alert-line)] font-mono text-xs tracking-[.04em] text-[var(--alert-ink)]">
				<span className="bg-accent text-[var(--accent-ink)] px-[7px] py-0.5 flex-shrink-0">
					404
				</span>
				<span>NO SUCH STATION</span>
			</div>

			<div className="px-[26px] py-10">
				<div className="font-mono text-[11px] tracking-[.14em] text-mute2 mb-3.5">
					DIAGNOSTIC
				</div>
				<div className="flex flex-col font-mono text-[13px] max-w-[640px]">
					<div className="flex justify-between gap-6 py-2 border-b border-line2">
						<span className="text-mute">MESSAGE</span>
						<span>This page does not exist</span>
					</div>
					<div className="flex justify-between gap-6 py-2">
						<span className="text-mute">SURFACE</span>
						<span>UNKNOWN ROUTE</span>
					</div>
				</div>

				<div className="flex flex-wrap gap-3 mt-6 font-mono text-[11px]">
					<Link
						href="/"
						className="px-[13px] py-2 bg-[var(--inv-bg)] text-[var(--inv-ink)]"
					>
						NOW
					</Link>
					<Link
						href="/cities"
						className="px-[13px] py-2 border border-line text-mute hover:text-ink transition-colors"
					>
						CITIES
					</Link>
					<Link
						href="/map"
						className="px-[13px] py-2 border border-line text-mute hover:text-ink transition-colors"
					>
						RADAR MAP
					</Link>
				</div>
			</div>
		</div>
	)
}
