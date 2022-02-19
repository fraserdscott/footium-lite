/* eslint-disable prefer-const */
import { FootiumLitePlayersContract, Transfer, PlayerSigned } from '../generated/FootiumLitePlayers/FootiumLitePlayersContract';
import { DayRequested, DaySeed, TacticsSet } from '../generated/FootiumLiteTournament/FootiumLiteTournamentContract';
import { Player, Day, Owner } from '../generated/schema';

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

export function getOrCreateDay(
  id: string
): Day {
  let match = Day.load(id);
  if (!match) {
    match = new Day(id);
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

export function handleDayRequested(event: DayRequested): void {
  let match = getOrCreateDay(event.params.day.toString());

  match.requestId = event.params.requestId;
  match.status = 1;
  match.save();
}

export function handleDaySeed(event: DaySeed): void {
  let match = getOrCreateDay(event.params.day.toString());

  match.randomNumber = event.params.seed.toI32();
  match.status = 2;

  match.save();
}

export function handleTacticsSet(event: TacticsSet): void {
  let owner = getOrCreateOwner(event.params.owner.toHex());

  owner.formation = event.params.formation.map<i32>(f => f.toI32());
  owner.save();
}