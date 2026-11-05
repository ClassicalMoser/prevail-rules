import type { PlayerSide } from '@entities';
import type { ChooseRallyEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseRally event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - `eventNumber` the ordered index of the event in the round,
 * zero-indexed; `performRally` whether the player is performing a rally;
 * `player` the player who is choosing whether to perform a rally
 * @returns The event
 */
export function createChooseRallyEvent(fields: {
  player: PlayerSide;
  eventNumber: number;
  performRally: boolean;
}): ChooseRallyEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'chooseRally',
    player: fields.player,
    eventNumber: fields.eventNumber,
    performRally: fields.performRally,
  };
}
