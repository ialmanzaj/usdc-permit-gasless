import { Signature, ethers } from "ethers";

import { GelatoRelay, SponsoredCallRequest } from "@gelatonetwork/relay-sdk";

import * as dotenv from "dotenv";

import senderInfo from "../deployments/sepolia/Sender.json";
import tokenInfo from "../deployments/sepolia/TestUSDC.json";
import { Sender, TestUSDC } from "../typechain";
import { doSign } from "../utils/sign";

dotenv.config({ path: ".env" });
const INFURA = process.env.INFURA;
let RPC_URL = `https://sepolia.infura.io/v3/${INFURA}`;

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
  ) as TestUSDC;

  //await token.mint(signer.address, 1000);

  const sender = new ethers.Contract(
    senderInfo.address,
    senderInfo.abi,
    signer
  ) as Sender;

  const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
  const amount = 10000;

  const sig = (await doSign(
    signer,
    token,
    amount,
    signer.address, //owner
    senderInfo.address, //spender
    deadline,
    chainId
  )) as Signature;
  const { v, r, s } = sig;

  const receiver = "0x3bC25D139069Ca06f7079fE67dcEd166b40edA9e";

  const { data } = await sender.populateTransaction.send(
    signer.address,
    receiver,
    amount,
    deadline,
    v,
    r,
    s
  );

  // Populate a relay request
  const request: SponsoredCallRequest = {
    chainId,
    target: senderInfo.address,
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
