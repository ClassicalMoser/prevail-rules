import type { PlayerSide, UnitPlacement } from '@entities';
import type { ChooseRetreatOptionEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseRetreatOption event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - `eventNumber` the ordered index of the event in the round,
 * zero-indexed; `player` the player who is choosing the retreat option;
 * `retreatOption` the retreat option to choose from
 * @returns The event
 */
export function createChooseRetreatOptionEvent(fields: {
  eventNumber: number;
  player: PlayerSide;
  retreatOption: UnitPlacement;
}): ChooseRetreatOptionEvent {
  return {
    choiceType: 'chooseRetreatOption',
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
    retreatOption: fields.retreatOption,
  };
}
