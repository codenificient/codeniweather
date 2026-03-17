export default function CitiesLoading() {
	return (
		<div className="w-full px-4 sm:px-6 lg:px-8 py-8 min-h-full">
			<div className="space-y-6 animate-pulse">
				<div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-48" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="glass-card rounded-2xl p-6">
							<div className="flex items-center space-x-4 mb-4">
								<div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
								<div className="space-y-2 flex-1">
									<div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32" />
									<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
								</div>
							</div>
							<div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16" />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
