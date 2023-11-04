// import {InsightResult} from "../IInsightFacade";
import Dataset from "../Dataset";
import Section from "../Section";
import Room from "../Room";
import {InsightDataset, InsightError, InsightResult} from "../IInsightFacade";

// TODO: add transformations
export function applyFilterAndFormatResult(query: any, map: Map<string, Dataset>,
										   list: InsightDataset[]): InsightResult[] {
	let filteredResults: InsightResult[] = [];
	let roomResults: Room[] = [];
	let sectionResults: Section[] = [];
	let where = query["WHERE"];			// isolates 'where'
	let options = query["OPTIONS"];		// isolates 'options'
	let columns = options["COLUMNS"];	// isolates columns
	let transformations = query["TRANSFORMATIONS"];
	let id: string;
	let dataset;
	let correctTypedArray;

	// find id based on query column input
	id = findDatasetID(columns);
	// obtain correct dataset from map, if it exists
	if (map.has(id)) {
		dataset = map.get(id);
	} else {
		throw new InsightError("Non-existent dataset");
	}
	// turn dataset into an array of appropriate type (to be able to find appropriate characteristics)
	if (!(isNullOrUndefined(dataset))) {
		if (dataset.getData()[0] instanceof Room) {		// make an array of Room to access appropriate getters
			for (let data of dataset.getData()) {
				if (data instanceof Room) {
					roomResults.push(data);
				}
			}
		} else {
			if (dataset.getData()[0] instanceof Section) {		// make an array of Section to access appropriate getters
				for (let data of dataset.getData()) {
					if (data instanceof Section) {
						sectionResults.push(data);
					}
				}
			}
		}
	}
	let results = whereFilter(where, dataset, roomResults, sectionResults);
	filteredResults = optionsFilter(options, dataset, results, roomResults, sectionResults);
	// filteredResults = transformationsFilter(transformations, dataset, filteredResults);
	return filteredResults;
}

function findDatasetID(columns: any): string {
	let datasetId = columns[0].split("_", 1)[0];
	for (let i = 1; i < columns.length; i++) {
		if (columns[i].includes("_")) {			// C2 NOTE: not everything in columns needs an id
			let columnDatasetId = columns[i].split("_", 1)[0];
			if (columnDatasetId !== datasetId) {
				throw new InsightError("All columns should refer to the same dataset");
			}
		}
	}
	return datasetId;
}

function whereFilter(where: any, dataset: any, roomList: Room[], sectionList: Section[]): InsightResult[] {
	let results: InsightResult[] = [];
	if (Object.keys(where).length === 0) { // empty WHERE
		results = dataset.getData();
	}
	let key = Object.keys(where)[0];
	if (key === "GT" || key === "LT" || key === "EQ") { // Check for key in whereObj
		results = doMComparisons(where, dataset, roomList, sectionList);
		return results;
	} else if (key === "AND" || key === "OR") {
	 	results = doLogicComparisons(where, dataset, roomList, sectionList);
	} else if (key === "IS") {		// NOTE: currently commented out for simple debugging
	 	results = doISOperations(where, dataset, roomList, sectionList);
	} // else if (key === "NOT") {
		// results = doNegationComparisons(where, dataset, roomList, sectionList);
	// }
	return results;
}

function doMComparisons(where: any, dataset: any, roomList: Room[], sectionList: Section[]): InsightResult[] {
	let results: InsightResult[] = [];
	let key = Object.keys(where)[0]; // ex) GT
	let val = where[key]; // ex) {"sections_avg": 97}
	let dsColumn = Object.keys(val)[0]; // ex) "sections_avg"
	let num = val[dsColumn]; // ex) 97
	let mfield = dsColumn.split("_")[1];
	if (!(checkMFieldValid(mfield))) {
		throw new InsightError("Non-existent mfield");
	}
	if (key === "GT") {
		for (let sec of dataset.getData()) {
			if (sec.getMField(mfield) > num) {
				results.push(sec);
			}
		}
	} else if (key === "LT") {
		for (let sec of dataset.getData()) {
			if (sec.getMField(mfield) < num) {
				results.push(sec);
			}
		}
	} else if (key === "EQ") {
		for (let sec of dataset.getData()) {
			if (sec.getMField(mfield) === num) {
				results.push(sec);
			}
		}
	}
	return results;
}

// TODO: implement
function doNegationComparisons(where: any, dataset: any, roomList: Room[], sectionList: Section[]): InsightResult[] {
	let results: InsightResult[] = [];
	return results;
}

