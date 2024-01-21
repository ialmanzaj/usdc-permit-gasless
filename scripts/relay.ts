import { Signature, ethers } from "ethers";

import { GelatoRelay, SponsoredCallRequest } from "@gelatonetwork/relay-sdk";

import * as dotenv from "dotenv";

import upsDownInfo from "../deployments/gelopcelestiatestnet/UpVsDownGameV6.json";
import tokenInfo from "../deployments/gelopcelestiatestnet/PLN.json";
import { PLN, UpVsDownGameV6 } from "../typechain";
import { doSign } from "../utils/sign";

dotenv.config({ path: ".env" });

let RPC_URL = "https://rpc.op-celestia-testnet.gelato.digital";

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const signer = new ethers.Wallet(process.env.PK!, provider);

const GELATO_RELAY_API_KEY = process.env.GELATO_RELAY_API_KEY;

const relay = new GelatoRelay();

const testSponsoredCall = async () => {
  const chainId = (await provider.getNetwork()).chainId;


  const token = new ethers.Contract(
    tokenInfo.address,
    tokenInfo.abi,
    signer
  ) as PLN;

  await token.mint(signer.address,1000);

  const upsDpwn = new ethers.Contract(
    upsDownInfo.address,
    upsDownInfo.abi,
    signer
  ) as UpVsDownGameV6;



  const deadline = Math.floor(Date.now() / 1000) + 60 * 5;


  const sig = (await doSign(
    signer,
    token,
    50,
   signer.address,
    upsDownInfo.address,
    deadline,
    chainId
  )) as Signature;
    const { v, r, s } = sig;

   const {data} = await upsDpwn.populateTransaction.makeTradeFake(signer.address, 50, deadline, v, r, s);

  // Populate a relay request
  const request: SponsoredCallRequest = {
    chainId,
    target: upsDownInfo.address,
    data: data as string,
  };

  // Without a specific API key, the relay request will fail!
  // Go to https://relay.gelato.network to get a testnet API key with 1Balance.
  // Send a relay request using Gelato Relay!
  const response = await relay.sponsoredCall(
    request,
    GELATO_RELAY_API_KEY as string
  );

  console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
};

testSponsoredCall();
