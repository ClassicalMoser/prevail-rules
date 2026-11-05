import type { CommandCard, PlayerSide } from '@entities';
import type { CommitToMeleeEvent, MeleeModifier } from '@events';
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
 * @param fields - `committedCard` card from hand to commit, or `null` to
 * refuse / decline the commitment without spending a card; `eventNumber` the
 * ordered index of the event in the round, zero-indexed; `modifierTypes` the
 * modifier types the card applies (empty when refusing); `player` the player
 * who is committing (or refusing)
 * event's index in the round, and the committing player
 * @returns The event
 */
export function createCommitToMeleeEvent(fields: {
  committedCard: CommandCard | null;
  eventNumber: number;
  modifierTypes: MeleeModifier[];
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
