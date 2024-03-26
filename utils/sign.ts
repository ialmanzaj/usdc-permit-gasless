import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, Signature, Wallet, providers, utils } from "ethers";

export const doSign = async (
  signer: providers.JsonRpcSigner | SignerWithAddress | Wallet,
  token: Contract,
  value: any,
  owner: string,
  spender: string,
  deadline: number,
  chainId: number
): Promise<Signature | null> => {
  const domain = {
    name: await token.name(),
    version: "2",
    chainId: chainId,
    verifyingContract: token.address,
  };

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const data = {
    owner: owner,
    spender: spender,
    value: value,
    nonce: await token.nonces(owner),
    deadline: deadline,
  };
  const sig = await signer._signTypedData(domain, types, data);

  return utils.splitSignature(sig);
};
