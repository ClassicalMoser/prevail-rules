import type { CommandCard, PlayerSide } from '@entities';
import type { CommitToMeleeEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A commit-to-melee event, or a refusal.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required.
 *
 * A `committedCard` of `null` is a refusal — declining the commitment without
 * spending a card — and `modifierTypes` is empty in that case.
 *
 * @param fields - The committed card or null, the modifiers it applies, the
 * event's index in the round, and the committing player
 * @returns The event
 */
export function createCommitToMeleeEvent(fields: {
  committedCard: CommandCard | null;
  eventNumber: number;
  modifierTypes: CommitToMeleeEvent['modifierTypes'];
  player: PlayerSide;
}): CommitToMeleeEvent {
  return {
    choiceType: 'commitToMelee',
    committedCard: fields.committedCard,
    eventNumber: fields.eventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    modifierTypes: fields.modifierTypes,
    player: fields.player,
  };
}
