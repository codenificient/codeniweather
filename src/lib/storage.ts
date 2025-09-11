import { Location } from '@/types/weather'

const STORAGE_KEY='codeniweather-locations'

export class StorageService {
	static getLocations (): Location[] {
		if ( typeof window==='undefined' ) return []

		try {
			const stored=localStorage.getItem( STORAGE_KEY )
			return stored? JSON.parse( stored ):[]
		} catch ( error ) {
			console.error( 'Error loading locations from storage:',error )
			return []
		}
	}

	static saveLocations ( locations: Location[] ): void {
		if ( typeof window==='undefined' ) return

		try {
			localStorage.setItem( STORAGE_KEY,JSON.stringify( locations ) )
		} catch ( error ) {
			console.error( 'Error saving locations to storage:',error )
		}
	}

	static addLocation ( location: Location ): void {
		const locations=this.getLocations()
		const exists=locations.some( loc =>
			loc.lat===location.lat&&loc.lon===location.lon
		)

		if ( !exists ) {
			locations.push( location )
			this.saveLocations( locations )
		}
	}

	static removeLocation ( locationId: string ): void {
		const locations=this.getLocations()
		const filtered=locations.filter( loc => loc.id!==locationId )
		this.saveLocations( filtered )
	}

	static clearLocations (): void {
		if ( typeof window==='undefined' ) return
		localStorage.removeItem( STORAGE_KEY )
	}
}
