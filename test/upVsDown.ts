import { ethers, deployments, network } from "hardhat";

import { Contract, Signature } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import hre from "hardhat";
import { PLN, UpVsDownGameV6 } from "../typechain";
import { expect } from "chai";
import { doSign } from "../utils/sign";

describe("UpVsDown", function () {
  let pln: PLN;
  let plnAddress: string;

  let upsVsDown: UpVsDownGameV6;
  let upsVsDownAddress: string;

  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  // Set up all contracts
  before(async () => {
    [user1, user2, user3] = await hre.ethers.getSigners();

    /// Deploying ETH
    await deployments.fixture();

    plnAddress = (await deployments.get("PLN")).address;
    pln = (await ethers.getContractAt("PLN", plnAddress)) as PLN;

    upsVsDownAddress = (await deployments.get("UpVsDownGameV6")).address;
    upsVsDown = (await ethers.getContractAt(
      "UpVsDownGameV6",
      upsVsDownAddress
    )) as UpVsDownGameV6;
  });

  it("PLN should accept permit", async () => {
    expect(await pln.balanceOf(user1.address)).eq(0);
    await pln.mint(user1.address, 1000);
    expect(await pln.balanceOf(user1.address)).eq(1000);

    //await expect(pln.transferFrom(user1.address,user2.address,50)).to.be.revertedWithCustomError

    const deadline = Math.floor(Date.now() / 1000) + 60 * 5;

    const chainId = await user1.getChainId();

    const sig = (await doSign(
      user1,
      pln,
      50,
      user1.address,
      user2.address,
      deadline,
      chainId
    )) as Signature;
    await expect(
      pln.connect(user2).transferFrom(user1.address, user2.address, 50)
    ).rejectedWith(
      'ERC20InsufficientAllowance("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 0, 50)'
    );

    const { v, r, s } = sig;
    // const { data } = await nft!.mint.populateTransaction(signer.address, amount, deadline, v, r, s);

    await pln.permit(user1.address, user2.address, 50, deadline, v, r, s);

    const bal = await pln.allowance(user1.address, user2.address);

    await pln.connect(user2).transferFrom(user1.address, user2.address, 50);

    expect(await pln.balanceOf(user1.address)).eq(950);
    expect(await pln.balanceOf(user2.address)).eq(50);
  });

  it("UpVsDown working", async () => {
    await pln.mint(user1.address, 1000);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 5;

    const chainId = await user1.getChainId();

    let sig = (await doSign(
      user1,
      pln,
      50,
      user1.address,
      upsVsDownAddress,
      deadline,
      chainId
    )) as Signature;
   let { v, r, s } = sig;

  
    await upsVsDown.connect(user3).makeTradeFake(
      user1.address,
      50,
      deadline,
      v,
      r,
      s
    );

    expect(await pln.balanceOf(upsVsDownAddress)).eq(50);

    const deadline2 = Math.floor(Date.now() / 1000) + 60 * 5;
    sig = (await doSign(
      user1,
      pln,
      50,
      user1.address,
      upsVsDownAddress,
      deadline2,
      chainId
    )) as Signature;
  
    await upsVsDown.connect(user3).makeTradeFake(
      user1.address,
      50,
      deadline2,
      sig.v,
      sig.r,
      sig.s
    );

    expect(await pln.balanceOf(upsVsDownAddress)).eq(100);


    const deadline3 = Math.floor(Date.now() / 1000) + 60 * 5;
    sig = (await doSign(
      user1,
      pln,
      50,
      user1.address,
      upsVsDownAddress,
      deadline3,
      chainId
    )) as Signature;
  
    await upsVsDown.connect(user3).makeTradeFake(
      user1.address,
      50,
      deadline,
      sig.v,
      sig.r,
      sig.s
    );

    expect(await pln.balanceOf(upsVsDownAddress)).eq(150);


  });
});
