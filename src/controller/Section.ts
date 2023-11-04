import {randomFill} from "crypto";

export default class Section {
	private section_uuid: string;
	private section_id: string;
	private section_title: string;
	private section_instructor: string;
	private section_dept: string;
	private section_year: any;
	private section_avg: any;
	private section_pass: number;
	private section_fail: number;
	private section_audit: number;

	constructor(id: string, course: string, title: string, professor: string, subject: string,
		year: number, avg: number, pass: number, fail: number, audit: number) {
		this.section_uuid = id;
		this.section_id = course;
		this.section_title = title;
		this.section_instructor = professor;
		this.section_dept = subject;
		this.section_year = year;
		this.section_avg = avg;
		this.section_pass = pass;
		this.section_fail = fail;
		this.section_audit = audit;
	}

	public getUUID() {
		return this.section_uuid;
	}

	public getID() {
		return this.section_id;
	}

	public getTitle() {
		return this.section_title;
	}

	public getInstructor() {
		return this.section_instructor;
	}

	public getDept() {
		return this.section_dept;
	}

	public getYear() {
		return this.section_year;
	}

	public getAvg() {
		return this.section_avg;
	}

	public getPass() {
		return this.section_pass;
	}

	public getFail() {
		return this.section_fail;
	}

	public getAudit() {
		return this.section_audit;
	}

	public getFieldValue(field: string): string | number {
		if ((field === "avg") || (field === "pass") || (field === "fail") || (field === "audit")
			|| (field === "year")) {
			return this.getMField(field);
		} else {
			return this.getSField(field);
		}
	}

	public getMField(mfield: string): number {
		let mFieldValue: number = 0;
		if (mfield === "avg") {
			mFieldValue = this.getAvg();
		}
		if (mfield === "pass") {
			mFieldValue = this.getPass();
		}
		if (mfield === "fail") {
			mFieldValue = this.getFail();
		}
		if (mfield === "audit") {
			mFieldValue = this.getAudit();
		}
		if (mfield === "year") {
			mFieldValue = this.getYear();
		}
		return mFieldValue;
	}

	public getSField(sfield: string): string {
		let sFieldValue: string = "";
		if (sfield === "uuid") {
			sFieldValue = this.getUUID();
		}
		if (sfield === "id") {
			sFieldValue = this.getID();
		}
		if (sfield === "title") {
			sFieldValue = this.getTitle();
		}
		if (sfield === "instructor") {
			sFieldValue = this.getInstructor();
		}
		if (sfield === "dept") {
			sFieldValue = this.getDept();
		}
		return sFieldValue;
	}
}
