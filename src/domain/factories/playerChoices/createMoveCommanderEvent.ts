import type { Coordinate, PlayerSide } from '@entities';
import type { MoveCommanderEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A moveCommander event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - `eventNumber` the ordered index of the event in the round,
 * zero-indexed; `from` the coordinate the commander is moving from; `player`
 * the player who is moving the commander; `to` the coordinate the commander
 * is moving to
 * @returns The event
 */
export function createMoveCommanderEvent(fields: {
  player: PlayerSide;
  eventNumber: number;
  from: Coordinate;
  to: Coordinate;
}): MoveCommanderEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'moveCommander',
    player: fields.player,
    eventNumber: fields.eventNumber,
    from: fields.from,
    to: fields.to,
  };
}
