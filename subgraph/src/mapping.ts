/* eslint-disable prefer-const */
import { FootiumLitePlayersContract, Transfer, PlayerSigned } from '../generated/FootiumLitePlayers/FootiumLitePlayersContract';
import { Player, Owner } from '../generated/schema';

export function getOrCreateOwner(
  id: string
): Owner {
  let owner = Owner.load(id);
  if (!owner) {
    owner = new Owner(id);
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
  player.goalKeeper = false;

  return player;
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
  player.goalKeeper = event.params.goalKeeper;
  player.firstName = event.params.firstName;
  player.lastName = event.params.lastName;

  let contract = FootiumLitePlayersContract.bind(event.address);
  player.image = contract.getPlayerSvg(event.params.tokenId);

  player.save();
}
