import PanelSkeleton from '@/components/PanelSkeleton'

export default function CityLoading () {
	return <PanelSkeleton label="ACQUIRING STATION DATA" panels={4} columns={2} block />
}
