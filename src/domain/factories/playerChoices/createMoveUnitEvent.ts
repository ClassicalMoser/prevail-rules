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
 * @param fields - eventNumber, moveCommander, player, to, unit
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
