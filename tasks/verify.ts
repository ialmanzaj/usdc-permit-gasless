import { task } from "hardhat/config";

export const verify = task("etherscan-verify", "verify").setAction(
  async ({}, hre) => {
    await hre.run("verify:verify", {
      address: "0x22Ef1eF988568648EedFeEd18F11B54DB5E9Abd6",
      constructorArguments: [],
    });
  }
);
