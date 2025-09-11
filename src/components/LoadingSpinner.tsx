'use client'

import { motion } from 'framer-motion'
import React from 'react'

interface LoadingSpinnerProps {
	size?: 'sm'|'md'|'lg'
	text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps>=( {
	size='md',
	text='Loading...'
} ) => {
	const sizeClasses={
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
	}

	return (
		<div className="flex flex-col items-center justify-center space-y-3">
			<motion.div
				className={`${sizeClasses[ size ]} border-2 border-blue-300 border-t-transparent rounded-full`}
				animate={{ rotate: 360 }}
				transition={{
					duration: 1,
					repeat: Infinity,
					ease: 'linear',
				}}
			/>
			{text&&(
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="text-blue-200 text-sm"
				>
					{text}
				</motion.p>
			)}
		</div>
	)
}

export default LoadingSpinner
