import JSZip from "jszip";
import InsightFacade from "../InsightFacade";
import {InsightDataset, InsightError} from "../IInsightFacade";
import {throws} from "assert";
import Dataset from "../Dataset";
import Room from "../Room";
import Building from "../Building";
import {create} from "domain";
import Section from "../Section";
import {parse} from "parse5";
import * as http from "http";
import {createSection} from "./validateSectionContent";

// checks if room content is valid, then creates Dataset full of valid sections and adds it to map
export async function validateRoomContent(content: string, map: Map<string, any>): Promise<Dataset> {
	// unzip folder
	const files: Array<Promise<string>> = [];
	let data = new Dataset();
	let buildingList: Building[] = [];
	let zip = new JSZip();

	// try {
	const newZip = await zip.loadAsync(content, {base64: true});
	// check if index file exists
	let indexFile = newZip.file("index.htm");
	if (indexFile === null) {
		return Promise.reject("no index file exists");
	} else {
		// change JSZip to html text
		await indexFile.async("text").then((value) => {
			let parsedIndex = parse(value);	// parses html text to a traversable JSON format
			return parsedIndex;
		}).then((value) => {
			buildingList = createValidBuildingArray(value, newZip);
		});
	}
	let buildingParsePromises: any[] = [];	// tried to put async in a for loop... didn't work -> needs to be outside
	let buildingData: Building[] = [];
	for (let building of buildingList) {
		let buildingFile = newZip.file(building.getBuildingHRef().substring(2));
		if (buildingFile === null) {
			// return Promise.reject("issue using building href");
			// keep going
		} else {
			buildingParsePromises.push(buildingFile.async("text"));
			buildingData.push(building);
		}
	} // works up till here!
	let newRooms: Dataset;
	const textArray = await Promise.all(buildingParsePromises);
	for (let buildingTextFile of textArray) {
		let index = textArray.indexOf(buildingTextFile);
		let parsedBuilding = parse(buildingTextFile);	// parses html building text to traversable JSON
		newRooms = createRooms(parsedBuilding, buildingData[index], data);
		data = newRooms;
	}
	// check geolocation (CURRENTLY NOT WORKING)
	console.log("geolocation lat 1: " + buildingList[0].getBuildingLat());
	console.log("geolocation lon 1: " + buildingList[0].getBuildingLon());
	console.log("geolocation lat 2: " + buildingList[1].getBuildingLat());
	console.log("geolocation lon 2: " + buildingList[1].getBuildingLon());
	return data;
}

export function createValidBuildingArray(document: any, content: JSZip): Building[] {
	let buildingList: Building[] = [];
	let tableBody = findTBody(document.childNodes);	// 'document' is a parsed tree-like document
	if (tableBody.length === 0) {
		// keep going;
	};
	// create an array of buildings
	if (!isNullOrUndefined(tableBody)) {
		for (let row of tableBody) {
			if (row.nodeName === "tr") {	// each "tr" is a building
				let building = row.childNodes;   // "tr" childNodes are characteristics of each building
				buildingList.push(createBuilding(building));
			}
		}
	}
	return buildingList;
}

// find a valid table body (tbody), somewhere in the parsed document 'tree' -> traverse!
// got inspiration from Geeks4Geeks and enjoyalgorithms.com (public resources about traversing
// an n-ary tree)
// https://www.enjoyalgorithms.com/blog/n-ary-tree
// https://www.geeksforgeeks.org/level-order-traversal-of-n-ary-tree/
export function findTBody(nodes: any[]): any[] {
	let nextNode: any[] = [];
	if (nodes === undefined) {
		return nextNode;
	}
	for (let node of nodes) {
		let childNodes = node.childNodes;
		if (!(node.nodeName === "tbody")) {
			nextNode = findTBody(childNodes);
			if (!(nextNode.length === 0)) {
				return nextNode;
			}
		} else {
			nextNode = childNodes;
			return nextNode;
		}
	}
	return nextNode; // needed to make function run lol
}

