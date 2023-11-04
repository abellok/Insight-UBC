import {Request, Response} from "express";
import InsightFacade from "../controller/InsightFacade";
import {InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";


export class ServerController {

	private insightFacade: InsightFacade;

	constructor() {
		this.insightFacade = new InsightFacade();
		console.log("Created new instance of InsightFacade!");
	}

	public putDataset(req: Request, res: Response) {
		const id = req.params.id;
		// content kind = req.params.kind;
		const kind: InsightDatasetKind = req.params.kind as InsightDatasetKind;
		// const content = req.body.toString("base64");
		const content = Buffer.from(req.body).toString("base64");

		this.insightFacade.addDataset(id, content, kind)
			.then((arr) => {
				res.status(200).send({result: arr});
			})
			.catch((err) => {
				res.status(400).send({error: err.message});
			});
	}

	public deleteDataset(req: Request, res: Response) {
		const id = req.params.id;

		this.insightFacade.removeDataset(id)
			.then((str) => {
				res.status(200).send({result: str});
			})
			.catch((err) => {
				if (err instanceof NotFoundError) {
					res.status(404).send({error: err.message});
				} else if (err instanceof InsightError) {
					res.status(400).send({error: err.message});
				}
			});
	}

	public postQuery(req: Request, res: Response) {
		const query = req.body;

		this.insightFacade.performQuery(query)
			.then((arr) => {
				res.status(200).send({result: arr});
			})
			.catch((err) => {
				res.status(400).send({error: err.message});
			});
	}

	public getDatasets(req: Request, res: Response) {
		this.insightFacade.listDatasets()
			.then((arr) => {
				res.status(200).send({result: arr});
			})
			.catch((err) => {
				res.status(400).send({error: err.message});
			});
	}
}
