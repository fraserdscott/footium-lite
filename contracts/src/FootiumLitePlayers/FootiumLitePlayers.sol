// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {Svgs} from "../Svgs/Svgs.sol";

contract FootiumLitePlayers is ERC721 {
    uint256 constant TRAITS_NUM = 3;
    uint256 constant MAX_STAT = 101;

    Svgs svgs;
    mapping(uint256 => uint256[TRAITS_NUM]) traits;
    mapping(uint256 => uint256[2]) imageTraits;

    event PlayerSigned(uint256 tokenId, uint256[TRAITS_NUM] traits);

    constructor(Svgs _svgs) ERC721("FootiumLitePlayers", "FLP") {
        svgs = _svgs;
    }

    function mint(uint256 tokenId) external {
        for (uint256 i; i < TRAITS_NUM; i++) {
            traits[tokenId][i] = uint256(keccak256(abi.encode(tokenId, i))) % MAX_STAT;
        }

        imageTraits[tokenId][0] = uint256(keccak256(abi.encode(tokenId))) % 5;
        imageTraits[tokenId][1] = uint256(keccak256(abi.encode(tokenId))) % 10;

        _mint(msg.sender, tokenId);

        emit PlayerSigned(tokenId, traits[tokenId]);
    }

    function getTraits(uint256 tokenId) public view returns (uint256[TRAITS_NUM] memory) {
        return traits[tokenId];
    }

    function getPlayerSvg(uint256 tokenId) public view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 210 297">',
                    svgs.getSvg("pose", imageTraits[tokenId][0]),
                    svgs.getSvg("hair", imageTraits[tokenId][1]),
                    svgs.getSvg("shirt", 0),
                    "</svg>"
                )
            );
    }
}