// creates a building
// TODO: figure out how to validate the table to see if it has all the correct info
export function createBuilding(buildingCharacteristics: any[]): Building {
	let fullBuildingName: string = "";
	let shortBuildingName: string = "";
	let buildingAddress: string = "";
	let addressLat: number = 0;
	let addressLon: number = 0;
	let buildingHRef: string = "";
	for (let column of buildingCharacteristics) {
		if (!isNullOrUndefined(column)) {
			if ((column.nodeName === "td") && (column.attrs[0].name === "class")) {
				if (column.attrs[0].value === "views-field views-field-field-building-code") {
					if (!isNullOrUndefined(column.childNodes[0].value)) {
						shortBuildingName = column.childNodes[0].value.trim();
					}
				}
				if (column.attrs[0].value === "views-field views-field-title") {
					for (let attrs of column.childNodes[1].attrs) {   // column.childNodes[0] is #text!
						if (attrs.name === "href") {
							buildingHRef = attrs.value;
						}
						if (attrs.name === "title") {
							fullBuildingName = column.childNodes[1].childNodes[0].value;
						}
					}
				}
				if (column.attrs[0].value === "views-field views-field-field-building-address") {
					if (!isNullOrUndefined(column.childNodes[0].value)) {
						buildingAddress = column.childNodes[0].value.trim();
					}
				}
			}
		}
	}
	// find lat and lon with address
	// TODO: MAKE ASYNC: gotta wait for operation to finish / fix lat & lon
	let parsedLatLon: any;
	getLatLon(buildingAddress).then((value) => {
		parsedLatLon = value;
	});
	if (!(isNullOrUndefined(parsedLatLon))) {
		if ("error" in parsedLatLon) {
			throw new InsightError("error getting latitude and longitude");
		} else {
			addressLat = parsedLatLon.lat;
			addressLon = parsedLatLon.lon;
		}
	}
	// create and return new building
	let successfulBuilding = new Building(fullBuildingName, shortBuildingName, buildingAddress,
		addressLat, addressLon, buildingHRef);
	return successfulBuilding;
	// TODO: figure out how to disregard rooms/buildings where geolocation has failed --> invalid rooms
}

// Function provided by an answer on Stack Overflow:
// (https://stackoverflow.com/questions/41955762/typescript-isnullorundefined)
export function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
	return typeof obj === "undefined" || obj === null;
}

// obtains lat and lon from a single building address
export async function getLatLon(address: string): Promise<any> {
	let encodedAddress = encodeURIComponent(address);
	let webAddress = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team066/" + encodedAddress;
	const geoPromise = new Promise((resolve, reject) => {
		resolve(http.get(webAddress));
	});
	await geoPromise.then((value) => {
		return value;
	});
}

// takes a building, creates a Room for each building room, and pushes each Room to the validRooms dataset
export function createRooms(buildingDocument: any, homeBuilding: Building, data: Dataset): Dataset {
	let successfulRooms: Dataset = data;
	let roomTableBody = findTBody(buildingDocument.childNodes);	// 'document' is a parsed tree-like document
	if (roomTableBody.length === 0) {
		// keep going
	};
	let newRoom: Room = new Room("", "", "", "", "",
		0, 0, 0, "", "", "");
	if (!isNullOrUndefined(roomTableBody)) {
		for (let row of roomTableBody) {
			if (row.nodeName === "tr") {	// each "tr" is a building
				let room = row.childNodes;   // "tr" childNodes are characteristics of each building
				newRoom = createSingleRoom(room, homeBuilding.getBuildingFullName(),
					homeBuilding.getBuildingShortName(), homeBuilding.getBuildingAddress(),
					homeBuilding.getBuildingLat(), homeBuilding.getBuildingLon());
				if (!(newRoom.getName().length === 0)) {
					successfulRooms.addValidData(newRoom);
				}
			}
		}
	}
	return successfulRooms;
}

export function createSingleRoom(roomCharacteristics: any, longName: string, shortName: string, address: string,
								 lat: number, lon: number): Room {
	let roomNumber: string = "";
	let roomName: string = "";
	let roomSeats: number = 0;
	let roomType: string = "";
	let roomFurniture: string = "";
	let roomHRef: string = "";

	for (let column of roomCharacteristics) {
		if (!isNullOrUndefined(column)) {
			if ((column.nodeName === "td") && (column.attrs[0].name === "class")) {
				if (column.attrs[0].value === "views-field views-field-field-room-number") {
					if (!isNullOrUndefined(column.childNodes[1].attrs[0].value)
						&& !isNullOrUndefined(column.childNodes[1].childNodes[0].value)) {
						roomHRef = column.childNodes[1].attrs[0].value.trim();		// childNodes[0] is #text
						roomNumber = column.childNodes[1].childNodes[0].value.trim();
					}
				}
				if (column.attrs[0].value === "views-field views-field-field-room-capacity") {
					if (!isNullOrUndefined(column.childNodes[0].value)) {
						roomSeats = column.childNodes[0].value.trim();
					}
				}
				if (column.attrs[0].value === "views-field views-field-field-room-furniture") {
					if (!isNullOrUndefined(column.childNodes[0].value)) {
						roomFurniture = column.childNodes[0].value.trim();
					}
				}
				if (column.attrs[0].value === "views-field views-field-field-room-type") {
					if (!isNullOrUndefined(column.childNodes[0].value)) {
						roomType = column.childNodes[0].value.trim();
					}
				}
			}
		}
	}
	roomName = shortName + "_" + roomNumber;
	let successfulRoom = new Room(longName, shortName, roomNumber, roomName, address,
		lat, lon, roomSeats, roomType, roomFurniture, roomHRef);
	return successfulRoom;
}

