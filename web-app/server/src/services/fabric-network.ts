//Import Hyperledger Fabric 1.4 programming model - fabric-network

import { Gateway, Wallet, Wallets, GatewayOptions } from "fabric-network";
import * as path from "path";
import * as config from "../config";
import { IKeyValueAttribute } from "fabric-ca-client";
import Client from "fabric-client";

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

export async function userExists(userName: string, wallet: Wallet) {
  const user = await wallet.get(userName);
  console.log(user);
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
      console.log("inside isQuery");

      if (args) {
        console.log("inside isQuery, args");
        args = JSON.parse(args[0]);
        args = JSON.stringify(args);
        console.log(args);
        const response = await networkObj.contract.evaluateTransaction(
          func,
          args
        );
        console.log(response);
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
  organisation: string,
  attrs: IKeyValueAttribute[],
  wallet: Wallet
) {
  const gateway = await connectToGateway(wallet, userName);
  const client = new Client();
  // first check to see if the admin is already enrolled
  const admin_user = await client.getUserContext(
    getAdminByOrg(organisation),
    true
  );

  if (!(admin_user && admin_user.isEnrolled()))
    throw new Error("Failed to get admin");

  const ca_client = client.getCertificateAuthority();
  // at this point we should have the admin user
  // first need to register the user with the CA server
  const secret = await ca_client.register(
    {
      enrollmentID: userName,
      attrs: attrs,
      role: "client",
      affiliation: organisation,
    },
    admin_user
  );
  // next we need to enroll the user with CA server
  const enrollment = await ca_client.enroll({
    enrollmentID: userName,
    enrollmentSecret: secret,
  });
  // Create the Given User
  const user = await client.createUser({
    username: userName,
    skipPersistence: true,
    mspid: organisation + "MSP",
    cryptoContent: {
      privateKeyPEM: enrollment.key.toBytes(),
      signedCertPEM: enrollment.certificate,
    },
  });
  return await client.setUserContext(user);
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
    const ifAdmin = await userExists(config.patientAdmin, wallet);
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
