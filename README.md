
# Gelato PoC Playnance

This Poc showcaseS how to use the method sponsordCall() to transfer tokens from user using **permit**;
The specific aspect of this PoC is that we implement the EI712 to recover the signature from the **permit** Method in the target contract so we don't require to sign for ERC2771. 


## Contracts
UpVsDownGameV6
[(https://blockscout.op-celestia-testnet.gelato.digital/address/0xC603180D79a5Afa341A59134d126fC72Bcd19283?tab=contract)](https://blockscout.op-celestia-testnet.gelato.digital/address/0xC603180D79a5Afa341A59134d126fC72Bcd19283?tab=contract)

PLN (Token)[https://blockscout.op-celestia-testnet.gelato.digital/address/0x47dbAdaE62dE1C18628F24C031d987862aAe72c8?tab=contact_code](https://blockscout.op-celestia-testnet.gelato.digital/address/0x47dbAdaE62dE1C18628F24C031d987862aAe72c8?tab=contact_code)


## Test live
```shell
yarn  relay
```

Code can be found [here](./scripts/relay.ts)


## Local test

1) - install

```shell
yarn install
```

2) Please copy `.env.example` to `.env ` and add the GELATO_RELAY_API_KEY, PK

3) test
Test code can be found [here](./test/upVsDown.ts)

```shell
yarn test
```
Result:

```shell
  UpVsDown
PLN deployed at:  0x5FbDB2315678afecb367f032d93F642f64180aa3
upVsDown deployed at:  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
    ✔ PLN should accept permit (171ms)
    ✔ UpVsDown working (120ms)


  2 passing (2s)

```


## Additional contract parts
```typescript

contract UpVsDownGameV6 is Ownable, ERC2771Context, EIP712 {
    ERC20Permit public token;
    bytes32 private constant _PERMIT_TYPEHASH =
        keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );
    bytes32 private constant _TYPE_HASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );

      .....  

   constructor(
        address trustedForwarder,
        address newGameController,
        ERC20Permit _token
    ) Ownable(newGameController) EIP712("DemoToken", "1") ERC2771Context(trustedForwarder) {
         token = _token;
    }
    ....

  /// =================   FakeTrade =============================

     function makeTradeFake(
        address owner,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
       
        address signer = _getSigner(owner,amount,deadline,v,r,s);

        require(signer == owner,'NOOO');

        token.permit(owner, address(this), amount , deadline, v, r, s);
        token.transferFrom(owner, address(this), amount);
    }


    /// ===================  Recover address Helpers ===================

    function _getSigner(
        address owner,
        uint amount,
        uint deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal  view returns (address _signer) {
        bytes32 structHash = keccak256(
            abi.encode(
                _PERMIT_TYPEHASH,
                owner,
                address(this),
                amount,
                token.nonces(owner),
                deadline
            )
        );

        bytes32 hash = _hashTypedDataV4Custom(structHash);

        _signer = ECDSA.recover(hash, v, r, s);

     
    }

    function _buildDomainSeparatorCustom() private view returns (bytes32) {
        string memory name;
        string memory version;
        (, name, version, , , , ) = token.eip712Domain();
        bytes32 _hashedName = keccak256(bytes(name));
        bytes32 _hashedVersion = keccak256(bytes(version));
        return
            keccak256(
                abi.encode(
                    _TYPE_HASH,
                    _hashedName,
                    _hashedVersion,
                    block.chainid,
                    address(token)
                )
            );
    }

    function _hashTypedDataV4Custom(
        bytes32 structHash
    ) internal view virtual returns (bytes32) {
        return
            _toTypedDataHashCustom(_buildDomainSeparatorCustom(), structHash);
    }

    function _toTypedDataHashCustom(
        bytes32 domainSeparator,
        bytes32 structHash
    ) internal pure returns (bytes32 digest) {
        /// @solidity memory-safe-assembly
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, hex"19_01")
            mstore(add(ptr, 0x02), domainSeparator)
            mstore(add(ptr, 0x22), structHash)
            digest := keccak256(ptr, 0x42)
        }
    }
}
```