// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Svgs is Ownable {
    event StoreSvg(uint256 indexed svgId, string svg);

    uint256 id;
    mapping(uint256 => string) private svgs;

    function storeSvg(string calldata _svg) external onlyOwner {
        svgs[id] = _svg;
        emit StoreSvg(id, _svg);
        id++;
    }

    function getSvg(uint256 _id) public view returns (string memory) {
        return svgs[_id];
    }
}
