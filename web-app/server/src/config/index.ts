import * as util from "../utils";

//connect to the config file
export const config = util.processFileFromDir("./config.json");
export const connection_file = config.connectionFile;
export const gatewayDiscovery = config.gatewayDiscovery;
export const patientAdmin = config.patientAdmin;
export const doctorAdmin = config.doctorAdmin;
export const orgMSPID_pat = config.orgMSPID_pat;
export const orgMSPID_doc = config.orgMSPID_doc;

// connect to the connection file
export const ccp = util.processFileFromDir(connection_file);
