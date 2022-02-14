// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "hardhat-deploy/solc_0.8/proxy/Proxied.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract FootiumLitePlayers is Proxied, ERC721 {
    uint256 constant TRAITS_NUMBER = 3;
    uint256 constant MAX_STAT = 256;

    event PlayerSigned(uint256 tokenId, uint256[TRAITS_NUMBER] traits);

    constructor() ERC721("FootiumLitePlayers", "FLP") {}

    mapping(uint256 => uint256[TRAITS_NUMBER]) traits;

    function mint(uint256 tokenId) external {
        for (uint256 i; i < TRAITS_NUMBER; i++) {
            traits[tokenId][i] = uint256(keccak256(abi.encode(tokenId, i))) % MAX_STAT;
        }

        _mint(msg.sender, tokenId);

        emit PlayerSigned(tokenId, traits[tokenId]);
    }
}
