import { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (hre.network.name !== "hardhat") {
    console.log(
      `Deploying sender to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const usdc = await deploy("TestUSDC", {
    from: deployer,
    log: hre.network.name !== "hardhat",
    args: [deployer],
  });

  console.log("TestUSDC deployed at: ", usdc.address);

  const trustedForwarder = "0xd8253782c45a12053594b9deB72d8e8aB2Fca54c";

  const sender = await deploy("Sender", {
    from: deployer,
    log: hre.network.name !== "hardhat",
    args: [trustedForwarder, usdc.address],
  });

  console.log("sender deployed at: ", sender.address);

  // Verify the deployed contracts
  try {
    await hre.run("verify:verify", {
      address: usdc.address,
      constructorArguments: [deployer],
    });
    console.log("TestUSDC contract verified");
  } catch (error) {
    console.error("Error verifying PLN contract:", error);
  }

  try {
    await hre.run("verify:verify", {
      address: sender.address,
      constructorArguments: [trustedForwarder, usdc.address],
    });
    console.log("Sender contract verified");
  } catch (error) {
    console.error("Error verifying Sender contract:", error);
  }
};
export default func;

func.tags = ["PLN"];
