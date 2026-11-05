import type { CommandCard, PlayerSide } from '@entities';
import type { ChooseCardEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A choose-card event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * including `eventNumber`: a default would hide an ordering the caller means.
 *
 * @param fields - `card` the card to choose from the player's hand;
 * `eventNumber` the ordered index of the event in the round, zero-indexed;
 * `player` the player who is choosing the card
 * @returns The event
 */
export function createChooseCardEvent(fields: {
  player: PlayerSide;
  eventNumber: number;
  card: CommandCard;
}): ChooseCardEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'chooseCard',
    player: fields.player,
    eventNumber: fields.eventNumber,
    card: fields.card,
  };
}
