'use client'

import { motion } from 'framer-motion'
import { Menu,X } from 'lucide-react'
import React,{ useState } from 'react'
import Footer from './Footer'
import Sidebar from './Sidebar'

interface ClientLayoutProps {
	children: React.ReactNode
}

const ClientLayout: React.FC<ClientLayoutProps>=( { children } ) => {
	const [ sidebarOpen,setSidebarOpen ]=useState( true )

	const toggleSidebar=() => {
		setSidebarOpen( !sidebarOpen )
	}

	return (
		<div className="h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-[#0b0b0b] dark:via-[#1b1b1b] dark:to-[#0b0b0b] overflow-hidden">
			{/* Animated Background Pattern */}
			<div className="absolute inset-0 opacity-30 animate-pulse" style={{
				backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
			}}></div>

			{/* Floating Elements */}
			<div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse bg-blue-200/20 dark:bg-blue-500/5"></div>
			<div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 bg-indigo-200/20 dark:bg-indigo-500/5"></div>
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-2xl animate-pulse delay-500 bg-cyan-200/10 dark:bg-cyan-500/3"></div>

			<div className="relative z-10 flex flex-1 h-full">
				{/* Sidebar - Fixed */}
				<div className="flex-shrink-0">
					<Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
				</div>

				{/* Main Content Area - Scrollable */}
				<div className="flex-1 flex flex-col h-full overflow-hidden">
					{/* Mobile Header - Fixed */}
					<div className="lg:hidden bg-white/80 backdrop-blur-md border-b border-white/20 flex-shrink-0 z-30">
						<div className="flex items-center justify-between p-4">
							<button
								onClick={toggleSidebar}
								className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
							>
								{sidebarOpen? (
									<X className="w-6 h-6 text-slate-600" />
								):(
									<Menu className="w-6 h-6 text-slate-600" />
								)}
							</button>
							<h1 className="text-xl font-bold text-slate-800">CodeniWeather</h1>
							<div className="w-10" /> {/* Spacer for centering */}
						</div>
					</div>

					{/* Scrollable Content Area */}
					<div className="flex-1 overflow-y-auto overflow-x-hidden">
						<motion.main
							initial={{ opacity: 0,y: 20 }}
							animate={{ opacity: 1,y: 0 }}
							transition={{ duration: 0.5 }}
							className="h-full"
						>
							{children}
						</motion.main>
					</div>

					{/* Footer - Fixed */}
					<div className="flex-shrink-0">
						<Footer />
					</div>
				</div>
			</div>
		</div>
	)
}

export default ClientLayout
