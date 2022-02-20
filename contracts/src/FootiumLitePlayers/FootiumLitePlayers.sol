// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {Svgs} from "../Svgs/Svgs.sol";

contract FootiumLitePlayers is ERC721, Ownable {
    uint256 constant KEEPER_PROBABILITY_DENOMINATOR = 6;
    uint256 constant NUMBERIC_TRAITS_NUM = 7;
    uint256 constant IMAGE_TRAITS_NUM = 7;
    uint256 constant MAX_STAT = 11;
    uint256 constant POSE_NUM = 5;
    uint256 constant HAIR_NUM = 10;

    struct Player {
        bool keeper;
        string firstName;
        string lastName;
        uint256[NUMBERIC_TRAITS_NUM] numericTraits;
        uint256[IMAGE_TRAITS_NUM] imageTraits;
    }

    Svgs svgs;
    string[] firstNames;
    string[] lastNames;
    mapping(uint256 => Player) playersStats;

    event PlayerSigned(uint256 tokenId, bool goalKeeper, uint256[NUMBERIC_TRAITS_NUM] traits);

    constructor(
        Svgs _svgs,
        string[] memory _firstNames,
        string[] memory _lastNames
    ) ERC721("FootiumLitePlayers", "FLP") {
        svgs = _svgs;
        firstNames = _firstNames;
        lastNames = _lastNames;
    }

    /* External */

    function mint(uint256 tokenId) external {
        playersStats[tokenId].firstName = firstNames[
            uint256(keccak256(abi.encode(tokenId, "first"))) % firstNames.length
        ];
        playersStats[tokenId].lastName = lastNames[uint256(keccak256(abi.encode(tokenId, "last"))) % lastNames.length];

        bool keeper = (tokenId % KEEPER_PROBABILITY_DENOMINATOR) == 0;
        playersStats[tokenId].keeper = keeper;

        for (uint256 i; i < NUMBERIC_TRAITS_NUM; i++) {
            playersStats[tokenId].numericTraits[i] = uint256(keccak256(abi.encode(tokenId, i))) % MAX_STAT;
        }

        playersStats[tokenId].imageTraits[0] = uint256(keccak256(abi.encode(tokenId, 0))) % POSE_NUM;
        playersStats[tokenId].imageTraits[1] = uint256(keccak256(abi.encode(tokenId, 1))) % HAIR_NUM;

        _mint(msg.sender, tokenId);

        emit PlayerSigned(tokenId, keeper, playersStats[tokenId].numericTraits);
    }

    function updateNumericTraits(uint256 tokenId, uint256[NUMBERIC_TRAITS_NUM] calldata newTraits) external onlyOwner {
        playersStats[tokenId].numericTraits = newTraits;
    }

    /* View */

    function getTraits(uint256 tokenId) public view returns (uint256[NUMBERIC_TRAITS_NUM] memory) {
        return playersStats[tokenId].numericTraits;
    }

    function getPlayerSvg(uint256 tokenId) public view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 210 297">',
                    svgs.getSvg("pose", playersStats[tokenId].imageTraits[0]),
                    svgs.getSvg("hair", playersStats[tokenId].imageTraits[1]),
                    svgs.getSvg("shirt", 0),
                    "</svg>"
                )
            );
    }
}
