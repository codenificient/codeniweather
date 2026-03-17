export default function SettingsLoading() {
	return (
		<div className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-full">
			<div className="space-y-8 animate-pulse">
				<div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-36" />
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="glass-card rounded-2xl p-6">
						<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-4" />
						<div className="space-y-3">
							<div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full" />
							<div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
