import Section from "./Section";
import Room from "./Room";
import {InsightDatasetKind} from "./IInsightFacade";

export default class Dataset {
	protected validData: Array<Section|Room>;

	constructor() {
		this.validData = [];
	}

	public addValidData(data: Section|Room) {
		this.validData.push(data);
	}

	public getData(): Array<Section|Room> {
		return this.validData;
	}
}
