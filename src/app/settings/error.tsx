'use client'

import PanelError from '@/components/PanelError'

export default function SettingsError ( {
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
} ) {
	return <PanelError scope="SETTINGS" error={error} reset={reset} />
}
