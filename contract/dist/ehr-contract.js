"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EHRContract = void 0;
/*
 * SPDX-License-Identifier: Apache-2.0
 */
const fabric_contract_api_1 = require("fabric-contract-api");
const assets_1 = require("./assets");
let EHRContract = class EHRContract extends fabric_contract_api_1.Contract {
    async init(ctx) {
        console.log("instantiate was called!");
    }
    async myAssetExists(ctx, myAssetId) {
        const buffer = await ctx.stub.getState(myAssetId);
        return !!buffer && buffer.length > 0;
    }
    async createMyAsset(ctx, myAssetId, value) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (exists) {
            throw new Error(`The my asset ${myAssetId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(myAssetId, buffer);
    }
    async readMyAsset(ctx, args) {
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
    async checkMyAsset(ctx, args) {
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
    async printSomething(ctx, text) {
        return JSON.parse(text);
    }
    async createPatient(ctx, args) {
        const _args = JSON.parse(args);
        const newPatient = new assets_1.Patient(_args.patientId, _args.adharNo, _args.name, _args.age, _args.phNo);
        await ctx.stub.putState(newPatient.patientId, Buffer.from(JSON.stringify(newPatient)));
        const response = {
            Success: `Patient with name ${newPatient.name} has been successfully updated in the world state of the EHR blockchain network`,
        };
        console.log(response);
        return response;
    }
    async createDoctor(ctx, args) {
        const _args = JSON.parse(args);
        const newDoctor = new assets_1.Doctor(_args.doctorId, _args.licenseId, _args.name, _args.age, _args.phNo);
        await ctx.stub.putState(newDoctor.doctorId, Buffer.from(JSON.stringify(newDoctor)));
        const response = {
            Success: `Doctor with name ${newDoctor.name} is updated in the world state of the EHR blockchain network`,
        };
        return response;
    }
    async createReport(ctx, args) {
        const _args = JSON.parse(args);
        const myAssetId = _args.patientId;
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The patient ${myAssetId} does not exist`);
        }
        const report = "abcdefghijklmnopqrstuvwxyz";
        const newReport = new assets_1.Report(_args.reportId, _args.patientId, report, "0", "0");
        await ctx.stub.putState(newReport.reportId, Buffer.from(JSON.stringify(newReport)));
        const response = {
            Success: `New report with reportId ${newReport.reportId} for Patient with patientId ${newReport.patientId} has been added to the world state of the EHR blockchain network`,
        };
        console.log(response);
        return response;
    }
    async queryByObjectType(ctx, objectType) {
        const queryString = {
            selector: {
                type: objectType,
            },
        };
        const queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
        return queryResults;
    }
    async queryWithQueryString(ctx, queryString) {
        console.log("Query String: ", JSON.stringify(queryString));
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        const allResults = [];
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const res = await resultsIterator.next();
            if (res.value && res.value.value.toString()) {
                const jsonRes = {};
                console.log(res.value.value.toString());
                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString());
                }
                catch (err) {
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
    async checkExist(ctx, query) {
        const queryString = {
            selector: {
                name: query,
            },
        };
        const queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
        return queryResults;
    }
    async getPatients(ctx) {
        const queryResults = await this.queryByObjectType(ctx, "patient");
        return queryResults;
    }
    async getDoctors(ctx) {
        const queryResults = await this.queryByObjectType(ctx, "doctor");
        return queryResults;
    }
    async getReports(ctx) {
        const queryResults = await this.queryByObjectType(ctx, "report");
        return queryResults;
    }
    async getReportFromId(ctx, args) {
        const _args = JSON.parse(args);
        const myAssetId = _args.patientId;
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The patient ${myAssetId} does not exist`);
        }
        const reportAsBytes = await ctx.stub.getState(_args.reportId);
        const report = await JSON.parse(reportAsBytes.toString());
        return report;
    }
    async requestAccess(ctx, args) {
        const _args = JSON.parse(args);
        const report = await this.getReportFromId(ctx, _args);
        //update the isAsked flag for the report specified
        report.isAsked = "1";
        //update the state with the new flag isAsked value
        const result = await ctx.stub.putState(_args.reportId, Buffer.from(JSON.stringify(report)));
        +console.log(result);
        const response = {
            Success: `The request access for the report with reportId ${report.reportId} has been notified to the patient with patientId ${_args.patientId}. Please wait for the patient to respond to your request!`,
        };
        console.log(response);
        return response;
    }
    async grantAccess(ctx, args) {
        const _args = JSON.parse(args);
        const report = await this.getReportFromId(ctx, args);
        //update the isGiven flag for the report specified
        report.isGiven = "1";
        //update the state with the new flag isAsked value
        const result = await ctx.stub.putState(_args.reportId, Buffer.from(JSON.stringify(report)));
        console.log(result);
        const response = {
            Success: `The access for the report with reportId ${report.reportId} has been granted successfully! The Doctor will be notified regarding this.`,
        };
        console.log(response);
        return response;
    }
    async rejectAccess(ctx, args) {
        const _args = JSON.parse(args);
        const report = await this.getReportFromId(ctx, args);
        //update the isGiven flag for the report specified
        report.isGiven = "-1";
        //update the state with the new flag isAsked value
        const result = await ctx.stub.putState(_args.reportId, Buffer.from(JSON.stringify(report)));
        console.log(result);
        const response = {
            Success: `The access for the report with reportId ${report.reportId} has been rejected successfully! The Doctor will be notified regarding this.`,
        };
        console.log(response);
        return response;
    }
    async resetAccess(ctx, args) {
        const _args = JSON.parse(args);
        const report = await this.getReportFromId(ctx, args);
        //update the isAsked and isGiven flags  to defaults for the report specified!
        report.isAsked = "0";
        report.isGiven = "0";
        //update the state with the new flag isAsked value
        const result = await ctx.stub.putState(_args.reportId, Buffer.from(JSON.stringify(report)));
        console.log(result);
        const response = {
            Success: `The flags have been reset to default values (0,0)`,
        };
        console.log(response);
        return response;
    }
    async getReportData(ctx, args) {
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
};
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns("boolean"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "myAssetExists", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "createMyAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "readMyAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns("JSON"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "printSomething", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    fabric_contract_api_1.Returns("Success"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "createPatient", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    fabric_contract_api_1.Returns("Success"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "createDoctor", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    fabric_contract_api_1.Returns("Success"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "createReport", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns("string"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "queryByObjectType", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns("string"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "queryWithQueryString", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns("string"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "checkExist", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns("string"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "getPatients", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns("string"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "getDoctors", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns("string"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "getReports", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "getReportFromId", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    fabric_contract_api_1.Returns("Success"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "requestAccess", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    fabric_contract_api_1.Returns("Success"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "grantAccess", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    fabric_contract_api_1.Returns("Success"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "rejectAccess", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    fabric_contract_api_1.Returns("Success"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "resetAccess", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], EHRContract.prototype, "getReportData", null);
EHRContract = __decorate([
    fabric_contract_api_1.Info({ title: "EHRContract", description: "My Smart Contract" })
], EHRContract);
exports.EHRContract = EHRContract;
//# sourceMappingURL=ehr-contract.js.map