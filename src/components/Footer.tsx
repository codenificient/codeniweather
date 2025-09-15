import { motion } from 'framer-motion'
import React from 'react'

const Footer: React.FC=() => {
	return (
		<motion.footer
			initial={{ opacity: 0,y: 20 }}
			animate={{ opacity: 1,y: 0 }}
			transition={{ duration: 0.6,ease: "easeOut" }}
			className="w-full py-4 border-t border-slate-200/30 dark:border-white/10 bg-white/10 backdrop-blur-sm shadow-lg shadow-slate-200/20 -mt-1"
		>
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
					{/* Brand and Copyright Combined */}
					<div className="flex items-center space-x-2">
						<img
							src="/favicon.svg"
							alt="CodeniWeather"
							className="w-4 h-4"
						/>
						<span className="text-xs text-slate-600 dark:text-slate-400 font-medium">CodeniWeather © 2025</span>
					</div>

					{/* Powered by MapTiler */}
					<div className="flex items-center space-x-2">
						<span className="text-xs text-slate-500 dark:text-slate-400">Powered by</span>
						<a
							href="https://www.maptiler.com"
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
						>
							MapTiler
						</a>
					</div>

					{/* Made with Love */}
					<div className="flex items-center space-x-1">
						<span className="text-xs text-slate-500 dark:text-slate-400">Made with</span>
						<span className="text-red-500 text-sm">❤️</span>
						<span className="text-xs text-slate-500 dark:text-slate-400">by</span>
						<a
							href="https://tioye.dev"
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
						>
							CodenificienT
						</a>
					</div>
				</div>
			</div>
		</motion.footer>
	)
}

export default Footer
