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
 * @param fields - The card, the event's index in the round, and the chooser
 * @returns The event
 */
export function createChooseCardEvent(fields: {
  card: CommandCard;
  eventNumber: number;
  player: PlayerSide;
}): ChooseCardEvent {
  return {
    card: fields.card,
    choiceType: 'chooseCard',
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: fields.player,
  };
}
