// State boundaries data with center coordinates for badge positioning
export interface StateData {
	id: string
	name: string
	center: [ number,number ] // [longitude, latitude]
	bounds: {
		north: number
		south: number
		east: number
		west: number
	}
}

export const US_STATES: StateData[]=[
	{
		id: 'alabama',
		name: 'Alabama',
		center: [ -86.79113,32.806671 ],
		bounds: { north: 35.008,south: 30.223,east: -84.889,west: -88.473 }
	},
	{
		id: 'alaska',
		name: 'Alaska',
		center: [ -152.404419,61.370716 ],
		bounds: { north: 71.5388,south: 51.214,east: -129.99,west: -179.148 }
	},
	{
		id: 'arizona',
		name: 'Arizona',
		center: [ -111.431221,33.729759 ],
		bounds: { north: 37.002,south: 31.332,east: -109.045,west: -114.816 }
	},
	{
		id: 'arkansas',
		name: 'Arkansas',
		center: [ -92.373123,34.969704 ],
		bounds: { north: 36.501,south: 33.004,east: -89.644,west: -94.618 }
	},
	{
		id: 'california',
		name: 'California',
		center: [ -119.417932,36.116203 ],
		bounds: { north: 42.001,south: 32.528,east: -114.131,west: -124.409 }
	},
	{
		id: 'colorado',
		name: 'Colorado',
		center: [ -105.311104,39.059811 ],
		bounds: { north: 41.002,south: 36.993,east: -102.042,west: -109.045 }
	},
	{
		id: 'connecticut',
		name: 'Connecticut',
		center: [ -72.755371,41.597782 ],
		bounds: { north: 42.05,south: 40.98,east: -71.787,west: -73.727 }
	},
	{
		id: 'delaware',
		name: 'Delaware',
		center: [ -75.526755,39.161921 ],
		bounds: { north: 39.722,south: 38.451,east: -75.049,west: -75.789 }
	},
	{
		id: 'florida',
		name: 'Florida',
		center: [ -81.686783,27.766279 ],
		bounds: { north: 31.001,south: 24.396,east: -79.974,west: -87.634 }
	},
	{
		id: 'georgia',
		name: 'Georgia',
		center: [ -83.113531,33.040619 ],
		bounds: { north: 35.001,south: 30.356,east: -80.84,west: -85.605 }
	},
	{
		id: 'hawaii',
		name: 'Hawaii',
		center: [ -157.498337,21.094318 ],
		bounds: { north: 22.228,south: 18.91,east: -154.806,west: -162.057 }
	},
	{
		id: 'idaho',
		name: 'Idaho',
		center: [ -114.478828,44.240459 ],
		bounds: { north: 49.001,south: 41.988,east: -111.043,west: -117.243 }
	},
	{
		id: 'illinois',
		name: 'Illinois',
		center: [ -89.398528,40.349457 ],
		bounds: { north: 42.508,south: 36.97,east: -87.019,west: -91.513 }
	},
	{
		id: 'indiana',
		name: 'Indiana',
		center: [ -86.134986,39.849426 ],
		bounds: { north: 41.761,south: 37.771,east: -84.789,west: -88.098 }
	},
	{
		id: 'iowa',
		name: 'Iowa',
		center: [ -93.620866,42.011539 ],
		bounds: { north: 43.501,south: 40.375,east: -90.14,west: -96.64 }
	},
	{
		id: 'kansas',
		name: 'Kansas',
		center: [ -98.484246,38.526600 ],
		bounds: { north: 40.003,south: 36.993,east: -94.588,west: -102.051 }
	},
	{
		id: 'kentucky',
		name: 'Kentucky',
		center: [ -84.670067,37.668140 ],
		bounds: { north: 39.148,south: 36.497,east: -81.964,west: -89.571 }
	},
	{
		id: 'louisiana',
		name: 'Louisiana',
		center: [ -91.874912,31.169546 ],
		bounds: { north: 33.019,south: 28.928,east: -88.817,west: -94.043 }
	},
	{
		id: 'maine',
		name: 'Maine',
		center: [ -69.765261,44.323535 ],
		bounds: { north: 47.46,south: 43.064,east: -66.949,west: -71.084 }
	},
	{
		id: 'maryland',
		name: 'Maryland',
		center: [ -76.802101,39.063946 ],
		bounds: { north: 39.723,south: 37.886,east: -75.049,west: -79.488 }
	},
	{
		id: 'massachusetts',
		name: 'Massachusetts',
		center: [ -71.530106,42.230171 ],
		bounds: { north: 42.886,south: 41.237,east: -69.928,west: -73.508 }
	},
	{
		id: 'michigan',
		name: 'Michigan',
		center: [ -84.5467,43.326618 ],
		bounds: { north: 48.116,south: 41.696,east: -82.13,west: -90.418 }
	},
	{
		id: 'minnesota',
		name: 'Minnesota',
		center: [ -94.685899,45.694454 ],
		bounds: { north: 49.384,south: 43.501,east: -89.491,west: -97.239 }
	},
	{
		id: 'mississippi',
		name: 'Mississippi',
		center: [ -89.398528,32.741646 ],
		bounds: { north: 34.996,south: 30.173,east: -88.097,west: -91.652 }
	},
	{
		id: 'missouri',
		name: 'Missouri',
		center: [ -92.189283,38.456085 ],
		bounds: { north: 40.618,south: 35.995,east: -89.099,west: -95.774 }
	},
	{
		id: 'montana',
		name: 'Montana',
		center: [ -110.454353,47.052632 ],
		bounds: { north: 49.001,south: 44.358,east: -104.04,west: -116.05 }
	},
	{
		id: 'nebraska',
		name: 'Nebraska',
		center: [ -99.901813,41.125370 ],
		bounds: { north: 43.001,south: 39.999,east: -95.308,west: -104.053 }
	},
	{
		id: 'nevada',
		name: 'Nevada',
		center: [ -117.055374,38.313515 ],
		bounds: { north: 42.002,south: 35.001,east: -114.04,west: -120.006 }
	},
	{
		id: 'new-hampshire',
		name: 'New Hampshire',
		center: [ -71.565342,43.452492 ],
		bounds: { north: 45.305,south: 42.697,east: -70.61,west: -72.557 }
	},
	{
		id: 'new-jersey',
		name: 'New Jersey',
		center: [ -74.521011,40.298904 ],
		bounds: { north: 41.357,south: 38.925,east: -73.885,west: -75.559 }
	},
	{
		id: 'new-mexico',
		name: 'New Mexico',
		center: [ -106.248482,34.840515 ],
		bounds: { north: 37.000,south: 31.332,east: -103.002,west: -109.045 }
	},
	{
		id: 'new-york',
		name: 'New York',
		center: [ -74.948970,42.165726 ],
		bounds: { north: 45.015,south: 40.496,east: -71.856,west: -79.762 }
	},
	{
		id: 'north-carolina',
		name: 'North Carolina',
		center: [ -79.019299,35.630066 ],
		bounds: { north: 36.588,south: 33.83,east: -75.461,west: -84.322 }
	},
	{
		id: 'north-dakota',
		name: 'North Dakota',
		center: [ -101.002011,47.528912 ],
		bounds: { north: 49.001,south: 45.935,east: -96.554,west: -104.049 }
	},
	{
		id: 'ohio',
		name: 'Ohio',
		center: [ -82.764915,40.388783 ],
		bounds: { north: 42.323,south: 38.403,east: -80.519,west: -84.82 }
	},
	{
		id: 'oklahoma',
		name: 'Oklahoma',
		center: [ -97.534994,35.565342 ],
		bounds: { north: 37.001,south: 33.615,east: -94.431,west: -103.002 }
	},
	{
		id: 'oregon',
		name: 'Oregon',
		center: [ -122.070938,44.572021 ],
		bounds: { north: 46.292,south: 41.992,east: -116.463,west: -124.566 }
	},
	{
		id: 'pennsylvania',
		name: 'Pennsylvania',
		center: [ -77.194525,41.203321 ],
		bounds: { north: 42.269,south: 39.719,east: -74.689,west: -80.519 }
	},
	{
		id: 'rhode-island',
		name: 'Rhode Island',
		center: [ -71.51178,41.680893 ],
		bounds: { north: 42.018,south: 41.146,east: -71.12,west: -71.907 }
	},
	{
		id: 'south-carolina',
		name: 'South Carolina',
		center: [ -80.945007,33.856892 ],
		bounds: { north: 35.215,south: 32.034,east: -78.542,west: -83.354 }
	},
	{
		id: 'south-dakota',
		name: 'South Dakota',
		center: [ -99.901813,44.299782 ],
		bounds: { north: 45.945,south: 42.479,east: -96.436,west: -104.057 }
	},
	{
		id: 'tennessee',
		name: 'Tennessee',
		center: [ -86.781601,35.747845 ],
		bounds: { north: 36.678,south: 34.982,east: -81.647,west: -90.31 }
	},
	{
		id: 'texas',
		name: 'Texas',
		center: [ -99.901813,31.054487 ],
		bounds: { north: 36.501,south: 25.837,east: -93.508,west: -106.646 }
	},
	{
		id: 'utah',
		name: 'Utah',
		center: [ -111.892622,40.150032 ],
		bounds: { north: 42.001,south: 36.998,east: -109.045,west: -114.052 }
	},
	{
		id: 'vermont',
		name: 'Vermont',
		center: [ -72.731686,44.045876 ],
		bounds: { north: 45.011,south: 42.727,east: -71.465,west: -73.344 }
	},
	{
		id: 'virginia',
		name: 'Virginia',
		center: [ -78.169394,37.769337 ],
		bounds: { north: 39.466,south: 36.54,east: -75.242,west: -83.675 }
	},
	{
		id: 'washington',
		name: 'Washington',
		center: [ -121.490494,47.400902 ],
		bounds: { north: 49.002,south: 45.544,east: -116.916,west: -124.848 }
	},
	{
		id: 'west-virginia',
		name: 'West Virginia',
		center: [ -80.969579,38.491226 ],
		bounds: { north: 40.638,south: 37.201,east: -77.719,west: -82.644 }
	},
	{
		id: 'wisconsin',
		name: 'Wisconsin',
		center: [ -89.616508,44.268543 ],
		bounds: { north: 47.31,south: 42.482,east: -86.24,west: -92.889 }
	},
	{
		id: 'wyoming',
		name: 'Wyoming',
		center: [ -107.302490,42.755966 ],
		bounds: { north: 45.003,south: 40.996,east: -104.055,west: -111.056 }
	}
]

// Helper function to get state by coordinates
export const getStateByCoordinates=( lat: number,lng: number ): StateData|null => {
	return US_STATES.find( state =>
		lat>=state.bounds.south&&
		lat<=state.bounds.north&&
		lng>=state.bounds.west&&
		lng<=state.bounds.east
	)||null
}

// Helper function to get states within map bounds
export const getStatesInBounds=( bounds: { north: number,south: number,east: number,west: number } ): StateData[] => {
	return US_STATES.filter( state =>
		state.bounds.north>=bounds.south&&
		state.bounds.south<=bounds.north&&
		state.bounds.east>=bounds.west&&
		state.bounds.west<=bounds.east
	)
}
