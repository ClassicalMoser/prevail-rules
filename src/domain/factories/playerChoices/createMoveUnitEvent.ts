import type { PlayerSide, UnitPlacement, UnitWithPlacement } from '@entities';
import type { MoveUnitEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A moveUnit event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - `eventNumber` the ordered index of the event in the round,
 * zero-indexed; `moveCommander` whether to move the commander with the unit;
 * `player` the player who is moving the unit; `to` the space the unit is
 * moving to; `unit` the unit to move
 * @returns The event
 */
export function createMoveUnitEvent(fields: {
  eventNumber: number;
  moveCommander: boolean;
  player: PlayerSide;
  to: UnitPlacement;
  unit: UnitWithPlacement;
}): MoveUnitEvent {
  return {
    choiceType: 'moveUnit',
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    moveCommander: fields.moveCommander,
    player: fields.player,
    to: fields.to,
    unit: fields.unit,
  };
}
