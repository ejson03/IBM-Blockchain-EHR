export interface IDoctor {
    doctorId?: string;
    licenseId?: string;
    name?: string;
    age?: string;
    phNo?: string;
}
export declare class Doctor {
    doctorId: string;
    licenseId: string;
    name: string;
    age: string;
    phNo: string;
    type: string;
    constructor(doctorId: string, licenseId: string, name: string, age: string, phNo: string);
}
