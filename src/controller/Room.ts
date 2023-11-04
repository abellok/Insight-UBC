export default class Room {
	private roomBuildingFullName: string;
	private roomBuildingShortName: string;
	private roomNumber: string;
	private roomName: string;
	private roomAddress: string;
	private roomLat: number;
	private roomLon: number;
	private roomSeats: number;
	private roomType: string;
	private roomFurniture: string;
	private roomHRef: string;

	constructor(fullName: string, shortName: string, number: string, name: string, address: string,
		lat: number, lon: number, seats: number, type: string, furniture: string, hRef: string) {
		this.roomBuildingFullName = fullName;
		this.roomBuildingShortName = shortName;
		this.roomNumber = number;
		this.roomName = name;
		this.roomAddress = address;
		this.roomLat = lat;
		this.roomLon = lon;
		this.roomSeats = seats;
		this.roomType = type;
		this.roomFurniture = furniture;
		this.roomHRef = hRef;
	}

	public getFullName() {
		return this.roomBuildingFullName;
	}

	public getShortName() {
		return this.roomBuildingShortName;
	}

	public getRoomNum() {
		return this.roomNumber;
	}

	public getName() {
		return this.roomName;
	}

	public getAddress() {
		return this.roomAddress;
	}

	public getLat() {
		return this.roomLat;
	}

	public getLon() {
		return this.roomLon;
	}

	public getSeats() {
		return this.roomSeats;
	}

	public getType() {
		return this.roomType;
	}

	public getFurniture() {
		return this.roomFurniture;
	}

	public getHRef() {
		return this.roomHRef;
	}

	public getFieldValue(field: string): string | number {
		if ((field === "lat") || (field === "lon") || (field === "seats")) {
			return this.getMField(field);
		} else {
			return this.getSField(field);
		}
	}

	public getMField(mfield: string): number {
		let mFieldValue: number = 0;
		if (mfield === "lat") {
			mFieldValue = this.getLat();
		}
		if (mfield === "lon") {
			mFieldValue = this.getLon();
		}
		if (mfield === "seats") {
			mFieldValue = this.getSeats();
		}
		return mFieldValue;
	}

	public getSField(sfield: string): string {
		let sFieldValue: string = "";
		if (sfield === "fullname") {
			sFieldValue = this.getFullName();
		}
		if (sfield === "shortname") {
			sFieldValue = this.getShortName();
		}
		if (sfield === "number") {
			sFieldValue = this.getRoomNum();
		}
		if (sfield === "name") {
			sFieldValue = this.getName();
		}
		if (sfield === "address") {
			sFieldValue = this.getAddress();
		}
		if (sfield === "type") {
			sFieldValue = this.getType();
		}
		if (sfield === "furniture") {
			sFieldValue = this.getFurniture();
		}
		if (sfield === "href") {
			sFieldValue = this.getHRef();
		}
		return sFieldValue;
	}
}
