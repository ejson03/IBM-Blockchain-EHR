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
    @Property()
    public doctorId: string;

    @Property()
    public licenseId: string;

    @Property()
    public name: string;

    @Property()
    public age: string;

    @Property()
    public phNo: string;

    @Property()
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
