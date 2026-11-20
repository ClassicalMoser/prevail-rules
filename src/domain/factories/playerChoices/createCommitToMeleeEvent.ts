import type { CommandCard, PlayerSide } from '@entities';
import type { CommitToMeleeEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A commit-to-melee event, or a refusal.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required.
 *
 * A `committedCard` of `'none'` is a refusal — declining the commitment without
 * spending a card.
 *
 * @param fields - `committedCard` card from hand to commit, or `'none'` to refuse
 * / decline the commitment without spending a card; `player` the player who
 * is committing (or refusing)
 * @returns The event
 */
export function createCommitToMeleeEvent(fields: {
  player: PlayerSide;
  committedCard: CommandCard | 'none';
}): CommitToMeleeEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'commitToMelee',
    player: fields.player,
    committedCard: fields.committedCard,
  };
}
