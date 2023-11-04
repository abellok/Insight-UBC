import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect} from "chai";
import request, {Response} from "supertest";
import fs from "fs";
import {InsightDatasetKind} from "../../src/controller/IInsightFacade";
import {getContentFromArchives} from "../TestUtil";

describe("Server", () => {

	let facade: InsightFacade;
	let server: Server;

	const SERVER_URL = "http://localhost:4321";
	const ZIP_FILE_DATA_SECTIONS =
		fs.readFileSync("./test/resources/archives/pair.zip");
	const ZIP_FILE_DATA_ROOMS =
		fs.readFileSync("./test/resources/archives/campus.zip");

	before(async () => {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		try {
			await server.start();
		} catch (err) {
			console.error("Error starting server: ", err);
			process.exit(1);
		}
	});

	after(async () => {
		// TODO: stop server here once!
		await server.stop();
	});

	beforeEach(() => {
		// might want to add some process logging here to keep track of what's going on
	});

	afterEach(() => {
		// might want to add some process logging here to keep track of what's going on
	});

	// Sample on how to format PUT requests
	/*
	it("PUT test for courses dataset", async () => {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
	 */

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
	it("PUT test for courses dataset", async () => {
		try {
			return request(SERVER_URL)
				.put("/dataset/mysections/sections")
				.send(ZIP_FILE_DATA_SECTIONS)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.error(err);
		}
	});

	it("PUT test for rooms dataset", async () => {
		try {
			return request(SERVER_URL)
				.put("/dataset/myrooms/rooms")
				.send(ZIP_FILE_DATA_ROOMS)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.error(err);
		}
	});

	it("POST QUERY test for courses dataset", async () => {
		try {
			return request(SERVER_URL)
				.post("/query")
				.send(
					{
						WHERE: {
							GT: {
								sections_avg: 97
							}
						},
						OPTIONS: {
							COLUMNS: [
								"mysections_dept",
								"mysections_avg"
							],
							ORDER: "mysections_avg"
						}
					}
				)
				.set("Content-Type", "application/json")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// assertions
				})
				.catch((err) => {
					console.error(err);
					// more logs
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.error(err);
		}
	});

	it("GET test for datasets", async () => {
		try {
			return request(SERVER_URL)
				.get("/datasets")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// assertions
				})
				.catch((err) => {
					// more logs
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.error(err);
		}
	});

	it("DELETE test for courses dataset", async () => {
		try {
			return request(SERVER_URL)
				.delete("/dataset/mysections")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// assertions
				})
				.catch((err) => {
					// more logs
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.error(err);
		}
	});

	it("DELETE test for rooms dataset", async () => {
		try {
			return request(SERVER_URL)
				.delete("/dataset/myrooms")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// assertions
				})
				.catch((err) => {
					// more logs
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.error(err);
		}
	});

	it("DELETE test for nonexistent datatset", async () => {
		try {
			return request(SERVER_URL)
				.delete("/dataset/rofl")
				.then((res: Response) => {
					expect(res.status).to.be.equal(404);
					// assertions
				})
				.catch((err) => {
					// more logs
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.error(err);
		}
	});
});
