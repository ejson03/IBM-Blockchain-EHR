export interface IReport {
    reportId?: string;
    patientId?: string;
    isAsked?: string;
    isGiven?: string;
    report?: string;
}
export declare class Report {
    reportId: string;
    patientId: string;
    isAsked: string;
    isGiven: string;
    report: string;
    type: string;
    constructor(reportId: string, patientId: string, report: string, isAsked: string, isGiven: string);
}
