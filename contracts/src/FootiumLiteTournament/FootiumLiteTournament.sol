// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

import {FootiumLitePlayers} from "../FootiumLitePlayers/FootiumLitePlayers.sol";

contract FootiumLiteTournament is VRFConsumerBase {
    bytes32 private constant keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
    uint256 private constant fee = 0.1 * 10**18;
    uint256 constant TEAM_SIZE = 5;

    enum MatchResult {
        WIN_A,
        WIN_B,
        DRAW
    }

    FootiumLitePlayers players;
    address[] owners;
    // Request ID => Day
    mapping(bytes32 => uint256) private requestToDay;
    // Day => Seed
    mapping(uint256 => uint256) private seeds;
    // Owner => Formation
    mapping(address => uint256[TEAM_SIZE]) private formations;

    uint256 duration;
    uint256 dayZeroTimestamp;

    event TournamentCreated(uint256 dayZeroTimestamp, uint256 duration);
    event DayRequested(uint256 day, bytes32 requestId);
    event DaySeed(uint256 day, uint256 seed);
    event TacticsSet(address owner, uint256[TEAM_SIZE] formation);

    constructor(
        address vrfCoordinator,
        address link,
        FootiumLitePlayers _players,
        uint256 _duration,
        address[] memory _owners
    ) VRFConsumerBase(vrfCoordinator, link) {
        players = _players;
        owners = _owners;
        duration = _duration;

        dayZeroTimestamp = block.timestamp;

        emit TournamentCreated(dayZeroTimestamp, duration);
    }

    /* External */

    function setTactics(uint256[TEAM_SIZE] calldata formation) external {
        formations[msg.sender] = formation;

        emit TacticsSet(msg.sender, formation);
    }

    function requestSeed(uint256 day) external {
        require(block.timestamp >= dayZeroTimestamp + day * duration);

        bytes32 requestId = requestRandomness(keyHash, fee);
        requestToDay[requestId] = day;

        emit DayRequested(day, requestId);
    }

    /* Internal */

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 day = requestToDay[requestId];
        seeds[day] = randomness;

        emit DaySeed(day, randomness);
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
    ) public view returns (MatchResult) {
        // Check that formations have been set
        bool invalidA = formationInvalid(formationA);
        bool invalidB = formationInvalid(formationB);
        if (invalidA && invalidB) {
            return MatchResult.DRAW;
        } else if (invalidA) {
            return MatchResult.WIN_B;
        } else if (invalidB) {
            return MatchResult.WIN_A;
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
            return MatchResult.WIN_A;
        }
        return MatchResult.WIN_B;
    }
}
