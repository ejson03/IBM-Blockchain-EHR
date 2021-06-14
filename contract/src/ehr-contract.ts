/*
 * SPDX-License-Identifier: Apache-2.0
 */
import {
    Context,
    Contract,
    Info,
    Returns,
    Transaction,
} from "fabric-contract-api";
import { Doctor, Patient, Report } from "./assets";

type Success = {
    Success: string;
};

@Info({ title: "EHRContract", description: "My Smart Contract" })
export class EHRContract extends Contract {
    async init(ctx: Context) {
        console.log("instantiate was called!");
    }

    @Transaction(false)
    @Returns("boolean")
    async myAssetExists(ctx: Context, myAssetId: string): Promise<boolean> {
        const buffer: Uint8Array = await ctx.stub.getState(myAssetId);
        return !!buffer && buffer.length > 0;
    }

    @Transaction()
    async createMyAsset(
        ctx: Context,
        myAssetId: string,
        value: string
    ): Promise<void> {
        const exists: boolean = await this.myAssetExists(ctx, myAssetId);
        if (exists) {
            throw new Error(`The my asset ${myAssetId} already exists`);
        }
        const asset = { value };
        const buffer: Buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(myAssetId, buffer);
    }

    @Transaction()
    async readMyAsset(ctx: Context, args: string) {
        const _args = JSON.parse(args);
        const myAssetId = _args.patientId;
        console.log(myAssetId);
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(myAssetId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async checkMyAsset(ctx: Context, args: string) {
        const _args = JSON.parse(args);
        let myAssetId = _args.patientId;
        if (!myAssetId) {
            myAssetId = _args.doctorId;
        }
        console.log("HELLO");
        console.log(myAssetId);
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error("The my asset ${myAssetId} does not exist");
        }
        if (_args.pswd != "secret99") {
            if (_args.pswd != "doctor99") {
                return { error: "Wrong Password" };
            }
        }

        const buffer = await ctx.stub.getState(myAssetId);
        if (buffer) {
            return { Success: "Logged in successfully" };
        }
    }

    async updateMyAsset(ctx, myAssetId, newValue) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(myAssetId, buffer);
    }

