
// File: @gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol
// OpenZeppelin Contracts (last updated v4.7.0) (metatx/ERC2771Context.sol)

pragma solidity ^0.8.1;

abstract contract ERC2771Context {
    address private immutable _trustedForwarder;

    constructor(address trustedForwarder) {
        _trustedForwarder = trustedForwarder;
    }

    function isTrustedForwarder(address forwarder)
        public
        view
        virtual
        returns (bool)
    {
        return forwarder == _trustedForwarder;
    }

    function _msgSender() internal view virtual returns (address sender) {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            /// @solidity memory-safe-assembly
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return msg.sender;
        }
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return msg.data;
        }
    }
}


pragma solidity >=0.4.22 <0.9.0;

import {
    ERC20Permit
} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract Sender is ERC2771Context {
    ERC20Permit public token;

    // ERC2771Context: setting the immutable trustedForwarder variable
    constructor(
        address trustedForwarder,
        ERC20Permit _token
    ) ERC2771Context(trustedForwarder) {
        token = _token;
    }

    function send(
        address sender,
        address receiver,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
        external
    {
        //Allow someone to spend tokens on behalf of the sender
        token.permit(sender, address(this), amount, deadline, v, r, s);
        // Transfer an amount of tokens from one person to another.
        token.transferFrom(sender, receiver, amount);
    }
}
