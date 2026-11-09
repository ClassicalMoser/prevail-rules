import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { ChooseMovingUnitEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseMovingUnit event: the player names the next unit to move under a
 * Move order (§4.3.10).
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - `eventNumber` the ordered index of the event in the round,
 * zero-indexed; `player` the player carrying out the order; `unit` the unit
 * that moves next, and where it stands
 * @returns The event
 */
export function createChooseMovingUnitEvent(fields: {
  player: PlayerSide;
  eventNumber: number;
  unit: UnitWithPlacement;
}): ChooseMovingUnitEvent {
  const event: ChooseMovingUnitEvent = {
    choiceType: 'chooseMovingUnit',
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
    unit: fields.unit,
  };
  return event;
}
