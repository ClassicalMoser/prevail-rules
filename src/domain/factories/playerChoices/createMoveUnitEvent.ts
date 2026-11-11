import type { MoveDelta, PlayerSide } from '@entities';
import type { MoveUnitEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A moveUnit event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `moveCommander` whether to move the commander with the unit;
 * `player` the player who is moving the unit; `path` the move's steps and
 * turns, in order — the unit itself was named by `chooseMovingUnit`
 * @returns The event
 */
export function createMoveUnitEvent(fields: {
  player: PlayerSide;
  moveCommander: boolean;
  path: MoveDelta[];
}): MoveUnitEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'moveUnit',
    player: fields.player,
    moveCommander: fields.moveCommander,
    path: fields.path,
  };
}
