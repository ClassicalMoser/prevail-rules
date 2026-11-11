import type { Coordinate, PlayerSide } from '@entities';
import type { MoveCommanderEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A moveCommander event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `from` the coordinate the commander is moving from; `player`
 * the player who is moving the commander; `to` the coordinate the commander is
 * moving to
 * @returns The event
 */
export function createMoveCommanderEvent(fields: {
  player: PlayerSide;
  from: Coordinate;
  to: Coordinate;
}): MoveCommanderEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'moveCommander',
    player: fields.player,
    from: fields.from,
    to: fields.to,
  };
}
