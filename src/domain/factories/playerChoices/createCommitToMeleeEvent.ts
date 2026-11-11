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
 * @param fields - `committedCard` card from hand to commit, or `null` to refuse
 * / decline the commitment without spending a card; `modifierTypes` the
 * modifier types the card applies (empty when refusing); `player` the player
 * who is committing (or refusing)
 * @returns The event
 */
export function createCommitToMeleeEvent(fields: {
  player: PlayerSide;
  committedCard: CommandCard | null;
  modifierTypes: MeleeModifier[];
}): CommitToMeleeEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'commitToMelee',
    player: fields.player,
    committedCard: fields.committedCard,
    modifierTypes: fields.modifierTypes,
  };
}
