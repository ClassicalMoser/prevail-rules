import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { ChooseFiringUnitEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseFiringUnit event: the player names the next unit to fire under a
 * Shoot order (§4.3.11 step 1).
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - `eventNumber` the ordered index of the event in the round,
 * zero-indexed; `player` the player carrying out the order; `unit` the unit
 * that fires next, and where it stands
 * @returns The event
 */
export function createChooseFiringUnitEvent(fields: {
  player: PlayerSide;
  eventNumber: number;
  unit: UnitWithPlacement;
}): ChooseFiringUnitEvent {
  const event: ChooseFiringUnitEvent = {
    choiceType: 'chooseFiringUnit',
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
    unit: fields.unit,
  };
  return event;
}
