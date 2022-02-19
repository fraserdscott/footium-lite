/* eslint-disable prefer-const */
import { FootiumLitePlayersContract, Transfer, PlayerSigned } from '../generated/FootiumLitePlayers/FootiumLitePlayersContract';
import { FootiumLiteFriendliesContract, MatchRegistered, MatchRequested, MatchSeed, TacticsSet } from '../generated/FootiumLiteFriendlies/FootiumLiteFriendliesContract';
import { Player, Match, Owner } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts'

export function getOrCreateOwner(
  id: string
): Owner {
  let owner = Owner.load(id);
  if (!owner) {
    owner = new Owner(id);
    owner.formation = [0, 0, 0, 0, 0];
  }

  return owner;
}

export function getOrCreatePlayer(
  id: string
): Player {
  let player = Player.load(id);
  if (!player) {
    player = new Player(id);
  }

  return player;
}

export function getOrCreateMatch(
  id: string
): Match {
  let match = Match.load(id);
  if (!match) {
    match = new Match(id);
  }

  return match;
}


export function handleTransfer(event: Transfer): void {
  const player = getOrCreatePlayer(event.params.tokenId.toString());
  let owner = getOrCreateOwner(event.params.to.toHexString());

  player.owner = owner.id;
  player.save();
  owner.save();
}

export function handleSigned(event: PlayerSigned): void {
  const player = getOrCreatePlayer(event.params.tokenId.toString());

  player.traits = event.params.traits.map<i32>(t => t.toI32());

  let contract = FootiumLitePlayersContract.bind(event.address);
  player.image = contract.getPlayerSvg(event.params.tokenId);

  player.save();
}

export function handleMatchRegistered(event: MatchRegistered): void {
  let match = getOrCreateMatch(event.params.index.toString());

  let ownerA = getOrCreateOwner(event.params.accountA.toHexString());
  let ownerB = getOrCreateOwner(event.params.accountB.toHexString());

  match.accountA = ownerA.id;
  match.accountB = ownerB.id;
  match.timestamp = event.params.timestamp.toI32();
  match.status = 0;
  match.save();
  ownerA.save();
  ownerB.save();
}

export function handleMatchRequested(event: MatchRequested): void {
  let match = getOrCreateMatch(event.params.index.toString());

  match.status = 1;
  match.requestId = event.params.requestId;
  match.save();
}

export function handleMatchSeed(event: MatchSeed): void {
  let match = getOrCreateMatch(event.params.index.toString());

  let ownerA = getOrCreateOwner(match.accountA);
  let ownerB = getOrCreateOwner(match.accountB);

  match.randomNumber = event.params.seed.toI32();
  match.status = 2;

  let contract = FootiumLiteFriendliesContract.bind(event.address)
  match.winStatus = contract.simulateMatch(event.params.seed, ownerA.formation.map<BigInt>(f => BigInt.fromI32(f)), ownerB.formation.map<BigInt>(f => BigInt.fromI32(f)));

  match.save();
}

export function handleTacticsSet(event: TacticsSet): void {
  let owner = getOrCreateOwner(event.params.owner.toHex());

  owner.formation = event.params.formation.map<i32>(f => f.toI32());
  owner.save();
}