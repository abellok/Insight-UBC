export default class Building {
	private buildingFullName: string;
	private buildingShortName: string;
	private buildingAddress: string;
	private buildingLat: number;
	private buildingLon: number;
	private buildingHRef: string;

	constructor(fullName: string, shortName: string, address: string,
		lat: number, lon: number, hRef: string) {
		this.buildingFullName = fullName;
		this.buildingShortName = shortName;
		this.buildingAddress = address;
		this.buildingLat = lat;
		this.buildingLon = lon;
		this.buildingHRef = hRef;
	}

	public getBuildingFullName(): string {
		return this.buildingFullName;
	}

	public getBuildingShortName() {
		return this.buildingShortName;
	}

	public getBuildingAddress() {
		return this.buildingAddress;
	}

	public getBuildingLat() {
		return this.buildingLat;
	}

	public getBuildingLon() {
		return this.buildingLon;
	}

	public getBuildingHRef() {
		return this.buildingHRef;
	}
}
