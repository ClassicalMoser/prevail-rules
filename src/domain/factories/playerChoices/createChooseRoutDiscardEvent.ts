import type { PlayerSide } from '@entities';
import type { ChooseRoutDiscardEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseRoutDiscard event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - cardIds, eventNumber, player
 * @returns The event
 */
export function createChooseRoutDiscardEvent(fields: {
  cardIds: string[];
  eventNumber: number;
  player: PlayerSide;
}): ChooseRoutDiscardEvent {
  return {
    cardIds: fields.cardIds,
    choiceType: 'chooseRoutDiscard',
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
  };
}
