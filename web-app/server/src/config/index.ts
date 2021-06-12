import * as util from "../utils";

//connect to the config file
export const config = util.processFileFromDir("./config.json");
export const connection_file = config.connectionFile;
export const org1ConnectionFile = config.connectionOrg1;
export const org2ConnectionFile = config.connectionOrg2;
export const gatewayDiscovery = config.gatewayDiscovery;
export const patientAdmin = config.patientAdmin;
export const doctorAdmin = config.doctorAdmin;
export const orgMSPID_pat = config.orgMSPID_pat;
export const orgMSPID_doc = config.orgMSPID_doc;

// connect to the connection file
export const ccp = util.processFileFromDir(connection_file);
export const ccpOrg1 = util.processFileFromDir(org1ConnectionFile);
export const ccpOrg2 = util.processFileFromDir(org2ConnectionFile);
