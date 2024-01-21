import { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";



const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (hre.network.name !== "hardhat") {
    console.log(
      `Deploying SimpleCounter to ${hre.network.name}. Hit ctrl + c to abort`
    );
  }


  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

const pln =  await deploy("PLN", {
    from: deployer,
    log: hre.network.name !== "hardhat",
    args:[deployer]
  }) ;


console.log("PLN deployed at: ", pln.address)



const trustedForwarder = "0xd8253782c45a12053594b9deB72d8e8aB2Fca54c"
const upVsDown =  await deploy("UpVsDownGameV6", {
  from: deployer,
  log: hre.network.name !== "hardhat",
  args:[trustedForwarder,"0x7b5159e9bfd7c81b8fb5f7b4feb1ed4c245dd588",pln.address]
}) ;

console.log("upVsDown deployed at: ", upVsDown.address)


};
export default func;

func.tags = ["PLN"];
