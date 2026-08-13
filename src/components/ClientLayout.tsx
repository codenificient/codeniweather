'use client'

import { Menu,X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React,{ useState } from 'react'
import Sidebar from './Sidebar'

interface ClientLayoutProps {
	children: React.ReactNode
}

/**
 * 1b instrument-panel shell: a fixed 208px rail beside a single scrolling
 * column, both drawn straight on --bg. The previous shell layered gradients,
 * blurred orbs and a dot pattern behind the content; the design is deliberately
 * flat, so those are gone rather than restyled.
 */
const ClientLayout: React.FC<ClientLayoutProps>=( { children } ) => {
	const [ sidebarOpen,setSidebarOpen ]=useState( false )
	const pathname=usePathname()

	// City detail (2c) is drawn full-bleed in the design — it carries its own
	// "← CITIES" affordance instead of the rail.
	const showRail=!pathname?.startsWith( '/city/' )

	const toggleSidebar=() => {
		setSidebarOpen( !sidebarOpen )
	}

	return (
		<div className="h-screen flex bg-bg text-ink overflow-hidden">
			<div className="flex flex-1 h-full">
				{showRail&&<Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />}

				<div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
					{/* Mobile header — the rail is off-canvas below lg */}
					<div className={`${showRail? 'lg:hidden':'hidden'} flex-shrink-0 border-b border-line bg-bg`}>
						<div className="flex items-center justify-between px-4 py-3">
							<button
								onClick={toggleSidebar}
								className="p-2 text-mute hover:text-ink transition-colors"
								aria-label={sidebarOpen? 'Close navigation':'Open navigation'}
							>
								{sidebarOpen? <X className="w-5 h-5" />:<Menu className="w-5 h-5" />}
							</button>
							<div className="flex items-center gap-2.5">
								<span className="w-2.5 h-2.5 bg-accent" />
								<span className="font-mono text-xs tracking-[.14em]">CODENIWEATHER</span>
							</div>
							<div className="w-9" />
						</div>
					</div>

					<div className="flex-1 overflow-y-auto overflow-x-hidden">
						<main className="min-h-full">
							{children}
						</main>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ClientLayout
