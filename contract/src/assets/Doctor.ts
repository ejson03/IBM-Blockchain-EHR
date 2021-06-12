"use strict";
import { Object, Property } from "fabric-contract-api";

export interface IDoctor {
    doctorId?: string;
    licenseId?: string;
    name?: string;
    age?: string;
    phNo?: string;
}

@Object()
export class Doctor {
    /**
     *
     * Doctor
     *
     * Constructor for a Doctor object.
     *
     * @param args.licenseId - the license number of the Doctor
     * @param args.name - name of Doctor
     * @param args.age - age of Doctor
     * @param args.phNo - phone number of Doctor
     * @returns - doctor object
     */
    // @Property()
    public doctorId: string;

    // @Property()
    public licenseId: string;

    // @Property()
    public name: string;

    // @Property()
    public age: string;

    // @Property()
    public phNo: string;

    // @Property()
    public type: string;

    constructor(
        doctorId: string,
        licenseId: string,
        name: string,
        age: string,
        phNo: string
    ) {
        this.doctorId = doctorId;
        this.licenseId = licenseId;
        this.name = name;
        this.age = age;
        this.phNo = phNo;
        this.type = "doctor";

        return this;
    }
}
