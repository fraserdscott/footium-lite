/* eslint-disable prefer-const */
import { Transfer, PlayerSigned } from '../generated/FootiumLitePlayers/FootiumLitePlayersContract';
import { FootiumLiteFriendliesContract, MatchRegistered, MatchSeed, TacticsSet } from '../generated/FootiumLiteFriendlies/FootiumLiteFriendliesContract';
import { Player, Match, Owner } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts'

export function getOrCreatePlayer(
  id: string
): Player {
  let player = Player.load(id);
  if (!player) {
    player = new Player(id);
  }

  return player;
}

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


export function handleTransfer(event: Transfer): void {
  const player = getOrCreatePlayer(event.params.tokenId.toHex());
  let owner = getOrCreateOwner(event.params.to.toHexString());

  player.owner = owner.id;
  player.save();
  owner.save();
}

export function handleSigned(event: PlayerSigned): void {
  const player = getOrCreatePlayer(event.params.tokenId.toHex());

  player.traits = [event.params.traits[0].toI32(), event.params.traits[1].toI32(), event.params.traits[2].toI32()];
  player.save();
}

export function handleMatchRegistered(event: MatchRegistered): void {
  let id = event.params.index.toHex();
  let match = Match.load(id);
  if (!match) {
    match = new Match(id);
  }
  let ownerA = getOrCreateOwner(event.params.accountA.toHexString());
  let ownerB = getOrCreateOwner(event.params.accountB.toHexString());

  match.accountA = ownerA.id;
  match.accountB = ownerB.id;
  match.status = 0;
  match.requestId = event.params.requestId;
  match.save();
  ownerA.save();
  ownerB.save();
}

export function handleMatchSeed(event: MatchSeed): void {
  let id = event.params.index.toHex();
  let match = Match.load(id);
  if (!match) {
    match = new Match(id);
  }
  let ownerA = getOrCreateOwner(match.accountA);
  let ownerB = getOrCreateOwner(match.accountB);

  match.randomNumber = event.params.seed.toI32();
  match.status = 1;

  let contract = FootiumLiteFriendliesContract.bind(event.address)
  match.winStatus = contract.simulateMatch(event.params.seed, ownerA.formation.map<BigInt>(f => BigInt.fromI32(f)), ownerB.formation.map<BigInt>(f => BigInt.fromI32(f)));

  match.save();
}

export function handleTacticsSet(event: TacticsSet): void {
  let owner = getOrCreateOwner(event.params.owner.toHex());

  owner.formation = event.params.formation.map<i32>(f => f.toI32());
  owner.save();
}