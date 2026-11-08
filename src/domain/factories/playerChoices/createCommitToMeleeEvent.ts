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
 * TODO(misleading): the line below is a leftover fragment from an earlier
 * version of this tag and describes nothing in `fields`. Settled by deleting it.
 * event's index in the round, and the committing player
 * @returns The event
 */
export function createCommitToMeleeEvent(fields: {
  player: PlayerSide;
  eventNumber: number;
  committedCard: CommandCard | null;
  modifierTypes: MeleeModifier[];
}): CommitToMeleeEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'commitToMelee',
    player: fields.player,
    eventNumber: fields.eventNumber,
    committedCard: fields.committedCard,
    modifierTypes: fields.modifierTypes,
  };
}
