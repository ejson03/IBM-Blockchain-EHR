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
exports.ccpOrg2 = exports.ccpOrg1 = exports.orgMSPID_doc = exports.orgMSPID_pat = exports.doctorAdmin = exports.patientAdmin = exports.gatewayDiscovery = exports.org2ConnectionFile = exports.org1ConnectionFile = exports.connection_file = exports.config = void 0;
const util = __importStar(require("../utils"));
//connect to the config file
exports.config = util.processFileFromDir("./config.json");
exports.connection_file = exports.config.connectionFile;
exports.org1ConnectionFile = exports.config.connectionOrg1;
exports.org2ConnectionFile = exports.config.connectionOrg2;
exports.gatewayDiscovery = exports.config.gatewayDiscovery;
exports.patientAdmin = exports.config.patientAdmin;
exports.doctorAdmin = exports.config.doctorAdmin;
exports.orgMSPID_pat = exports.config.orgMSPID_pat;
exports.orgMSPID_doc = exports.config.orgMSPID_doc;
// connect to the connection file
exports.ccpOrg1 = util.processFileFromDir(exports.org1ConnectionFile);
exports.ccpOrg2 = util.processFileFromDir(exports.org2ConnectionFile);
//# sourceMappingURL=index.js.map