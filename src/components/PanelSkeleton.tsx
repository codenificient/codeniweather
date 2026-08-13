import React from 'react'

interface PanelSkeletonProps {
	/** Status line, e.g. "ACQUIRING STATION DATA". The ellipsis is added here. */
	label: string
	/** Number of hairline-separated placeholder panels to draw. */
	panels?: number
	/** Columns those panels are laid out in, matching the loaded screen. */
	columns?: 1|2|3
	/** Draw a large block below the panels, for screens whose body is a map. */
	block?: boolean
}

/**
 * Loading state in the 1b idiom: a mono status line over hairline-separated
 * placeholder cells laid out like the screen that is arriving, so the page does
 * not reflow when the real content lands. No spinners — the design has none.
 */
export default function PanelSkeleton ( {
	label,panels=3,columns=3,block=false,
}: PanelSkeletonProps ) {
	const cols=columns===1? 'grid-cols-1':columns===2? 'grid-cols-1 lg:grid-cols-2':'grid-cols-1 lg:grid-cols-3'

	return (
		<div className="flex flex-col min-h-full">
			<div className="px-[26px] py-4 border-b border-line">
				<span className="font-mono text-[11px] tracking-[.14em] text-mute2">
					{label}…
				</span>
			</div>

			<div className={`grid ${cols} gap-px bg-line border-b border-line`}>
				{Array.from( { length: panels } ).map( ( _,i ) => (
					<div key={i} className="bg-bg p-[26px]">
						<Bar w="w-24" />
						<Bar w="w-40" h="h-6" className="mt-3" />
						<div className="grid grid-cols-2 gap-x-3.5 gap-y-4 mt-6">
							{Array.from( { length: 4 } ).map( ( __,j ) => (
								<div key={j}>
									<Bar w="w-10" />
									<Bar w="w-16" h="h-4" className="mt-1.5" />
								</div>
							) )}
						</div>
					</div>
				) )}
			</div>

			{block&&(
				<div className="px-[26px] py-[22px]">
					<Bar w="w-32" className="mb-3.5" />
					<div className="h-[300px] border border-line bg-panel" />
				</div>
			)}
		</div>
	)
}

const Bar=( { w,h='h-2.5',className='' }: { w: string; h?: string; className?: string } ) => (
	<div className={`${w} ${h} bg-panel2 ${className}`} />
)
