"use strict";
//Import Hyperledger Fabric 1.4 programming model - fabric-network
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollAdmin = exports.register = exports.createUser = exports.invoke = exports.connectToNetwork = exports.getCA = exports.userExists = exports.getCaInfo = exports.getAffiliation = exports.getAdminByOrg = exports.getTypeByOrg = exports.connectToGateway = exports.connectToWallet = void 0;
const fabric_network_1 = require("fabric-network");
const path = __importStar(require("path"));
const config = __importStar(require("../config"));
const fabric_ca_client_1 = __importDefault(require("fabric-ca-client"));
async function connectToWallet(orgName) {
    const walletPath = path.join(process.cwd(), "wallet", orgName);
    return await fabric_network_1.Wallets.newFileSystemWallet(walletPath);
}
exports.connectToWallet = connectToWallet;
async function connectToGateway(wallet, identity, orgName) {
    const gateway = new fabric_network_1.Gateway();
    const connectionOptions = {
        wallet: wallet,
        identity: identity,
        discovery: config.gatewayDiscovery,
    };
    if (orgName == "Org1") {
        await gateway.connect(config.ccpOrg1, connectionOptions);
    }
    else {
        await gateway.connect(config.ccpOrg2, connectionOptions);
    }
    return gateway;
}
exports.connectToGateway = connectToGateway;
function getTypeByOrg(orgName) {
    return orgName == "Org1" ? "patient" : "doctor";
}
exports.getTypeByOrg = getTypeByOrg;
function getAdminByOrg(orgName) {
    return orgName == "Org1" ? config.patientAdmin : config.doctorAdmin;
}
exports.getAdminByOrg = getAdminByOrg;
function getAffiliation(orgName) {
    return orgName == "Org1" ? "org1.department1" : "org2.departemnt1";
}
exports.getAffiliation = getAffiliation;
function getCaInfo(orgName) {
    return orgName == "Org1"
        ? {
            url: config.ccpOrg1.certificateAuthorities["org1ca-api.127-0-0-1.nip.io:8081"].url,
        }
        : {
            url: config.ccpOrg2.certificateAuthorities["org2ca-api.127-0-0-1.nip.io:8081"].url,
        };
}
exports.getCaInfo = getCaInfo;
async function userExists(userName, wallet) {
    const user = await wallet.get(userName);
    if (userName.toLowerCase().includes("admin")) {
        if (!user) {
            console.log(`An identity for the admin user ${userName} does not exist in the wallet`);
            return false;
        }
        return true;
    }
    else {
        if (user) {
            console.log(`An identity for the user ${userName} already exists in the wallet`);
            return true;
        }
        return false;
    }
}
exports.userExists = userExists;
function getCA(orgName) {
    const ca = getCaInfo(orgName);
    return new fabric_ca_client_1.default(ca.url);
}
exports.getCA = getCA;
async function connectToNetwork(userName, orgName) {
    try {
        const wallet = await connectToWallet(orgName);
        console.log(await wallet.list());
        const ifUser = await userExists(userName, wallet);
        if (!ifUser) {
            return {
                error: "An identity for the user " +
                    userName +
                    " does not exist in the wallet. Register " +
                    userName +
                    " first",
            };
        }
        const gateway = await connectToGateway(wallet, userName, orgName);
        // Connect to our local fabric
        const network = await gateway.getNetwork("mychannel");
        console.log("Connected to mychannel. ");
        // Get the contract we have installed on the peer
        const contract = network.getContract("ehr");
        const networkObj = {
            contract: contract,
            network: network,
            gateway: gateway,
        };
        return networkObj;
    }
    catch (error) {
        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);
        return { error: error };
    }
    finally {
        console.log("Done connecting to network.");
        // gateway.disconnect();
    }
}
exports.connectToNetwork = connectToNetwork;
//Client application part for calling/invoking any smart contract function(query etc)
async function invoke(networkObj, isQuery, func, args) {
    try {
        console.log(`isQuery: ${isQuery}, func: ${func}, args: ${args}`);
        if (isQuery === true) {
            console.log("Query");
            if (args) {
                try {
                    args = JSON.parse(args[0]);
                    args = JSON.stringify(args);
                }
                catch (_a) {
                    args = args;
                }
                const response = await networkObj.contract.evaluateTransaction(func, args);
                console.log(`Transaction ${func} with args ${args} has been evaluated`);
                await networkObj.gateway.disconnect();
                return response;
            }
            else {
                const response = await networkObj.contract.evaluateTransaction(func);
                console.log(response);
                console.log(`Transaction ${func} without args has been evaluated`);
                await networkObj.gateway.disconnect();
                return response;
            }
        }
        else {
            console.log("notQuery");
            if (args) {
                try {
                    args = JSON.parse(args[0]);
                    args = JSON.stringify(args);
                }
                catch (_b) {
                    args = args;
                }
                console.log("before submit ");
                const response = await networkObj.contract.submitTransaction(func, args);
                console.log("after submit");
                console.log(response);
                console.log(`Transaction ${func} with args ${args} has been submitted`);
                await networkObj.gateway.disconnect();
                return response;
            }
            else {
                const response = await networkObj.contract.submitTransaction(func);
                console.log(response);
                console.log(`Transaction ${func} with args has been submitted`);
                await networkObj.gateway.disconnect();
                return response;
            }
        }
    }
    catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        return { error: error };
    }
}
exports.invoke = invoke;
async function createUser(userName, orgName, attrs, wallet) {
    const ca = getCA(orgName);
    // const adminName = getAdminByOrg(orgName);
    const adminId = await wallet.get("admin");
    if (!adminId)
        throw new Error("Failed to get admin");
    const provider = wallet.getProviderRegistry().getProvider(adminId.type);
    const adminUser = await provider.getUserContext(adminId, "admin");
    let secret;
    try {
        secret = await ca.register({
            affiliation: getAffiliation(orgName),
            enrollmentID: userName,
            role: "client",
            attrs: attrs,
        }, adminUser);
    }
    catch (error) {
        return error;
    }
    const enrollment = await ca.enroll({
        enrollmentID: userName,
        enrollmentSecret: secret,
    });
    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: `${orgName}MSP`,
        type: "X.509",
    };
    return await wallet.put(userName, x509Identity);
}
exports.createUser = createUser;
async function register(username, attrs, orgName) {
    try {
        // Create a new file system based wallet for managing identities.
        const wallet = await connectToWallet(orgName);
        // Check to see if we've already enrolled the user.
        const ifUser = await userExists(username, wallet);
        if (ifUser) {
            return {
                error: `Error! An identity for the ${getTypeByOrg(orgName)} ${username} already exists in the wallet.`,
            };
        }
        // Check to see if we've already enrolled the admin user.
        const ifAdmin = await userExists("admin", wallet);
        if (!ifAdmin) {
            return {
                error: `An identity for the admin user ${config.patientAdmin} does not exist in the wallet. `,
            };
        }
        const result = await createUser(username, orgName, attrs, wallet);
        try {
            throw new Error(result.message);
        }
        catch (_a) {
            console.log(`Successfully registered Patient ${username}.`);
            const response = `Successfully registered ${getTypeByOrg(orgName)} ${username}`;
            return response;
        }
    }
    catch (error) {
        console.error(`Failed to register ${getTypeByOrg(orgName)} ${username} : ${error}`);
        return { error: error };
    }
}
exports.register = register;
async function enrollAdmin(orgName) {
    try {
        const wallet = await connectToWallet(orgName);
        const ifAdmin = await userExists("admin", wallet);
        if (ifAdmin) {
            throw new Error(`Admin already exist for ${orgName} `);
        }
        const ca = getCA(orgName);
        const enrollment = await ca.enroll({
            enrollmentID: "admin",
            enrollmentSecret: "adminpw",
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${orgName}MSP`,
            type: "X.509",
        };
        console.log(`Succesfulyy register admin for ${orgName}`);
        return await wallet.put("admin", x509Identity);
    }
    catch (error) {
        console.log(error);
    }
}
exports.enrollAdmin = enrollAdmin;
//# sourceMappingURL=fabric-network.js.map