// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestUSDC is ERC20, ERC20Permit, Ownable {
    constructor(address initialOwner)
        ERC20("testUSDC", "USDC")
        ERC20Permit("testUSDC")
        Ownable(initialOwner)
    {
            _mint(msg.sender, 1e12); // $1,000,000
    }

    function mint(address account, uint256 amount) public{
         _mint(account,amount);
    }

    // USDC has 6 decimals
    function decimals() public pure virtual override returns (uint8) {
        return 6;
    }

}