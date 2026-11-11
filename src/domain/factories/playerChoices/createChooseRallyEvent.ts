import type { PlayerSide } from '@entities';
import type { ChooseRallyEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseRally event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `performRally` whether the player is performing a rally;
 * `player` the player who is choosing whether to perform a rally
 * @returns The event
 */
export function createChooseRallyEvent(fields: {
  player: PlayerSide;
  performRally: boolean;
}): ChooseRallyEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'chooseRally',
    player: fields.player,
    performRally: fields.performRally,
  };
}
