import {InsightError} from "../IInsightFacade";

// TODO: too strict of checks (etc. all columns of same dataset, invalid key options, non-existent S field / M field,
//  	non-existent datasets, all should refer to same dataset) > errors that were thrown when they shouldn't
// 		have been thrown.
export function validateQuery(query: any): boolean {
	const whereObj = query["WHERE"];
	const optionsObj = query["OPTIONS"];
	const transObj = query["TRANSFORMATIONS"];

	if (!(whereObj && optionsObj)) {
		throw new InsightError("Where and/or options do not exist.");
	}
	if (!areValidKeysWhere(whereObj)) {
		throw new InsightError("Query has invalid keys where.");
	}
	if (!areValidKeysOptions(optionsObj)) {
		throw new InsightError("Query has invalid keys options.");
	}
	if (transObj) {
		if (!areValidKeysTransformations(transObj)) {
			throw new InsightError("Query has invalid keys for transformations.");
		}
	}
	return true;
}

function areValidKeysWhere(whereObj: any): boolean {
	if (Object.keys(whereObj).length === 0) { // empty WHERE is valid
		return true;
	}
	let key = Object.keys(whereObj)[0];
	if (key === "GT" || key === "LT" || key === "EQ") { // Check for key in whereObj
		let val = whereObj[key];
		if (typeof val !== "object") {
			return false;
		}
		if (Object.keys(val).length !== 1) {
			return false;
		}
		let num = whereObj[key][Object.keys(whereObj[key])[0]];
		if (typeof num !== "number") {
			return false;
		}
	} else if (key === "AND" || key === "OR") {
		let operator = whereObj[key];
		if (operator.length === 0) {
			return false;
		}
		for (let o of operator) {
			if (!(areValidKeysWhere(o))) {
				return false;
			}
		}
	} else if (key === "IS") {
		let val = whereObj[key];
		if (typeof val !== "object") {
			return false;
		}
		if (Object.keys(val).length !== 1) {
			return false;
		}
		let str = whereObj[key][Object.keys(whereObj[key])[0]];
		if (typeof str !== "string") {
			return false;
		}
	} else if (key === "NOT") {
		// TODO: implement
		return false;
	} else {
		return false;
	}
	return true;
}


function areValidKeysOptions(optionsObj: any): boolean {
	// empty OPTIONS or too long OPTIONS is invalid
	if (!(Object.keys(optionsObj).length === 1 ||
		Object.keys(optionsObj).length === 2 || Object.keys(optionsObj).length === 3)) {
		return false;
	}
	// Check for keys in optionsObj
	for (let key of Object.keys(optionsObj)) {
		if (key === "COLUMNS") {
			let val = optionsObj[key];
			if (typeof val !== "object") {
				return false;
			}
			if (!(Object.keys(val).length >= 1)) {		// NOTE: currently doesn't check keys are strings
				return false;
			}
		} else if (key === "ORDER") {
			let val = optionsObj[key];
			if (val.length === 1) {		// handles single column order
				if (typeof val !== "string") {
					return false;
				}
			} else {					// handles dir/key order
				if (val.length === 2) {
					if (!(Object.keys(val)[0] === "dir")) {
						return false;
					}
					if ((val[0] !== "DOWN") || (val[0] !== "UP")) {
						return false;
					}
					if (!(Object.keys(val)[1] === "keys")) {
						return false;
					}
					if (typeof val[1] !== "object") {	// NOTE: currently doesn't check keys are strings
						return false;
					}
				}
			}
		} else {	// invalid options key
			if (!(key === "ORDER") && !(key === "COLUMNS")) {
				return false;
			}
		}
	}
	return true;
}

function areValidKeysTransformations(transObj: any): boolean {
	// transObj should have GROUP and APPLY
	if (!(Object.keys(transObj).length === 2)) {
		return false;
	}
	const groupObj = transObj["GROUP"];
	const applyArr = transObj["APPLY"];

	if (!groupObj || typeof groupObj !== "object") {
		return false;
	}

	if (Object.keys(groupObj).length < 1) {
		return false;
	}

	if (!applyArr || !Array.isArray(applyArr) || applyArr.length < 1) {
		return false;
	}

	for (const applyObj of applyArr) {
		if (!areValidApplyKeys(applyObj, applyArr)) {
			return false;
		}
	}
	return true;
}

function areValidApplyKeys(applyObj: any, applyArr: any): boolean {
	if (!applyObj || typeof applyObj !== "object" || Array.isArray(applyObj) || Object.keys(applyObj).length !== 1) {
		return false;
	}
	const applyKey = Object.keys(applyObj)[0];
	const applyVal = applyObj[applyKey];

	if (!applyKey || typeof applyKey !== "string") {
		return false;
	}

	if (!applyVal || typeof applyVal !== "object" || Array.isArray(applyVal) || Object.keys(applyVal).length !== 1) {
		return false;
	}

	const calc = Object.keys(applyVal)[0];
	const applyArg = applyVal[calc];

	if (!calc || typeof calc !== "string") {
		return false;
	}

	if (calc !== "MAX" && calc !== "MIN" && calc !== "AVG" && calc !== "SUM" && calc !== "COUNT") {
		return false;
	}

	if (!applyArg || typeof applyArg !== "string") {
		return false;
	}
	return true;
}
