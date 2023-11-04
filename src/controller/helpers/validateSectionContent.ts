import JSZip from "jszip";
import InsightFacade from "../InsightFacade";
import {InsightDataset, InsightError} from "../IInsightFacade";
import {throws} from "assert";
import Dataset from "../Dataset";
import Section from "../Section";
import {create} from "domain";
import {parse} from "parse5";

// checks if section content is valid, then creates Dataset full of valid sections and adds it to map
export async function validateSectionContent(content: string, map: Map<string, any>,
											 dataset: Dataset): Promise<Dataset> {
	const files: Array<Promise<string>> = [];
	let data = new Dataset();
	let zip = new JSZip();

	try {
		// unzips file to JSZip
		const newZip = await zip.loadAsync(content, {base64: true});
		let courses = newZip.folder("courses/");

		if (courses != null) {
			courses.forEach(function (relativePath: any, file: any) {
				files.push(file.async("text")); // an array of promises?
				// catch files that can't be changed to text
			});
		} else {
			throw new InsightError("courses folder doesn't exist");
		}
		// fulfill promises made by file.async, and parse files to json
		const textArray = await Promise.all(files);
		for (let textFile of textArray) {
			let parsedFile = JSON.parse(textFile); // parsed file!
			for (let sect of parsedFile.result) {
				let newSect = createSection(sect);
				if (!(newSect.getUUID() === null)) {
					data.addValidData(newSect);
				}
			}
		}
		return data;
	} catch (error) {
		throw new InsightError("Failed to validate section content");
	}
}

export function createSection(textFile: any): Section {
	// for (let sect of textFile.result) {	// check if each section has needed fields
	if (Object.hasOwn(textFile, "id") && Object.hasOwn(textFile, "Course")
			&& Object.hasOwn(textFile, "Title") && Object.hasOwn(textFile, "Professor")
			&& Object.hasOwn(textFile, "Subject") && Object.hasOwn(textFile, "Year")
			&& Object.hasOwn(textFile, "Avg") && Object.hasOwn(textFile, "Pass")
			&& Object.hasOwn(textFile, "Fail") && Object.hasOwn(textFile, "Audit")) {
		let id = textFile.id;
			// if(Number.isInteger(id)) {
			// 	id = id.toString();
			// }
		let course = textFile.Course;
		let title = textFile.Title;
		let professor = textFile.Professor;
		let subject = textFile.Subject;				// get needed fields
		let year = textFile.Year;
			// if(!Number.isInteger(year)) {
			// 	year = Number(year);
			// }
		let avg = textFile.Avg;
			// if(!Number.isInteger(avg)) {
			// 	year = Number(year);
			// }
		let pass = textFile.Pass;
		let fail = textFile.Fail;
		let audit = textFile.Audit;
		let sec = textFile.Section;

		if (sec === "overall") {					// checks requirement for 'section' (see spec for more info)
			year = 1900;
		}
			// create instance of section class
		let successfulSection: Section;
		successfulSection = new Section(id, course, title, professor, subject,
			year, avg, pass, fail, audit);
		return successfulSection;

	}
	// }
	let unsuccessfulSection: Section;
	unsuccessfulSection = new Section("null", "null", "null", "null", "null",
		1000, 1000, 0, 0, 0);
	return unsuccessfulSection;
}
