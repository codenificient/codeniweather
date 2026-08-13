'use client'

import PanelError from '@/components/PanelError'

export default function CitiesError ( {
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
} ) {
	return <PanelError scope="CITIES" error={error} reset={reset} />
}
