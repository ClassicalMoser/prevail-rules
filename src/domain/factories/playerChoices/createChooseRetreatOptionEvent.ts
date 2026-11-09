import type { PlayerSide, MoveDelta } from '@entities';
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
 * `path` the retreat chosen, named by its path
 * @returns The event
 */
export function createChooseRetreatOptionEvent(fields: {
  player: PlayerSide;
  eventNumber: number;
  path: MoveDelta[];
}): ChooseRetreatOptionEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'chooseRetreatOption',
    player: fields.player,
    eventNumber: fields.eventNumber,
    path: fields.path,
  };
}
