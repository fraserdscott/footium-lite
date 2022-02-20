// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Svgs is Ownable {
    mapping(bytes32 => uint256) private ids;
    mapping(bytes32 => mapping(uint256 => string)) private svgs;

    function storeSvg(string calldata _svg, bytes32 _svgType) external onlyOwner {
        svgs[_svgType][ids[_svgType]] = _svg;
        ids[_svgType]++;
    }

    function getSvg(bytes32 _svgType, uint256 _id) public view returns (string memory) {
        return svgs[_svgType][_id];
    }
}
