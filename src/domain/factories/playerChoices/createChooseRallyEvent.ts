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
 * @param fields - eventNumber, performRally, player
 * @returns The event
 */
export function createChooseRallyEvent(fields: {
  eventNumber: number;
  performRally: boolean;
  player: PlayerSide;
}): ChooseRallyEvent {
  return {
    choiceType: 'chooseRally',
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    performRally: fields.performRally,
    player: fields.player,
  };
}
