'use strict';
import { Request, Response } from 'express';
import * as util from "../utils"
import * as network from "../services/fabric-network"
import * as config from "../config"

export const test = async (_req: Request, res: Response) => {
    const networkObj = await network.connectToNetwork(config.patientAdmin, config.orgMSPID_pat);
    console.info(networkObj)
    const response = await network.invoke(networkObj, true, 'printSomething', '{"Name":"Saxena","Emote":"Take the L"}');
    const parsedResponse = await JSON.parse(response);
    res.send(parsedResponse);
};

//get Patient info, create patient object, and update state with their 
export const registerPatient = async (req: Request, res: Response) => {
    const patientId = Date.now().toString();
    req.body.patientId = patientId;
    console.info('req.body: ' req.body);
    const KVPairs = util.generateKVAttributes(req.body)
    //check weather he is registered already or not
    const networkObj = await network.connectToNetwork(config.patientAdmin, config.orgMSPID_pat);
    const check = await network.invoke(networkObj, true, 'checkExist', req.body.adharNo);
    const parsedCheck = await JSON.parse(check);
    console.log(parsedCheck);
    if (!(Object.keys(parsedCheck).length === 0 && obj.constructor === Object)) {
        res.send({ "error": "The patient is already registered" });
    }
  
    //first create the identity for the patient and add to walconst
    const response = await network.register(patientId, req.body.adharNo, req.body.name, req.body.age, req.body.phNo, config.orgMSPID_pat);
    console.log('response from registerPatient: ');
    console.log(response);
    if (response.error) {
        res.send(response.error);
    } else {
        console.log('req.body.adharNo');
        console.log(req.body.adharNo);
        networkObj = await network.connectToNetwork(patientId, config.orgMSPID_pat);
        console.log('networkobj: ');
        console.log(networkObj);
  
        if (networkObj.error) {
            res.send(networkObj.error);
        }
        console.log('network obj');
        console.log(util.inspect(networkObj));
  
  
        req.body = JSON.stringify(req.body);
        const args = [req.body];
        //connect to network and update the state  
  
        const invokeResponse = await network.invoke(networkObj, false, 'createPatient', args);
      
        if (invokeResponse.error) {
            res.send(invokeResponse.error);
        } else {
  
            console.log('after network.invoke ');
            const parsedResponse = JSON.parse(invokeResponse);
            parsedResponse.Success += `. Use patientId ${patientId} and password secret99 to login above.`;
        
            res.send(parsedResponse);
  
        }
    }
};
  
  //used as a way to login the Patient to the app and make sure they haven't voted before 
export const validatePatient = async (req: Request, res: Response) => {
    console.log('req.body: ');
    console.log(req.body);
    const networkObj = await network.connectToNetwork(req.body.patientId, config.orgMSPID_pat);
    console.log('networkobj: ');
    console.log(util.inspect(networkObj));

    if (networkObj.error) {
        res.send(networkObj);
    }
    req.body = JSON.stringify(req.body);
    const args = [req.body];
    const invokeResponse = await network.invoke(networkObj, true, 'checkMyAsset', args);
    if (invokeResponse.error) {
        res.send(invokeResponse);
    } else {
        console.log('after network.invoke ');
        const parsedResponse = await JSON.parse(invokeResponse);
        // const response = `Patient with adharNo ${parsedResponse.adharNo} is logged in!.`  
        res.send(parsedResponse);
    }
};

//get Doctor info, create doctor object, and update state with their 
export const registerDoctor = async (req: Request, res: Response) => {
  console.log('req.body: ');
  console.log(req.body);
  const licenseId = req.body.licenseId;
  const doctorId = Date.now().toString();
  req.body.doctorId = doctorId;

  //first create the identity for the patient and add to walconst
  const response = await network.registerDoctor(doctorId, licenseId, req.body.name, req.body.age, req.body.phNo, doctorOrg);
  console.log('response from registerDoctor: ');
  console.log(response);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('req.body.licenseId');
    console.log(req.body.licenseId);
    const networkObj = await network.connectToNetwork(doctorId, doctorOrg);
    console.log('networkobj: ');
    console.log(networkObj);

    if (networkObj.error) {
      res.send(networkObj.error);
    }
    console.log('network obj');
    console.log(util.inspect(networkObj));


    req.body = JSON.stringify(req.body);
    const args = [req.body];
    //connect to network and update the state  

    const invokeResponse = await network.invoke(networkObj, false, 'createDoctor', args);
    
    if (invokeResponse.error) {
      res.send(invokeResponse.error);
    } else {

      console.log('after network.invoke ');
      const parsedResponse = JSON.parse(invokeResponse);
      parsedResponse.Success += `. Use doctorId ${doctorId} and password doctor99 to login above.`;
      res.send(parsedResponse);

    }
  }
};

