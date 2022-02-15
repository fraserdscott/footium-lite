// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

import {FootiumLitePlayers} from "../FootiumLitePlayers/FootiumLitePlayers.sol";

contract FootiumLiteFriendlies is VRFConsumerBase {
    bytes32 private constant keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
    uint256 private constant fee = 0.1 * 10**18;
    uint256 constant TRAITS_NUMBER = 3;
    uint256 constant TEAM_SIZE = 5;

    enum MatchStatus {
        STATUS_VRF_PENDING,
        STATUS_READY
    }

    struct Match {
        uint256 seed;
        address accountA;
        address accountB;
        MatchStatus status;
        uint256[TEAM_SIZE] formationA;
        uint256[TEAM_SIZE] formationB;
    }

    FootiumLitePlayers players;
    Match[] matches;
    mapping(bytes32 => uint256) private requestToMatch;

    event MatchRegistered(uint256 index, address accountA, address accountB, MatchStatus status, bytes32 requestId);
    event MatchSeed(uint256 index, uint256 seed);

    constructor(
        address vrfCoordinator,
        address link,
        FootiumLitePlayers _players
    ) VRFConsumerBase(vrfCoordinator, link) {
        players = _players;
    }

    /* Modifiers */

    modifier formationValid(address owner, uint256[TEAM_SIZE] calldata formation) {
        bool[TEAM_SIZE] memory seenPlayer;
        for (uint256 i = 0; i < TEAM_SIZE; i++) {
            require(owner == players.ownerOf(formation[i]));
            require(!seenPlayer[formation[i]]);

            seenPlayer[formation[i]] = true;
        }
        _;
    }

    /* Internal */

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        Match storage game = matches[requestToMatch[requestId]];

        game.seed = randomness;
        game.status = MatchStatus.STATUS_READY;

        emit MatchSeed(requestToMatch[requestId], randomness);
    }

    /* External */

    function registerMatch(address accountB) external {
        uint256 index = matches.length;

        Match memory game = Match(
            0,
            msg.sender,
            accountB,
            MatchStatus.STATUS_VRF_PENDING,
            [type(uint256).max, type(uint256).max, type(uint256).max, type(uint256).max, type(uint256).max],
            [type(uint256).max, type(uint256).max, type(uint256).max, type(uint256).max, type(uint256).max]
        );
        matches.push(game);

        bytes32 requestId = requestRandomness(keyHash, fee);
        requestToMatch[requestId] = index;

        emit MatchRegistered(index, game.accountA, game.accountB, game.status, requestId);
    }

    /* Pure */

    function simulateMatch(
        uint256[TEAM_SIZE] calldata formationA,
        uint256[TEAM_SIZE] calldata formationB,
        uint256 seed
    ) public pure returns (bool) {
        // A always wins
        return true;
    }
}
