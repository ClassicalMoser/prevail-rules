import type { CommandCard, PlayerSide } from '@entities';
import type { ChooseRoutDiscardEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A chooseRoutDiscard event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `cards` the cards being discarded (from hand), shown face up;
 * `player` the player who is discarding cards
 * @returns The event
 */
export function createChooseRoutDiscardEvent(fields: {
  player: PlayerSide;
  cards: CommandCard[];
}): ChooseRoutDiscardEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'chooseRoutDiscard',
    player: fields.player,
    cards: fields.cards,
  };
}
