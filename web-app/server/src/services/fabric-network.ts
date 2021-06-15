//Import Hyperledger Fabric 1.4 programming model - fabric-network

import { Gateway, Wallet, Wallets, GatewayOptions } from "fabric-network";
import * as path from "path";
import * as config from "../config";
import FabricCAServices, { IKeyValueAttribute } from "fabric-ca-client";

export async function connectToWallet(orgName: string) {
  const walletPath = path.join(process.cwd(), "wallet", orgName);
  return await Wallets.newFileSystemWallet(walletPath);
}

export async function connectToGateway(
  wallet: Wallet,
  identity: string,
  orgName: string
) {
  const gateway = new Gateway();
  const connectionOptions: GatewayOptions = {
    wallet: wallet,
    identity: identity,
    discovery: config.gatewayDiscovery,
  };
  if (orgName == "Org1") {
    await gateway.connect(config.ccpOrg1, connectionOptions);
  } else {
    await gateway.connect(config.ccpOrg2, connectionOptions);
  }
  return gateway;
}

export function getTypeByOrg(orgName: string) {
  return orgName == "Org1" ? "patient" : "doctor";
}

export function getAdminByOrg(orgName: string) {
  return orgName == "Org1" ? config.patientAdmin : config.doctorAdmin;
}

export function getCAAdminByOrg(orgName: string) {
  return orgName == "Org1" ? "Org1 CA Admin" : "Org2 CA Admin";
}

export function getAffiliation(orgName: string) {
  return orgName == "Org1" ? "org1.department1" : "org2.departemnt1";
}

export function getCaInfo(orgName: string) {
  return orgName == "Org1"
    ? {
        url: config.ccpOrg1.certificateAuthorities[
          "org1ca-api.127-0-0-1.nip.io:8080"
        ].url,
        name: "Org1 CA Admin",
      }
    : {
        url: config.ccpOrg2.certificateAuthorities[
          "org2ca-api.127-0-0-1.nip.io:8080"
        ].url,
        name: "Org2 CA Admin",
      };
}

export async function userExists(userName: string, wallet: Wallet) {
  const user = await wallet.get(userName);
  if (userName.toLowerCase().includes("admin")) {
    if (!user) {
      console.log(
        `An identity for the admin user ${userName} does not exist in the wallet`
      );
      return false;
    }
    return true;
  } else {
    if (user) {
      console.log(
        `An identity for the user ${userName} already exists in the wallet`
      );
      return true;
    }
    return false;
  }
}

export function getCA(orgName: string) {
  const ca = getCaInfo(orgName);
  return new FabricCAServices(ca.url);
}

export async function connectToNetwork(userName: string, orgName: string) {
  try {
    const wallet = await connectToWallet(orgName);
    const ifUser = await userExists(userName, wallet);
    if (!ifUser) {
      return {
        error:
          "An identity for the user " +
          userName +
          " does not exist in the wallet. Register " +
          userName +
          " first",
      };
    }
    const gateway = await connectToGateway(wallet, userName, orgName);
    // Connect to our local fabric
    const network = await gateway.getNetwork("channel1");
    console.log("Connected to mychannel. ");
    // Get the contract we have installed on the peer
    const contract = network.getContract("ehr");
    const networkObj = {
      contract: contract,
      network: network,
      gateway: gateway,
    };
    return networkObj;
  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);
    return { error: error };
  } finally {
    console.log("Done connecting to network.");
    // gateway.disconnect();
  }
}

//Client application part for calling/invoking any smart contract function(query etc)
export async function invoke(
  networkObj: any,
  isQuery: any,
  func: any,
  args: any
) {
  try {
    console.log(`isQuery: ${isQuery}, func: ${func}, args: ${args}`);
    if (isQuery === true) {
      console.log("Query");
      if (args) {
        try {
          args = JSON.parse(args[0]);
          args = JSON.stringify(args);
        } catch {
          args = args;
        }
        const response = await networkObj.contract.evaluateTransaction(
          func,
          args
        );
        console.log(`Transaction ${func} with args ${args} has been evaluated`);
        await networkObj.gateway.disconnect();
        return response;
      } else {
        const response = await networkObj.contract.evaluateTransaction(func);
        console.log(response);
        console.log(`Transaction ${func} without args has been evaluated`);
        await networkObj.gateway.disconnect();
        return response;
      }
    } else {
      console.log("notQuery");
      if (args) {
        try {
          args = JSON.parse(args[0]);
          args = JSON.stringify(args);
        } catch {
          args = args;
        }
        console.log("before submit ");
        const response = await networkObj.contract.submitTransaction(
          func,
          args
        );
        console.log("after submit");
        console.log(response);
        console.log(`Transaction ${func} with args ${args} has been submitted`);
        await networkObj.gateway.disconnect();
        return response;
      } else {
        const response = await networkObj.contract.submitTransaction(func);
        console.log(response);
        console.log(`Transaction ${func} with args has been submitted`);
        await networkObj.gateway.disconnect();
        return response;
      }
    }
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    return { error: error };
  }
}

export async function createUser(
  userName: string,
  orgName: string,
  attrs: IKeyValueAttribute[],
  wallet: Wallet
) {
  const ca = getCA(orgName);
  const adminName = getCAAdminByOrg(orgName);
  const adminId = await wallet.get(adminName);
  if (!adminId) throw new Error("Failed to get admin");
  const provider = wallet.getProviderRegistry().getProvider(adminId.type);
  const adminUser = await provider.getUserContext(adminId, adminName);
  let secret;
  try {
    secret = await ca.register(
      {
        affiliation: getAffiliation(orgName),
        enrollmentID: userName,
        role: "client",
        attrs: attrs,
      },
      adminUser
    );
  } catch (error) {
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

export async function register(
  username: string,
  attrs: IKeyValueAttribute[],
  orgName: string
) {
  try {
    // Create a new file system based wallet for managing identities.
    const wallet = await connectToWallet(orgName);
    // Check to see if we've already enrolled the user.
    const ifUser = await userExists(username, wallet);
    if (ifUser) {
      return {
        error: `Error! An identity for the ${getTypeByOrg(
          orgName
        )} ${username} already exists in the wallet.`,
      };
    }
    // Check to see if we've already enrolled the admin user.
    const ifAdmin = await userExists(getAdminByOrg(orgName), wallet);
    if (!ifAdmin) {
      return {
        error: `An identity for the admin user ${config.patientAdmin} does not exist in the wallet. `,
      };
    }
    const result = await createUser(username, orgName, attrs, wallet);
    try {
      throw new Error(result.message);
    } catch {
      const response = `Successfully registered ${getTypeByOrg(
        orgName
      )} ${username}`;
      return response;
    }
  } catch (error) {
    console.error(
      `Failed to register ${getTypeByOrg(orgName)} ${username} : ${error}`
    );
    return { error: error };
  }
}

export async function enrollAdmin(orgName: string) {
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
  } catch (error) {
    console.log(error);
  }
}
