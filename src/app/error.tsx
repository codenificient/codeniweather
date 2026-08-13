'use client'

import PanelError from '@/components/PanelError'

export default function RootError ( {
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
} ) {
	return <PanelError scope="APPLICATION" error={error} reset={reset} />
}
