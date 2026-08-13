import PanelSkeleton from '@/components/PanelSkeleton'

export default function RootLoading () {
	return <PanelSkeleton label="ACQUIRING STATION DATA" panels={3} columns={3} block />
}
