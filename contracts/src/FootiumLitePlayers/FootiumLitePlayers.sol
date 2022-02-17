// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {Svgs} from "../Svgs/Svgs.sol";

contract FootiumLitePlayers is ERC721 {
    uint256 constant TRAITS_NUMBER = 3;
    uint256 constant MAX_STAT = 101;

    Svgs svgs;

    event PlayerSigned(uint256 tokenId, uint256[TRAITS_NUMBER] traits);

    constructor(Svgs _svgs) ERC721("FootiumLitePlayers", "FLP") {
        svgs = _svgs;
    }

    mapping(uint256 => uint256[TRAITS_NUMBER]) traits;

    function mint(uint256 tokenId) external {
        for (uint256 i; i < TRAITS_NUMBER; i++) {
            traits[tokenId][i] = uint256(keccak256(abi.encode(tokenId, i))) % MAX_STAT;
        }

        _mint(msg.sender, tokenId);

        emit PlayerSigned(tokenId, traits[tokenId]);
    }

    function getTraits(uint256 tokenId) public view returns (uint256[TRAITS_NUMBER] memory) {
        return traits[tokenId];
    }

    function getImage(uint256 tokenId) public view returns (string memory) {
        return svgs.getSvg(0);
    }
}
