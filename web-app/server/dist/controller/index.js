"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportData = exports.resetAccess = exports.rejectAccess = exports.grantAccess = exports.requestAccess = exports.getReports = exports.getDoctors = exports.getPatients = exports.createReport = exports.validateDoctor = exports.registerDoctor = exports.validatePatient = exports.registerPatient = exports.test = void 0;
const util = __importStar(require("../utils"));
const network = __importStar(require("../services/fabric-network"));
const config = __importStar(require("../config"));
const doctorOrg = "Org2";
const patientOrg = "Org1";
exports.test = async (_req, res) => {
    const networkObj = await network.connectToNetwork(config.patientAdmin, patientOrg);
    const response = await network.invoke(networkObj, true, "printSomething", '{"Name":"Saxena","Emote":"Take the L"}');
    const parsedResponse = await JSON.parse(response);
    res.send(parsedResponse);
};
//get Patient info, create patient object, and update state with their
exports.registerPatient = async (req, res) => {
    const patientId = Date.now().toString();
    req.body.patientId = patientId;
    const KVPairs = util.generateKVAttributes(req.body);
    //check weather he is registered already or not
    let networkObj = await network.connectToNetwork(config.patientAdmin, patientOrg);
    const check = await network.invoke(networkObj, true, "checkExist", req.body.name);
    const parsedCheck = await JSON.parse(check);
    console.log("User exists response ", parsedCheck);
    if (!(Object.keys(parsedCheck).length === 0)) {
        res.send({ error: "The patient is already registered" });
    }
    const response = await network.register(req.body.name, KVPairs, patientOrg);
    console.log("Response from registerPatient: ", response);
    if (response.error) {
        res.send(response.error);
    }
    else {
        networkObj = await network.connectToNetwork(req.body.name, patientOrg);
        if (networkObj.error) {
            res.send(networkObj.error);
        }
        req.body = JSON.stringify(req.body);
        const args = [req.body];
        const invokeResponse = await network.invoke(networkObj, false, "createPatient", args);
        if (invokeResponse.error) {
            res.send(invokeResponse.error);
        }
        else {
            console.log("after network.invoke,  ", invokeResponse);
            const parsedResponse = JSON.parse(invokeResponse);
            parsedResponse.Success += `. Use patientId ${patientId} and password secret99 to login above.`;
            res.send(parsedResponse);
        }
    }
};
//used as a way to login the Patient to the app and make sure they haven't voted before
exports.validatePatient = async (req, res) => {
    console.log("req.body: ");
    console.log(req.body);
    const networkObj = await network.connectToNetwork(req.body.patientId, patientOrg);
    console.log("networkobj: ");
    if (networkObj.error) {
        res.send(networkObj);
    }
    req.body = JSON.stringify(req.body);
    const args = [req.body];
    const invokeResponse = await network.invoke(networkObj, true, "checkMyAsset", args);
    if (invokeResponse.error) {
        res.send(invokeResponse);
    }
    else {
        console.log("after network.invoke ");
        const parsedResponse = await JSON.parse(invokeResponse);
        // const response = `Patient with adharNo ${parsedResponse.adharNo} is logged in!.`
        res.send(parsedResponse);
    }
};
//get Doctor info, create doctor object, and update state with their
exports.registerDoctor = async (req, res) => {
    const licenseId = req.body.licenseId;
    const doctorId = Date.now().toString();
    req.body.doctorId = doctorId;
    const KVPairs = util.generateKVAttributes(req.body);
    //first create the identity for the patient and add to walconst
    const response = await network.register(req.body.name, KVPairs, doctorOrg);
    if (response.error) {
        res.send(response.error);
    }
    else {
        const networkObj = await network.connectToNetwork(req.body.name, doctorOrg);
        if (networkObj.error) {
            res.send(networkObj.error);
        }
        req.body = JSON.stringify(req.body);
        const args = [req.body];
        //connect to network and update the state
        const invokeResponse = await network.invoke(networkObj, false, "createDoctor", args);
        if (invokeResponse.error) {
            res.send(invokeResponse.error);
        }
        else {
            console.log("after network.invoke ");
            const parsedResponse = JSON.parse(invokeResponse);
            parsedResponse.Success += `. Use doctorId ${doctorId} and password doctor99 to login above.`;
            res.send(parsedResponse);
        }
    }
};
//used as a way to login the Doctor to the app and make sure they haven't voted before
exports.validateDoctor = async (req, res) => {
    console.log("req.body: ");
    console.log(req.body);
    const networkObj = await network.connectToNetwork(req.body.doctorId, doctorOrg);
    if (networkObj.error) {
        res.send(networkObj);
    }
    req.body = JSON.stringify(req.body);
    const args = [req.body];
    const invokeResponse = await network.invoke(networkObj, true, "checkMyAsset", args);
    if (invokeResponse.error) {
        res.send(invokeResponse);
    }
    else {
        console.log("after network.invoke ");
        const parsedResponse = await JSON.parse(invokeResponse);
        // const response = `Doctor with adharNo ${parsedResponse.licenseId} is logged in!.`
        res.send(parsedResponse);
    }
};
exports.createReport = async (req, res) => {
    console.log("req.body: ");
    console.log(req.body);
    const networkObj = await network.connectToNetwork(req.body.patientId, patientOrg);
    if (networkObj.error) {
        res.send(networkObj);
    }
    const reportId = Date.now().toString();
    req.body.reportId = reportId;
    req.body = JSON.stringify(req.body);
    const args = [req.body];
    const invokeResponse = await network.invoke(networkObj, false, "createReport", args);
    res.send(invokeResponse);
};
exports.getPatients = async (req, res) => {
    const networkObj = await network.connectToNetwork(config.patientAdmin, patientOrg);
    const response = await network.invoke(networkObj, true, "getPatients", "");
    const parsedResponse = await JSON.parse(response);
    console.log(parsedResponse);
    res.send(parsedResponse);
};
exports.getDoctors = async (req, res) => {
    const networkObj = await network.connectToNetwork(config.doctorAdmin, doctorOrg);
    const response = await network.invoke(networkObj, true, "getDoctors", "");
    const parsedResponse = await JSON.parse(response);
    res.send(parsedResponse);
};
exports.getReports = async (req, res) => {
    const networkObj = await network.connectToNetwork(config.patientAdmin, patientOrg);
    const response = await network.invoke(networkObj, true, "getReports", "");
    const parsedResponse = await JSON.parse(response);
    res.send(parsedResponse);
};
//This will be used to ask for access to a report of a patient
exports.requestAccess = async (req, res) => {
    const networkObj = await network.connectToNetwork(req.body.patientId, patientOrg);
    req.body = JSON.stringify(req.body);
    console.log("req.body ", req.body);
    const args = [req.body];
    const response = await network.invoke(networkObj, false, "requestAccess", args);
    if (response.error) {
        res.send(response.error);
    }
    else {
        console.log("response: ", response);
        res.send(response);
    }
};
//This will be used to grant access of a report to the doctor requesting access
exports.grantAccess = async (req, res) => {
    const networkObj = await network.connectToNetwork(req.body.patientId, patientOrg);
    req.body = JSON.stringify(req.body);
    console.log("req.body ", req.body);
    const args = [req.body];
    const response = await network.invoke(networkObj, false, "grantAccess", args);
    if (response.error) {
        res.send(response.error);
    }
    else {
        console.log("response: ", response);
        res.send(response);
    }
};
//This will be used to reject access of a report to the doctor requesting access
exports.rejectAccess = async (req, res) => {
    const networkObj = await network.connectToNetwork(req.body.patientId, patientOrg);
    req.body = JSON.stringify(req.body);
    console.log("req.body ", req.body);
    const args = [req.body];
    const response = await network.invoke(networkObj, false, "rejectAccess", args);
    if (response.error) {
        res.send(response.error);
    }
    else {
        console.log("response ", response);
        res.send(response);
    }
};
//This will be used to reset the flags of a report of a patient
exports.resetAccess = async (req, res) => {
    const networkObj = await network.connectToNetwork(req.body.patientId, patientOrg);
    req.body = JSON.stringify(req.body);
    console.log("req.body ", req.body);
    const args = [req.body];
    const response = await network.invoke(networkObj, false, "resetAccess", args);
    if (response.error) {
        res.send(response.error);
    }
    else {
        console.log("response: ", response);
        res.send(response);
    }
};
exports.getReportData = async (req, res) => {
    const networkObj = await network.connectToNetwork(req.body.patientId, patientOrg);
    req.body = JSON.stringify(req.body);
    console.log("req.body ", req.body);
    const args = [req.body];
    const response = await network.invoke(networkObj, true, "getReportData", args);
    if (response.error) {
        res.send(response.error);
    }
    else {
        console.log("response: ");
        console.log(response);
        res.send(response);
    }
};
//# sourceMappingURL=index.js.map