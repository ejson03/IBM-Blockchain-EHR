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
    @Property()
    public patientId: string;

    @Property()
    public adharNo: string;

    @Property()
    public name: string;

    @Property()
    public age: string;

    @Property()
    public phNo: string;

    @Property()
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
