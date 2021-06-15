"use strict";
import { Request, Response } from "express";
import * as util from "../utils";
import * as network from "../services/fabric-network";
import * as config from "../config";

const doctorOrg = "Org2";
const patientOrg = "Org1";

export const test = async (_req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(
    config.patientAdmin,
    patientOrg
  );
  const response = await network.invoke(
    networkObj,
    true,
    "printSomething",
    '{"Name":"Saxena","Emote":"Take the L"}'
  );
  const parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);
};

//get Patient info, create patient object, and update state with their
export const registerPatient = async (req: Request, res: Response) => {
  const patientId = Date.now().toString();
  req.body.patientId = patientId;
  const KVPairs = util.generateKVAttributes(req.body);
  let networkObj = await network.connectToNetwork(
    config.patientAdmin,
    patientOrg
  );
  const check = await network.invoke(
    networkObj,
    true,
    "checkExist",
    req.body.name
  );
  const parsedCheck = await JSON.parse(check);
  console.log("User exists response ", parsedCheck);
  if (!(Object.keys(parsedCheck).length === 0)) {
    res.send({ error: "The patient is already registered" });
  }
  const response = await network.register(req.body.name, KVPairs, patientOrg);
  console.log("Response from registerPatient: ", response);
  if ((response as any).error) {
    res.send((response as any).error);
  } else {
    networkObj = await network.connectToNetwork(req.body.name, patientOrg);

    if ((networkObj as any).error) {
      res.send((networkObj as any).error);
    }
    req.body = JSON.stringify(req.body);
    const args = [req.body];
    const invokeResponse = await network.invoke(
      networkObj,
      false,
      "createPatient",
      args
    );

    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {
      console.log("after network.invoke,  ", invokeResponse);
      const parsedResponse = JSON.parse(invokeResponse);
      parsedResponse.Success += `. Use patientId ${patientId} and password secret99 to login above.`;
      res.send(parsedResponse);
    }
  }
};

//used as a way to login the Patient to the app and make sure they haven't voted before
export const validatePatient = async (req: Request, res: Response) => {
  console.log("req.body: ");
  console.log(req.body);
  const networkObj = await network.connectToNetwork(
    req.body.patientId,
    patientOrg
  );
  console.log("networkobj: ");

  if ((networkObj as any).error) {
    res.send(networkObj);
  }
  req.body = JSON.stringify(req.body);
  const args = [req.body];
  const invokeResponse = await network.invoke(
    networkObj,
    true,
    "checkMyAsset",
    args
  );
  if (invokeResponse.error) {
    res.send(invokeResponse);
  } else {
    console.log("after network.invoke ");
    const parsedResponse = await JSON.parse(invokeResponse);
    // const response = `Patient with adharNo ${parsedResponse.adharNo} is logged in!.`
    res.send(parsedResponse);
  }
};

//get Doctor info, create doctor object, and update state with their
export const registerDoctor = async (req: Request, res: Response) => {
  const licenseId = req.body.licenseId;
  const doctorId = Date.now().toString();
  req.body.doctorId = doctorId;
  const KVPairs = util.generateKVAttributes(req.body);
  //first create the identity for the patient and add to walconst
  const response = await network.register(req.body.name, KVPairs, doctorOrg);
  if ((response as any).error) {
    res.send((response as any).error);
  } else {
    const networkObj = await network.connectToNetwork(req.body.name, doctorOrg);

    if ((networkObj as any).error) {
      res.send((networkObj as any).error);
    }

    req.body = JSON.stringify(req.body);
    const args = [req.body];
    //connect to network and update the state

    const invokeResponse = await network.invoke(
      networkObj,
      false,
      "createDoctor",
      args
    );

    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {
      console.log("after network.invoke ");
      const parsedResponse = JSON.parse(invokeResponse);
      parsedResponse.Success += `. Use doctorId ${doctorId} and password doctor99 to login above.`;
      res.send(parsedResponse);
    }
  }
};

