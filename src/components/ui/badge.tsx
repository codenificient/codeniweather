import { cn } from "@/lib/utils"
import { cva,type VariantProps } from "class-variance-authority"
import * as React from "react"

const badgeVariants=cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				outline: "text-foreground",
				weather:
					"border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 shadow-lg backdrop-blur-sm",
				temperature:
					"border-transparent bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 shadow-lg backdrop-blur-sm",
				precipitation:
					"border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 shadow-lg backdrop-blur-sm",
				wind:
					"border-transparent bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 shadow-lg backdrop-blur-sm",
				pressure:
					"border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200 shadow-lg backdrop-blur-sm",
				radar:
					"border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200 shadow-lg backdrop-blur-sm",
				clouds:
					"border-transparent bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200 shadow-lg backdrop-blur-sm",
				frozen:
					"border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200 shadow-lg backdrop-blur-sm",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
)

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
	VariantProps<typeof badgeVariants> { }

function Badge ( { className,variant,...props }: BadgeProps ) {
	return (
		<div className={cn( badgeVariants( { variant } ),className )} {...props} />
	)
}

export { Badge,badgeVariants }
