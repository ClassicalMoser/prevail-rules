import type { PlayerSide, UnitInstance } from '@entities';
import type { ChooseMovingUnitEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseMovingUnit event: the player names the next unit to move under a Move
 * order (§4.3.10).
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `player` the player carrying out the order; `unit` the unit
 * that moves next, by who it is
 * @returns The event
 */
export function createChooseMovingUnitEvent(fields: {
  player: PlayerSide;
  unit: UnitInstance;
}): ChooseMovingUnitEvent {
  const event: ChooseMovingUnitEvent = {
    choiceType: 'chooseMovingUnit',
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
    unit: fields.unit,
  };
  return event;
}
