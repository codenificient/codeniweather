export default function MapLoading() {
	return (
		<div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
			<div className="glass-card-strong rounded-3xl p-12 text-center animate-pulse">
				<div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />
				<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mx-auto mb-4" />
				<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64 mx-auto" />
			</div>
		</div>
	)
}