//used as a way to login the Doctor to the app and make sure they haven't voted before 
export const validateDoctor = async (req: Request, res: Response) => {
  console.log('req.body: ');
  console.log(req.body);
  const networkObj = await network.connectToNetwork(req.body.doctorId, doctorOrg);
  console.log('networkobj: ');
  console.log(util.inspect(networkObj));

  if (networkObj.error) {
    res.send(networkObj);
  }

  req.body = JSON.stringify(req.body);
  const args = [req.body];
  const invokeResponse = await network.invoke(networkObj, true, 'checkMyAsset', args);
  if (invokeResponse.error) {
    res.send(invokeResponse);
  } else {
    console.log('after network.invoke ');
    const parsedResponse = await JSON.parse(invokeResponse);
    // const response = `Doctor with adharNo ${parsedResponse.licenseId} is logged in!.`  
    res.send(parsedResponse);
  }

};

export const createReport= async (req: Request, res: Response) => {
  console.log('req.body: ');
  console.log(req.body);
  const networkObj = await network.connectToNetwork(req.body.patientId, config.orgMSPID_pat);
  console.log('networkobj: ');
  console.log(util.inspect(networkObj));

  if (networkObj.error) {
    res.send(networkObj);
  }
  const reportId = Date.now().toString();
  req.body.reportId = reportId;

  req.body = JSON.stringify(req.body);
  const args = [req.body];
  const invokeResponse = await network.invoke(networkObj, false, 'createReport', args);

  res.send(invokeResponse);
};

export const getPatients = async (req: Request, res: Response) => {

  const networkObj = await network.connectToNetwork(config.patientAdmin, config.orgMSPID_pat);
  console.log('networkobj: ');
  console.log(util.inspect(networkObj));

  const response = await network.invoke(networkObj, true, 'getPatients', '');
  const parsedResponse = await JSON.parse(response);
  console.log(parsedResponse);
  res.send(parsedResponse);

};

export const getDoctors = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(doctorAdmin, doctorOrg);
  //console.log('networkobj: ');
  //console.log(util.inspect(networkObj));

  const response = await network.invoke(networkObj, true, 'getDoctors', '');
  const parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);
});

export const getReports = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(config.patientAdmin, config.orgMSPID_pat);
  //console.log('networkobj: ');
  //console.log(util.inspect(networkObj));
  const response = await network.invoke(networkObj, true, 'getReports', '');
  const parsedResponse = await JSON.parse(response);
  res.send(parsedResponse);
};

//This will be used to ask for access to a report of a patient
export const requestAccess = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(req.body.patientId, config.orgMSPID_pat);
  console.log('util inspecting');
  req.body = JSON.stringify(req.body);
  console.log('req.body');
  console.log(req.body);
  const args = [req.body];

  const response = await network.invoke(networkObj, false, 'requestAccess', args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response: ');
    console.log(response);
    // const parsedResponse = await JSON.parse(response);
    res.send(response);
  }
};

//This will be used to grant access of a report to the doctor requesting access
export const grantAccess = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(req.body.patientId, config.orgMSPID_pat);
  console.log('util inspecting');
  console.log(util.inspect(networkObj));
  req.body = JSON.stringify(req.body);
  console.log('req.body');
  console.log(req.body);
  const args = [req.body];

  const response = await network.invoke(networkObj, false, 'grantAccess', args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response: ');
    console.log(response);
    // const parsedResponse = await JSON.parse(response);
    res.send(response);
  }
};

//This will be used to reject access of a report to the doctor requesting access
export const rejectAccess = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(req.body.patientId, config.orgMSPID_pat);
  console.log('util inspecting');
  console.log(util.inspect(networkObj));
  req.body = JSON.stringify(req.body);
  console.log('req.body');
  console.log(req.body);
  const args = [req.body];

  const response = await network.invoke(networkObj, false, 'rejectAccess', args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response: ');
    console.log(response);
    // const parsedResponse = await JSON.parse(response);
    res.send(response);
  }
};

//This will be used to reset the flags of a report of a patient
export const resetAccess = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(req.body.patientId, config.orgMSPID_pat);
  console.log('util inspecting');
  console.log(util.inspect(networkObj));
  req.body = JSON.stringify(req.body);
  console.log('req.body');
  console.log(req.body);
  const args = [req.body];

  const response = await network.invoke(networkObj, false, 'resetAccess', args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response: ');
    console.log(response);
    // const parsedResponse = await JSON.parse(response);
    res.send(response);
  }
};

export const getReportData = async (req: Request, res: Response) => {
  const networkObj = await network.connectToNetwork(req.body.patientId, config.orgMSPID_pat);
  console.log('util inspecting');
  console.log(util.inspect(networkObj));
  req.body = JSON.stringify(req.body);
  console.log('req.body');
  console.log(req.body);
  const args = [req.body];

  const response = await network.invoke(networkObj, true, 'getReportData', args);
  if (response.error) {
    res.send(response.error);
  } else {
    console.log('response: ');
    console.log(response);
    // const parsedResponse = await JSON.parse(response);
    res.send(response);
  }
};