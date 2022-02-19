// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

import {FootiumLitePlayers} from "../FootiumLitePlayers/FootiumLitePlayers.sol";

contract FootiumLiteFriendlies is VRFConsumerBase {
    bytes32 private constant keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
    uint256 private constant fee = 0.1 * 10**18;
    uint256 constant TEAM_SIZE = 5;

    enum MatchStatus {
        STATUS_REGISTERED,
        STATUS_VRF_PENDING,
        STATUS_READY
    }

    enum SimStatus {
        WIN_A,
        WIN_B,
        DRAW
    }

    struct Match {
        uint256 seed;
        uint256 timestamp;
        address accountA;
        address accountB;
        MatchStatus status;
    }

    FootiumLitePlayers players;
    Match[] matches;
    mapping(bytes32 => uint256) private requestToMatch;
    mapping(address => uint256[TEAM_SIZE]) private formations;

    event MatchRegistered(
        uint256 index,
        uint256 timestamp,
        address accountA,
        address accountB,
        uint256[TEAM_SIZE] formationA,
        uint256[TEAM_SIZE] formationB
    );
    event MatchRequested(uint256 index, bytes32 requestId);
    event MatchSeed(uint256 index, uint256 seed);
    event TacticsSet(address owner, uint256[TEAM_SIZE] formation);

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

    /* External */

    function setTactics(uint256[TEAM_SIZE] calldata formation) external {
        formations[msg.sender] = formation;

        emit TacticsSet(msg.sender, formation);
    }

    function registerMatch(address accountB, uint256 timestamp) external {
        uint256 index = matches.length;

        Match memory game = Match(0, timestamp, msg.sender, accountB, MatchStatus.STATUS_REGISTERED);
        matches.push(game);

        emit MatchRegistered(
            index,
            timestamp,
            game.accountA,
            game.accountB,
            formations[msg.sender],
            formations[accountB]
        );
    }

    function requestSeed(uint256 index) external {
        Match memory game = matches[index];

        require(block.timestamp >= game.timestamp);

        bytes32 requestId = requestRandomness(keyHash, fee);
        requestToMatch[requestId] = index;
        game.status = MatchStatus.STATUS_VRF_PENDING;

        emit MatchRequested(index, requestId);
    }

    /* Internal */

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        Match storage game = matches[requestToMatch[requestId]];

        game.seed = randomness;
        game.status = MatchStatus.STATUS_READY;

        emit MatchSeed(requestToMatch[requestId], randomness);
    }

    /* View */

    function formationInvalid(uint256[] calldata formation) public pure returns (bool) {
        bool[TEAM_SIZE] memory seen;
        for (uint256 i = 0; i < TEAM_SIZE; i++) {
            if (seen[formation[i]]) {
                return true;
            }
            seen[i] = true;
        }

        return false;
    }

    function simulateMatch(
        uint256 seed,
        uint256[] calldata formationA,
        uint256[] calldata formationB
    ) public view returns (SimStatus) {
        // Check that formations have been set
        bool invalidA = formationInvalid(formationA);
        bool invalidB = formationInvalid(formationB);
        if (invalidA && invalidB) {
            return SimStatus.DRAW;
        } else if (invalidA) {
            return SimStatus.WIN_B;
        } else if (invalidB) {
            return SimStatus.WIN_A;
        }

        // Run simulation
        uint256 attackA;
        uint256 attackB;
        for (uint256 i = 0; i < TEAM_SIZE; i++) {
            uint256[3] memory playerA = players.getTraits(formationA[i]);
            uint256[3] memory playerB = players.getTraits(formationB[i]);
            for (uint256 j; j < playerA.length; j++) {
                attackA += playerA[j];
                attackB += playerB[j];
            }
        }

        if (seed % (attackA + attackB) < attackA) {
            return SimStatus.WIN_A;
        }
        return SimStatus.WIN_B;
    }
}
