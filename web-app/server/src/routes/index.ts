import { Router, Request, Response } from "express";
import * as controller from "../controller";

export const router: Router = Router();
router.get("/api/test", controller.test);
//get Patient info, create patient object, and update state with their
router.post("/registerPatient", controller.registerPatient);
//used as a way to login the Patient to the router and make sure they haven't voted before
router.post("/validatePatient", controller.validatePatient);
//get Doctor info, create doctor object, and update state with their
router.post("/registerDoctor", controller.registerDoctor);
//used as a way to login the Doctor to the router and make sure they haven't voted before
router.post("/validateDoctor", controller.validateDoctor);
router.post("/postReport", controller.createReport);
router.get("/getPatients", controller.getDoctors);
router.get("/getDoctors", controller.getPatients);
router.get("/getReports", controller.getReports);
//This will be used to ask for access to a report of a patient
router.post("/requestAccess", controller.requestAccess);
//This will be used to grant access of a report to the doctor requesting access
router.post("/grantAccess", controller.grantAccess);
//This will be used to reject access of a report to the doctor requesting access
router.post("/rejectAccess", controller.rejectAccess);
//This will be used to reset the flags of a report of a patient
router.post("/resetAccess", controller.resetAccess);
router.post("/getReportData", controller.getReportData);
