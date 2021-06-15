export interface IPatient {
    patientId?: string;
    adharNo?: string;
    name?: string;
    age?: string;
    phNo?: string;
}
export declare class Patient {
    patientId: string;
    adharNo: string;
    name: string;
    age: string;
    phNo: string;
    type: string;
    constructor(patientId: string, adharNo: string, name: string, age: string, phNo: string);
}
