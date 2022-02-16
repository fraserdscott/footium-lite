/* eslint-disable prefer-const */
import { Transfer, PlayerSigned } from '../generated/FootiumLitePlayers/FootiumLitePlayersContract';
import { FootiumLiteFriendliesContract, MatchRegistered, MatchSeed } from '../generated/FootiumLiteFriendlies/FootiumLiteFriendliesContract';
import { Player, Match } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts'

export function handleTransfer(event: Transfer): void {
  let id = event.params.tokenId.toHex();
  let entity = Player.load(id);
  if (!entity) {
    entity = new Player(id);
  }
  entity.owner = event.params.to;
  entity.save();
}

export function handleSigned(event: PlayerSigned): void {
  let id = event.params.tokenId.toHex();
  let entity = Player.load(id);
  if (!entity) {
    entity = new Player(id);
  }
  entity.traits = [event.params.traits[0].toI32(), event.params.traits[1].toI32(), event.params.traits[2].toI32()];

  entity.save();
}

export function handleMatchRegistered(event: MatchRegistered): void {
  let id = event.params.index.toHex();
  let entity = Match.load(id);
  if (!entity) {
    entity = new Match(id);
  }
  entity.accountA = event.params.accountA;
  entity.accountB = event.params.accountB;
  entity.formationA = event.params.formationA.map<i32>(f => f.toI32());
  entity.formationB = event.params.formationB.map<i32>(f => f.toI32());
  entity.status = 0;
  entity.requestId = event.params.requestId;
  entity.save();
}

export function handleMatchSeed(event: MatchSeed): void {
  let id = event.params.index.toHex();
  let entity = Match.load(id);
  if (!entity) {
    entity = new Match(id);
  }
  entity.randomNumber = event.params.seed.toI32();
  entity.status = 1;

  let contract = FootiumLiteFriendliesContract.bind(event.address)
  entity.winStatus = contract.simulateMatch(event.params.seed, entity.formationA.map<BigInt>(a => BigInt.fromI32(a)), entity.formationB.map<BigInt>(a => BigInt.fromI32(a)));

  entity.save();
}