function checkMFieldValid(mfield: string): boolean {
	let mfieldList = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];
	if (!mfieldList.includes(mfield)) {
		return false;
	}
	return true;
}

function doISOperations(where: any, dataset: any, roomList: Room[], sectionList: Section[]): InsightResult[] {
	let results: InsightResult[] = [];
	let key = Object.keys(where)[0]; // ex) IS
	let val = where[key]; // ex) {"sections_dept": "adhe"}
	let dsColumn = Object.keys(val)[0]; // ex) "sections_dept"
	let str = val[dsColumn]; // ex) adhe
	let sfieldList = ["dept", "id", "instructor", "title", "uuid", "fullname", "shortname", "number", "name",
		"address", "type", "furniture", "href"];

	let sfield = dsColumn.split("_")[1];
	if (!sfieldList.includes(sfield)) {
		throw new InsightError("Non-existent sfield");
	}
	for (let item of dataset.getData()) {
		if (item.getSField(sfield) === str) {
			results.push(item);
		}
	}
	return results;
}

function doLogicComparisons(where: any, dataset: any, roomList: Room[], sectionList: Section[]): InsightResult[] {
	let results: InsightResult[] = [];
	let operator = Object.keys(where)[0]; // ex. AND/OR
	let clauses = where[operator]; // ex) [{},{}]
	for (let clause of clauses) {
		let clauseResults = whereFilter(clause, dataset, roomList, sectionList);
		if (operator === "AND") { // TODO: fix AND
			if (results.length === 0) {
				results = clauseResults;
			} else {
				results = getCrossOver(results, clauseResults);
			}
		} else if (operator === "OR") {
			clauseResults.forEach((val) => {
				if (!results.includes(val)) {
					results.push(val);
				}
			});
		}
	}
	return results;
}

function getCrossOver(result: any[], clauseResults: any[]): InsightResult[] {
	let firstList: any[] = result;
	let crossOverList = [];
	for (let item of clauseResults) {
		if (firstList.includes(item)) {
			crossOverList.push(item);
		}
	}
	return crossOverList;
}

function optionsFilter(options: any, dataset: any, results: any, // TODO: change this to adhere to c3
					   roomList: Room[], sectionList: Section[]): InsightResult[] {
	let filteredResults: InsightResult[] = [];
	let sortedResults: any[] = results;
	let columns = options["COLUMNS"];
	let order = options["ORDER"];

	// if order clause exists, sort in ascending order
	if (order && (typeof order === "string")) {
		if (!columns.includes(order)) {		// makes sure what your sorting by is a column you see
			throw new InsightError("Order key must be in columns");
		}
		let orderType = order.split("_")[1];
		sortedResults.sort(function (a, b) {
			const orderA: number = a.getFieldValue(orderType);
			const orderB: number = b.getFieldValue(orderType);
			return orderA > orderB ? 1 : orderA < orderB ? -1 : 0;		// code given via Stack Overflow (https://stackoverflow.com/questions/48348318/sort-key-pair-value-array-in-typescript)
		});
	// } else if (order) {
	// 	let direction = order["dir"];
	// 	let keys = order["key"];
	// 	if (direction === "UP") {
	// 		sortedResults = results.sort(function (a: any, b: any) {
	// 			let cmp = 0;
	// 			for (let key of keys) {
	// 				cmp = a[key] - b[key];
	// 				if (cmp !== 0) {
	// 					break;
	// 				}
	// 			}
	// 			return cmp;
	// 		});
	// 	} else if (direction === "DOWN") {
	// 		sortedResults = results.sort(function (a: any, b: any) {
	// 			let cmp = 0;
	// 			for (let key of keys) {
	// 				cmp = b[key] - a[key];
	// 				if (cmp !== 0) {
	// 					break;
	// 				}
	// 			}
	// 			return cmp;
	// 		});
	// 	}
	}
	filteredResults = filterColumns(columns, sortedResults);
	return filteredResults;
}

function filterColumns(columns: any, results: any): InsightResult[] {
	let filteredResults: InsightResult[] = [];
	for (let item of results) {
		let filteredItem: any = {};
		for (let column of columns) {
			let characteristic = column.split("_")[1];
			filteredItem[column] = item.getFieldValue(characteristic);
		}
		filteredResults.push(filteredItem);
	}
	return filteredResults;
}

function transformationsFilter(options: any, dataset: any, results: any): void {	// change return value
	// stub
}

// Function provided by an answer on Stack Overflow:
// (https://stackoverflow.com/questions/41955762/typescript-isnullorundefined)
export function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
	return typeof obj === "undefined" || obj === null;
}
