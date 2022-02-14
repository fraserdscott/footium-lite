// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.9;

import "./test.sol";
import "../src/FootiumLitePlayers/FootiumLitePlayers.sol";

contract FootiumLitePlayersTest is DSTest {
    FootiumLitePlayers internal registry;

    function setUp() public {
        registry = new FootiumLitePlayers("prefix_");
    }

    function test_message(string calldata message) public {
        registry.setMessage(message);
        string memory savedMessage = registry.messages(address(this));
        assertEq0(abi.encodePacked("prefix_", message), bytes(savedMessage));
    }
}
