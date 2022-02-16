// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

import {FootiumLitePlayers} from "../FootiumLitePlayers/FootiumLitePlayers.sol";

contract FootiumLiteFriendlies is VRFConsumerBase {
    bytes32 private constant keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
    uint256 private constant fee = 0.1 * 10**18;
    uint256 constant TEAM_SIZE = 5;

    enum MatchStatus {
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
        address accountA;
        address accountB;
        MatchStatus status;
        uint256[TEAM_SIZE] formationA;
        uint256[TEAM_SIZE] formationB;
    }

    FootiumLitePlayers players;
    Match[] matches;
    mapping(bytes32 => uint256) private requestToMatch;

    event MatchRegistered(
        uint256 index,
        address accountA,
        address accountB,
        bytes32 requestId,
        uint256[TEAM_SIZE] formationA,
        uint256[TEAM_SIZE] formationB
    );
    event MatchSeed(uint256 index, uint256 seed);
    event TacticsSet(uint256 index, bool setA, uint256[TEAM_SIZE] formation);

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
            [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)],
            [uint256(0), uint256(0), uint256(0), uint256(0), uint256(0)]
        );
        matches.push(game);

        bytes32 requestId = requestRandomness(keyHash, fee);
        requestToMatch[requestId] = index;

        emit MatchRegistered(index, game.accountA, game.accountB, requestId, game.formationA, game.formationB);
    }

    function setTactics(
        uint256 index,
        bool setA,
        uint256[TEAM_SIZE] calldata formation
    ) external {
        Match storage game = matches[index];

        if (setA) {
            game.formationA = formation;
        } else {
            game.formationB = formation;
        }

        emit TacticsSet(index, setA, formation);
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
