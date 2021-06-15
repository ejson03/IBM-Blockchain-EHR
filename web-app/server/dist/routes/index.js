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
exports.router = void 0;
const express_1 = require("express");
const controller = __importStar(require("../controller"));
exports.router = express_1.Router();
exports.router.get("/api/test", controller.test);
//get Patient info, create patient object, and update state with their
exports.router.post("/registerPatient", controller.registerPatient);
//used as a way to login the Patient to the router and make sure they haven't voted before
exports.router.post("/validatePatient", controller.validatePatient);
//get Doctor info, create doctor object, and update state with their
exports.router.post("/registerDoctor", controller.registerDoctor);
//used as a way to login the Doctor to the router and make sure they haven't voted before
exports.router.post("/validateDoctor", controller.validateDoctor);
exports.router.post("/postReport", controller.createReport);
exports.router.get("/getPatients", controller.getDoctors);
exports.router.get("/getDoctors", controller.getPatients);
exports.router.get("/getReports", controller.getReports);
//This will be used to ask for access to a report of a patient
exports.router.post("/requestAccess", controller.requestAccess);
//This will be used to grant access of a report to the doctor requesting access
exports.router.post("/grantAccess", controller.grantAccess);
//This will be used to reject access of a report to the doctor requesting access
exports.router.post("/rejectAccess", controller.rejectAccess);
//This will be used to reset the flags of a report of a patient
exports.router.post("/resetAccess", controller.resetAccess);
exports.router.post("/getReportData", controller.getReportData);
//# sourceMappingURL=index.js.map