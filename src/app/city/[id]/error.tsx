'use client'

import PanelError from '@/components/PanelError'

export default function CityError ( {
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
} ) {
	return <PanelError scope="CITY DETAIL" error={error} reset={reset} />
}
