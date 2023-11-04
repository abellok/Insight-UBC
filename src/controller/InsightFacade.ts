import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import {validateQuery,} from "./helpers/validateQuery";
import {applyFilterAndFormatResult} from "./helpers/applyFilterAndFormatResult";
import {validateSectionContent} from "./helpers/validateSectionContent";
import {validateRoomContent} from "./helpers/validateRoomContent";
import Dataset from "./Dataset";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	protected myInsightFacade: Map<string, Dataset>; 			// map global variable
	protected myInsightFacadeList: InsightDataset[];		// dataset array global variable
	constructor() {
		this.myInsightFacade = new Map<string, any>();		// initializes map
		this.myInsightFacadeList = [];						// initializes name array
	}

	// TODO: complete data processing for Rooms
	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// check id requirements
		if(id === "") {
			return Promise.reject(new InsightError("empty id"));		 // reject if empty id
		} else if(id.includes("_")) {
			return Promise.reject(new InsightError("underscore not allowed"));	// reject of underscore
		} else if (!id.trim().length){
			return Promise.reject(new InsightError("only whitespace"));  // reject if id.length is 0 after trimming
		} else {
			for (let dataset of this.myInsightFacadeList) {     			 // reject if id exists in facade already
				if (dataset.id === id) {
					return Promise.reject(new InsightError("same id already exists"));
				}
			}
		}
		// Process content if data kind is Sections
		let validDataset: Dataset;
		if (kind === InsightDatasetKind.Sections) {
			try {
				validDataset = await validateSectionContent(content, this.myInsightFacade, new Dataset());
			} catch {
				return Promise.reject(new InsightError("section content not valid"));
			}
		} else { // Process content if data kind is Rooms
			try {
				validDataset = await validateRoomContent(content, this.myInsightFacade);
			} catch (error) {
				return Promise.reject(error);
			}
		}
		// no issues with content validation!
		const myDatasetInfo: InsightDataset = this.makeDataset(id, kind, validDataset);
		this.myInsightFacadeList.push(myDatasetInfo);
		this.myInsightFacade.set(id, validDataset);
		let currentDatasets: string[] = [];     			// initializes string array of id's
		for (let dataset of this.myInsightFacadeList) {
			currentDatasets.push(dataset.id);
		}
		return Promise.resolve(currentDatasets);			// returns list of id's
	}

	public removeDataset(id: string): Promise<string> {
		// check valid string input
		if(id === "") {
			return Promise.reject(new InsightError("empty id"));
		} else if(id.includes("_")) {
			return Promise.reject(new InsightError("underscore not allowed"));
		} else if (!id.trim().length){   // takes out whitespace from ends of string
			return Promise.reject(new InsightError("only whitespace"));  // rejects if id.length is 0 after trimming
		} else {
			for(let dataset of this.myInsightFacadeList) {     // fulfill if id exists
				if (dataset.id === id) {
					let index: number = this.myInsightFacadeList.indexOf(dataset);
					let deletedDataset: string = dataset.id;
					this.myInsightFacadeList.splice(index, 1);    // delete dataset list
					this.myInsightFacade.delete(id);						// deletes from map
					return Promise.resolve(deletedDataset); 				// return deleted dataset id
				}
			}
			return Promise.reject(new NotFoundError("id not found"));		// valid id doesn't exist
		}
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return new Promise((resolve, reject) => {
			// Validate query, reject if invalid
			try {
				validateQuery(query);
			} catch (error) {
				// reject(new InsightError("Invalid query"));
				reject(error);
			}

			// Apply filter and format result
			let filteredData: any[] = [];
			try {
				filteredData = applyFilterAndFormatResult(query, this.myInsightFacade, this.myInsightFacadeList);
			} catch (error) {
				// reject(new InsightError("Does not follow EBNF"));
				reject(error);
			}

			// Throw error if query result is too big
			if (filteredData.length > 5000) {
				reject(new ResultTooLargeError());
			}

			// Return the filtered and formatted result
			resolve(filteredData);
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let list = this.getDatabase();
		return Promise.resolve(list);
	}

	public getDatabase(): InsightDataset[] {
		return this.myInsightFacadeList;
	};

	public makeDataset(id: string, kind: InsightDatasetKind, validDataset: Dataset): InsightDataset {
		const myDatasetInfo: InsightDataset = {
			id: id,
			kind: kind,
			numRows: validDataset.getData().length
		};
		return myDatasetInfo;
	}

	public findDatasetKind(id: string): InsightDatasetKind {
		let kind: InsightDatasetKind = InsightDatasetKind.Sections;		// initializes as sections to make function work
		for (let dataset of this.myInsightFacadeList) {     // fulfill if id exists
			if (dataset.id === id) {
				kind = dataset.kind;
			}
		}
		return kind;
	}
}
