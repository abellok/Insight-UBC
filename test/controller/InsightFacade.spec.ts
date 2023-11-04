import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: InsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let smallerSections: string;
	let rooms: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");
		smallerSections = getContentFromArchives("smallerPair.zip");
		rooms = getContentFromArchives("campus.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		// after(function () {
		// 	console.info(`After: ${this.test?.parent?.title}`);
		// });

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			// console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});

		// This is a unit test. You should create more like this!
		// addDataset test cases
		// it ("should reject with  an empty dataset id", function() {
		// 	const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });
		//
		// it("should reject a dataset id with underscore", function () {
		// 	const result = facade.addDataset("u_bc", sections, InsightDatasetKind.Sections);
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });
		//
		// it("should successfully add a dataset (first)", function () {
		// 	const result = facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
		// 	return expect(result).to.eventually.have.members(["ubc"]);
		// });
		//
		// // it("should successfully add two datasets", function () {
		// // 	facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
		// // 	facade.addDataset("smallubc", smallerSections, InsightDatasetKind.Sections);
		// // 	console.log(facade.getDatabase());
		// // 	let i = facade.getDatabase().length;
		// // 	return expect(i).to.equal(2);
		// // });
		//
		// it("should list two datasets", function () {
		// 	return facade.addDataset("ubc", sections, InsightDatasetKind.Sections)
		// 		.then((IDStrings) => {
		// 			return facade.addDataset("smallubc", smallerSections, InsightDatasetKind.Sections)
		// 				.then((IDStrings2) => {
		// 					return facade.listDatasets()
		// 						.then((Datasets) => {
		// 							expect(facade.getDatabase()).to.have.length(2);
		// 						});
		// 				});
		// 		});
		// });
		//
		// // NOT PASSING -> FIXED -> FIXED?
		// it("should reject a dataset if id is same with existing dataset", async function () {
		// 	await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
		// 	const result = facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });
		//
		// // removeDataset test cases
		// it("should reject dataset that hasn't been added", function () {
		// 	const result = facade.removeDataset("notyet");
		// 	return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		// });
		//
		// it("should reject dataset with empty id", function () {
		// 	const result = facade.removeDataset("");
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });
		//
		// it("should reject dataset with whitespace id", function () {
		// 	const result = facade.removeDataset("             ");
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });
		//
		// it("should reject dataset with underscore id", function () {
		// 	const result = facade.removeDataset("u_bc");
		// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
		// });
		//
		// it("should successfully remove dataset", function() {
		// 	return facade.addDataset("ubc", sections, InsightDatasetKind.Sections)
		// 		.then(() => {
		// 			return facade.addDataset("smallubc", smallerSections, InsightDatasetKind.Sections)
		// 				.then(() => {
		// 					return facade.removeDataset("smallubc")
		// 						.then(() => {
		// 							expect(facade.getDatabase()).to.have.length(1);
		// 						});
		// 				});
		// 		});
		// 	// facade.addDataset("smallUbc", smallerSections, InsightDatasetKind.Sections);
		// 	// const result = facade.removeDataset("smallUbc");
		// 	// let i = facade.getDatabase().length;
		// 	// return expect(i).to.equal(1);
		// });
		//
		// it("should reject after removing dataset twice", function() {
		// 	facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
		// 	facade.removeDataset("ubc");
		// 	const result = facade.removeDataset("ubc");
		// 	return expect(result).to.eventually.be.rejectedWith(NotFoundError);
		// });
		//
		// // listDataset test cases
		// it("should list empty array", function () {
		// 	const result = facade.listDatasets();
		// 	return expect(result).to.eventually.deep.equal([]);
		// });
		// // TEST FOR SMALLER DATASET
		// // it("should list one dataset smallerSection", function () {
		// // 	return facade.addDataset("ubc", smallerSections, InsightDatasetKind.Sections)
		// // 		.then((IDStrings) => {
		// // 			return facade.listDatasets();
		// // 		})
		// // 		.then((Datasets) => {
		// // 			expect(Datasets).to.deep.equal([{
		// // 				id: "ubc",
		// // 				kind: InsightDatasetKind.Sections,
		// // 				numRows: 487, // 64612 for big section dataset
		// // 			}]);
		// // 		});
		// // });
		//
		// it("should list one section dataset original", function () {
		// 	return facade.addDataset("ubc", sections, InsightDatasetKind.Sections)
		// 		.then((IDStrings) => {
		// 			return facade.listDatasets();
		// 		})
		// 		.then((Datasets) => {
		// 			expect(Datasets).to.deep.equal([{
		// 				id: "ubc",
		// 				kind: InsightDatasetKind.Sections,
		// 				numRows: 64612
		// 			}]);
		// 		});
		// });
		//
		// it("should list two datasets", function () {
		// 	return facade.addDataset("ubc1", sections, InsightDatasetKind.Sections)
		// 		.then((IDStrings) => {
		// 			return facade.addDataset("ubc2", smallerSections, InsightDatasetKind.Sections)
		// 				.then((IDStrings2) => {
		// 					return facade.listDatasets()
		// 						.then((Datasets) => {
		// 							expect(Datasets).to.be.an.instanceof(Array);
		// 							expect(Datasets).to.have.length(2);
		// 						});
		// 				});
		// 		});
		// });
		//
		// it("should successfully list dataset that's been added compare array type", function () {
		// 	const result = facade.listDatasets();
		// 	return expect(result).to.eventually.be.an.instanceof(Array);
		// });

		it("should list one room dataset", function() {
			return facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms).then((IDStrings) => {
				return facade.listDatasets();
			})
				.then((Datasets) => {
					expect(Datasets).to.deep.equal([{
						id: "rooms",
						kind: InsightDatasetKind.Rooms,
						numRows: 364
					}]);
				});
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
				facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms)
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		// COMMENTED OUT MOMENTARILY FOR FASTER TESTING TIMES
		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries",
			{
				assertOnResult: (actual, expected) => {
					expect(actual).to.deep.equal(expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else if (expected === "InsightError") {
						expect(actual).to.be.instanceof(InsightError);
					} else {
						// this should be unreachable
						expect.fail("UNEXPECTED ERROR");
					}
				},
			}
		);
	});
});
