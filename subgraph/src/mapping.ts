/* eslint-disable prefer-const */
import { Transfer, PlayerSigned } from '../generated/FootiumLitePlayers/FootiumLitePlayersContract';
import { MatchRegistered, MatchSeed } from '../generated/FootiumLiteFriendlies/FootiumLiteFriendliesContract';
import { Player, Match } from '../generated/schema';

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
  entity.strength = event.params.traits[0].toI32();
  entity.perception = event.params.traits[1].toI32();
  entity.endurance = event.params.traits[2].toI32();
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
  entity.seed = event.params.seed.toI32();
  entity.status = 1;
  entity.save();
}