    async deleteMyAsset(ctx, myAssetId) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        await ctx.stub.deleteState(myAssetId);
    }

    @Transaction(false)
    @Returns("JSON")
    async printSomething(ctx: Context, text: string): Promise<JSON> {
        return JSON.parse(text);
    }

    @Transaction()
    @Returns("Success")
    async createPatient(ctx: Context, args: string): Promise<Success> {
        const _args = JSON.parse(args);
        const newPatient: Patient = new Patient(
            _args.patientId,
            _args.adharNo,
            _args.name,
            _args.age,
            _args.phNo
        );
        await ctx.stub.putState(
            newPatient.patientId,
            Buffer.from(JSON.stringify(newPatient))
        );
        const response: Success = {
            Success: `Patient with name ${newPatient.name} has been successfully updated in the world state of the EHR blockchain network`,
        };
        console.log(response);
        return response;
    }

    @Transaction()
    @Returns("Success")
    async createDoctor(ctx: Context, args: string): Promise<Success> {
        const _args = JSON.parse(args);
        const newDoctor = new Doctor(
            _args.doctorId,
            _args.licenseId,
            _args.name,
            _args.age,
            _args.phNo
        );
        await ctx.stub.putState(
            newDoctor.doctorId,
            Buffer.from(JSON.stringify(newDoctor))
        );
        const response: Success = {
            Success: `Doctor with name ${newDoctor.name} is updated in the world state of the EHR blockchain network`,
        };
        return response;
    }

    @Transaction()
    @Returns("Success")
    async createReport(ctx: Context, args: string): Promise<Success> {
        const _args = JSON.parse(args);
        const myAssetId = _args.patientId;
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The patient ${myAssetId} does not exist`);
        }
        const report = "abcdefghijklmnopqrstuvwxyz";
        const newReport = new Report(
            _args.reportId,
            _args.patientId,
            report,
            "0",
            "0"
        );
        await ctx.stub.putState(
            newReport.reportId,
            Buffer.from(JSON.stringify(newReport))
        );

        const response: Success = {
            Success: `New report with reportId ${newReport.reportId} for Patient with patientId ${newReport.patientId} has been added to the world state of the EHR blockchain network`,
        };
        console.log(response);
        return response;
    }

    @Transaction(false)
    @Returns("string")
    async queryByObjectType(ctx: Context, objectType: string): Promise<string> {
        const queryString = {
            selector: {
                type: objectType,
            },
        };

        const queryResults = await this.queryWithQueryString(
            ctx,
            JSON.stringify(queryString)
        );
        return queryResults;
    }

    @Transaction(false)
    @Returns("string")
    async queryWithQueryString(
        ctx: Context,
        queryString: string
    ): Promise<string> {
        console.log("Query String: ", JSON.stringify(queryString));
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        const allResults = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                const jsonRes: any = {};
                console.log(res.value.value.toString());
                jsonRes.Key = res.value.key;

                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString());
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString();
                }

                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log("end of data");
                await resultsIterator.close();
                console.info(allResults);
                console.log(JSON.stringify(allResults));
                return JSON.stringify(allResults);
            }
        }
    }

    @Transaction(false)
    @Returns("string")
    async checkExist(ctx: Context, query: string): Promise<string> {
        const queryString = {
            selector: {
                name: query,
            },
        };
        const queryResults = await this.queryWithQueryString(
            ctx,
            JSON.stringify(queryString)
        );
        return queryResults;
    }

    @Transaction(false)
    @Returns("string")
    async getPatients(ctx: Context): Promise<string> {
        const queryResults = await this.queryByObjectType(ctx, "patient");
        return queryResults;
    }

    @Transaction(false)
    @Returns("string")
    async getDoctors(ctx: Context): Promise<string> {
        const queryResults = await this.queryByObjectType(ctx, "doctor");
        return queryResults;
    }

    @Transaction(false)
    @Returns("string")
    async getReports(ctx: Context): Promise<string> {
        const queryResults = await this.queryByObjectType(ctx, "report");
        return queryResults;
    }

    @Transaction(false)
    async getReportFromId(ctx: Context, args: string) {
        const _args = JSON.parse(args);

        const myAssetId = _args.patientId;
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The patient ${myAssetId} does not exist`);
        }
        const reportAsBytes: Uint8Array = await ctx.stub.getState(
            _args.reportId
        );
        const report = await JSON.parse(reportAsBytes.toString());
        return report;
    }

    @Transaction()
    @Returns("Success")
    async requestAccess(ctx: Context, args: string): Promise<Success> {
        const _args = JSON.parse(args);

        const report = await this.getReportFromId(ctx, _args);
        //update the isAsked flag for the report specified
        report.isAsked = "1";
        //update the state with the new flag isAsked value
        const result = await ctx.stub.putState(
            _args.reportId,
            Buffer.from(JSON.stringify(report))
        );
        +console.log(result);
        const response = {
            Success: `The request access for the report with reportId ${report.reportId} has been notified to the patient with patientId ${_args.patientId}. Please wait for the patient to respond to your request!`,
        };
        console.log(response);
        return response;
    }

    @Transaction()
    @Returns("Success")
    async grantAccess(ctx: Context, args: string): Promise<Success> {
        const _args = JSON.parse(args);

        const report = await this.getReportFromId(ctx, args);
        //update the isGiven flag for the report specified
        report.isGiven = "1";
        //update the state with the new flag isAsked value
        const result = await ctx.stub.putState(
            _args.reportId,
            Buffer.from(JSON.stringify(report))
        );
        console.log(result);
        const response = {
            Success: `The access for the report with reportId ${report.reportId} has been granted successfully! The Doctor will be notified regarding this.`,
        };
        console.log(response);
        return response;
    }

    @Transaction()
    @Returns("Success")
    async rejectAccess(ctx: Context, args: string): Promise<Success> {
        const _args = JSON.parse(args);

        const report = await this.getReportFromId(ctx, args);
        //update the isGiven flag for the report specified
        report.isGiven = "-1";
        //update the state with the new flag isAsked value
        const result = await ctx.stub.putState(
            _args.reportId,
            Buffer.from(JSON.stringify(report))
        );
        console.log(result);

        const response = {
            Success: `The access for the report with reportId ${report.reportId} has been rejected successfully! The Doctor will be notified regarding this.`,
        };
        console.log(response);
        return response;
    }

    @Transaction()
    @Returns("Success")
    async resetAccess(ctx: Context, args: string): Promise<Success> {
        const _args = JSON.parse(args);

        const report = await this.getReportFromId(ctx, args);

        //update the isAsked and isGiven flags  to defaults for the report specified!
        report.isAsked = "0";
        report.isGiven = "0";

        //update the state with the new flag isAsked value
        const result = await ctx.stub.putState(
            _args.reportId,
            Buffer.from(JSON.stringify(report))
        );
        console.log(result);

        const response = {
            Success: `The flags have been reset to default values (0,0)`,
        };
        console.log(response);
        return response;
    }

    @Transaction()
    async getReportData(ctx: Context, args: string) {
        const _args = JSON.parse(args);
        const myAssetId = _args.reportId;
        console.log("Inside getReportData");
        console.log(myAssetId);
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The report ${myAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(myAssetId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }
}
