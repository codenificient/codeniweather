'use client'

import PanelError from '@/components/PanelError'

export default function MapError ( {
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
} ) {
	return <PanelError scope="RADAR MAP" error={error} reset={reset} />
}