//used as a way to login the Doctor to the app and make sure they haven't voted before
export const validateDoctor = async (req: Request, res: Response) => {
  console.log("req.body: ");
  console.log(req.body);
  const networkObj = await network.connectToNetwork(
    req.body.doctorId,
    doctorOrg
  );

  if ((networkObj as any).error) {
    res.send(networkObj);
  }

  req.body = JSON.stringify(req.body);
  const args = [req.body];
  const invokeResponse = await network.invoke(
    networkObj,
    true,
    "checkMyAsset",
    args
  );
  if (invokeResponse.error) {
    res.send(invokeResponse);
  } else {
    console.log("after network.invoke ");
    const parsedResponse = await JSON.parse(invokeResponse);
    // const response = `Doctor with adharNo ${parsedResponse.licenseId} is logged in!.`
    res.send(parsedResponse);
  }
};

export const createReport = async (req: Request, res: Response) => {
  console.log("req.body: ");
  console.log(req.body);
  const networkObj = await network.connectToNetwork(
    req.body.patientId,
    patientOrg
  );
  if ((networkObj as any).error) {
    res.send(networkObj);
  }
  const reportId = Date.now().toString();
  req.body.reportId = reportId;
  req.body = JSON.stringify(req.body);
  const args = [req.body];
  const invokeResponse = await network.invoke(
    networkObj,
    false,
    "createReport",
    args
  );
  res.send(invokeResponse);
};

export const getPatients = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(
    config.patientAdmin,
    patientOrg
  );
  const response = await network.invoke(networkObj, true, "getPatients", "");
  const parsedResponse = await JSON.parse(response);
  console.log(parsedResponse);
  res.send(parsedResponse);
};

export const getDoctors = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(
    config.doctorAdmin,
    doctorOrg
  );
  const response = await network.invoke(networkObj, true, "getDoctors", "");
  const parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);
};

export const getReports = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(
    config.patientAdmin,
    patientOrg
  );
  const response = await network.invoke(networkObj, true, "getReports", "");
  const parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);
};

//This will be used to ask for access to a report of a patient
export const requestAccess = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(
    req.body.patientId,
    patientOrg
  );
  req.body = JSON.stringify(req.body);
  console.log("req.body ", req.body);
  const args = [req.body];

  const response = await network.invoke(
    networkObj,
    false,
    "requestAccess",
    args
  );
  if (response.error) {
    res.send(response.error);
  } else {
    console.log("response: ", response);
    res.send(response);
  }
};

//This will be used to grant access of a report to the doctor requesting access
export const grantAccess = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(
    req.body.patientId,
    patientOrg
  );
  req.body = JSON.stringify(req.body);
  console.log("req.body ", req.body);
  const args = [req.body];
  const response = await network.invoke(networkObj, false, "grantAccess", args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log("response: ", response);
    res.send(response);
  }
};

//This will be used to reject access of a report to the doctor requesting access
export const rejectAccess = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(
    req.body.patientId,
    patientOrg
  );
  req.body = JSON.stringify(req.body);
  console.log("req.body ", req.body);
  const args = [req.body];
  const response = await network.invoke(
    networkObj,
    false,
    "rejectAccess",
    args
  );
  if (response.error) {
    res.send(response.error);
  } else {
    console.log("response ", response);
    res.send(response);
  }
};

//This will be used to reset the flags of a report of a patient
export const resetAccess = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(
    req.body.patientId,
    patientOrg
  );
  req.body = JSON.stringify(req.body);
  console.log("req.body ", req.body);
  const args = [req.body];
  const response = await network.invoke(networkObj, false, "resetAccess", args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log("response: ", response);
    res.send(response);
  }
};

export const getReportData = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(
    req.body.patientId,
    patientOrg
  );
  req.body = JSON.stringify(req.body);
  console.log("req.body ", req.body);
  const args = [req.body];
  const response = await network.invoke(
    networkObj,
    true,
    "getReportData",
    args
  );
  if (response.error) {
    res.send(response.error);
  } else {
    console.log("response: ");
    console.log(response);
    res.send(response);
  }
};
