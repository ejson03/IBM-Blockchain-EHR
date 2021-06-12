"use strict";

import { Object, Property } from "fabric-contract-api";

export interface IReport {
    reportId?: string;
    patientId?: string;
    isAsked?: string;
    isGiven?: string;
    report?: string;
}

@Object()
export class Report {
    /**
     *
     * Report
     *
     * Constructor for a Report object.
     *
     * @param args.licenseId - the license number of the Doctor
     * @param args.name - name of Doctor
     * @param args.age - age of Doctor
     * @param args.phNo - phone number of Doctor
     * @returns - doctor object
     */

    // @Property()
    public reportId: string;

    // @Property()
    public patientId: string;

    // @Property()
    public isAsked: string;

    // @Property()
    public isGiven: string;

    // @Property()
    public report: string;

    // @Property()
    public type: string;

    constructor(
        reportId: string,
        patientId: string,
        report: string,
        isAsked: string,
        isGiven: string /*, recordNo*/
    ) {
        this.reportId = reportId;
        this.patientId = patientId;
        this.report = report;
        this.isAsked = isAsked;
        this.isGiven = isGiven;
        this.type = "report";

        return this;
    }
}
