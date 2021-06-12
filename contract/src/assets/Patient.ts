"use strict";
import { Object, Property } from "fabric-contract-api";

export interface IPatient {
    patientId?: string;
    adharNo?: string;
    name?: string;
    age?: string;
    phNo?: string;
}
@Object()
export class Patient {
    /**
     *
     * Patient
     *
     * Constructor for a Patient object.    *
     *
     * @param args.adharNo - the adhar number of the patient
     * @param args.name - name of patient
     * @param args.age - age of patient
     * @param args.phNo - phone number of patient
     * @returns - patient object
     */
    // @Property()
    public patientId: string;

    // @Property()
    public adharNo: string;

    // @Property()
    public name: string;

    // @Property()
    public age: string;

    // @Property()
    public phNo: string;

    // @Property()
    public type: string;

    constructor(
        patientId: string,
        adharNo: string,
        name: string,
        age: string,
        phNo: string
    ) {
        this.patientId = patientId;
        this.adharNo = adharNo;
        this.name = name;
        this.age = age;
        this.phNo = phNo;
        this.type = "patient";

        return this;
    }
}
