export default function CityDetailLoading() {
	return (
		<div className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-full">
			<div className="space-y-8 animate-pulse">
				<div className="glass-card-strong rounded-3xl p-8">
					<div className="flex items-center space-x-8">
						<div className="w-28 h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
						<div className="space-y-4 flex-1">
							<div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-48" />
							<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
							<div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-24" />
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="glass-card rounded-2xl p-6">
							<div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-4" />
							<div className="space-y-3">
								<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
								<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
