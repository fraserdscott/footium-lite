// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {Svgs} from "../Svgs/Svgs.sol";

contract FootiumLitePlayers is ERC721, Ownable {
    uint256 constant KEEPER_PROBABILITY_DENOMINATOR = 6;
    uint256 constant NUMBERIC_TRAITS_NUM = 7;
    uint256 constant IMAGE_TRAITS_NUM = 10;
    uint256 constant MAX_STAT = 11;

    uint256[IMAGE_TRAITS_NUM] maxImageTraits = [3, 10, 8, 9, 9, 10, 3, 10, 13, 3];

    string[10] eyeColourFg = [
        "#014e6b",
        "#6b1d01",
        "#4b2a05",
        "#289d43",
        "#506800",
        "#3c3e55",
        "#190269",
        "#636c0e",
        "#31957a",
        "#342d63"
    ];

    string[10] eyeColourBg = [
        "#66c0d8",
        "#e7866d",
        "#a16e40",
        "#57db6a",
        "#bfd263",
        "#915794",
        "#6e5bc8",
        "#d6c021",
        "#79ffdb",
        "#5d66c0"
    ];

    string[13] hairColourFg = [
        "#ba8843",
        "#592f44",
        "#4173b9",
        "#598c43",
        "#c13c4c",
        "#5b362a",
        "#444277",
        "#685e59",
        "#a56227",
        "#121b2c",
        "#2d2141",
        "#578373",
        "#1f3f4e"
    ];

    string[13] hairColourBg = [
        "#ebcb9f",
        "#795e6b",
        "#9ebeeb",
        "#6ea068",
        "#d2736d",
        "#7c5c51",
        "#82819e",
        "#a0958f",
        "#fb9d4a",
        "#5f7b78",
        "#6a5679",
        "#adeed7",
        "#2b6985"
    ];

    string[3] skinColour = ["#fde9cb", "#fdcbad", "#8e5c42"];

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

        for (uint256 i; i < IMAGE_TRAITS_NUM; i++) {
            playersStats[tokenId].imageTraits[i] = uint256(keccak256(abi.encode(tokenId, i))) % maxImageTraits[i];
        }
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

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function getPlayerSvg(uint256 tokenId) public view returns (string memory) {
        string memory svg = '';
        string memory svgId = string(abi.encodePacked('player-svg-', uint2str(tokenId)));

        {
            svg = string(abi.encodePacked(
                '<svg id="', svgId, '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 210 297"><style>'
            ));
        }

        {
            svg = string(abi.encodePacked(
                svg,
                '#', svgId, ' .hair1 {fill:',
                hairColourBg[playersStats[tokenId].imageTraits[8]],
                '} #', svgId, ' .hair2 {fill:',
                hairColourFg[playersStats[tokenId].imageTraits[8]]
            ));
        }

        {
            svg = string(abi.encodePacked(
                svg,
                '} #', svgId, ' .eye-primary {fill:',
                eyeColourFg[playersStats[tokenId].imageTraits[7]],
                '} #', svgId, ' .eye-secondary {fill:'
            ));
        }

        {
            svg = string(abi.encodePacked(
                svg,
                eyeColourBg[playersStats[tokenId].imageTraits[7]],
                '} #', svgId, ' .skin {fill:',
                skinColour[playersStats[tokenId].imageTraits[9]],
                '}</style>'
            ));
        }

        {
            svg = string(
                abi.encodePacked(
                    svg,
                    svgs.getSvg("pose", playersStats[tokenId].imageTraits[0]),
                    svgs.getSvg("facial", playersStats[tokenId].imageTraits[4]),
                    svgs.getSvg("hair", playersStats[tokenId].imageTraits[1]),
                    svgs.getSvg("brow", playersStats[tokenId].imageTraits[2]),
                    svgs.getSvg("eye", playersStats[tokenId].imageTraits[3])
                )
            );
        }

        return
            string(
                abi.encodePacked(
                    svg,
                    svgs.getSvg("mouth", playersStats[tokenId].imageTraits[5]),
                    svgs.getSvg("nose", playersStats[tokenId].imageTraits[6]),
                    svgs.getSvg("shirt", 0),
                    svgs.getSvg("shorts", 0),
                    svgs.getSvg("socks", 0),
                    svgs.getSvg("shoes", 0),
                    "</svg>"
                )
            );
    }
}
