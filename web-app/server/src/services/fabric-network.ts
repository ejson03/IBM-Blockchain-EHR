//Import Hyperledger Fabric 1.4 programming model - fabric-network

import { Gateway, Wallet, Wallets, GatewayOptions } from "fabric-network";
import * as path from "path";
import * as config from "../config";
import FabricCAServices, { IKeyValueAttribute } from "fabric-ca-client";

export async function connectToWallet(orgName: string) {
  const walletPath = path.join(process.cwd(), "wallet", orgName);
  return await Wallets.newFileSystemWallet(walletPath);
}

export async function connectToGateway(wallet: Wallet, identity: string) {
  const gateway = new Gateway();
  const connectionOptions: GatewayOptions = {
    wallet: wallet,
    identity: identity,
    discovery: config.gatewayDiscovery,
  };
  await gateway.connect(config.ccp, connectionOptions);
  return gateway;
}

export function getTypeByOrg(orgName: string) {
  return orgName == "Org1" ? "patient" : "doctor";
}

export function getAdminByOrg(orgName: string) {
  return orgName == "Org1" ? config.patientAdmin : config.doctorAdmin;
}

export function getAffiliation(orgName: string) {
  return orgName == "Org1" ? "org1.department1" : "org2.department1";
}

export function getCaURL(orgName: string) {
  return orgName == "Org1"
    ? config.ccp.certificateAuthorities["org1ca-api.127-0-0-1.nip.io:8081"].url
    : config.ccp.certificateAuthorities["org2ca-api.127-0-0-1.nip.io:8081"].url;
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
  const caURL = getCaURL(orgName);
  return new FabricCAServices(caURL);
}

export async function connectToNetwork(userName: string, orgName: string) {
  try {
    const wallet = await connectToWallet(orgName);
    console.log(await wallet.list());
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
    const gateway = await connectToGateway(wallet, userName);
    // Connect to our local fabric
    const network = await gateway.getNetwork("mychannel");
    console.log("Connected to mychannel. ");
    // Get the contract we have installed on the peer
    const contract = await network.getContract("contract");
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
    console.log("inside invoke");
    console.log(`isQuery: ${isQuery}, func: ${func}, args: ${args}`);
    if (isQuery === true) {
      if (args) {
        // args = JSON.parse(args[0]);c
        // args = JSON.stringify(args);
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
        console.log("notQuery, args");
        console.log("$$$$$$$$$$$$$ args: ");
        console.log(args);
        console.log(func);
        console.log(typeof args);

        args = JSON.parse(args[0]);

        args = JSON.stringify(args);

        console.log("before submit");
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
    return error;
  }
}

export async function createUser(
  userName: string,
  orgName: string,
  attrs: IKeyValueAttribute[],
  wallet: Wallet
) {
  const ca = getCA(orgName);
  const adminName = getAdminByOrg(orgName);
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
    console.log(error.message);
    return error.message;
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
  await wallet.put(userName, x509Identity);
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
    await createUser(username, orgName, attrs, wallet);
    console.log(`Successfully registered Patient ${username}.`);
    const response = `Successfully registered ${getTypeByOrg(
      orgName
    )} ${username}`;
    return response;
  } catch (error) {
    console.error(
      `Failed to register ${getTypeByOrg(orgName)} ${username} : ${error}`
    );
    return { error: error };
  }
}
