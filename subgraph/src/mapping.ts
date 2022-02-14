/* eslint-disable prefer-const */
import { Transfer, PlayerSigned } from '../generated/FootiumLitePlayers/FootiumLitePlayersContract';
import { Player } from '../generated/schema';

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
