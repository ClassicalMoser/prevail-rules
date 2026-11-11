import type { CommandCard, PlayerSide } from '@entities';
import type { CommitToMovementEvent } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A commitToMovement event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required: a
 * default would hide a choice the caller means.
 *
 * @param fields - `committedCard` card from hand to commit, or `null` to refuse
 * / decline the commitment without spending a card; `player` the player who
 * is committing (or refusing)
 * @returns The event
 */
export function createCommitToMovementEvent(fields: {
  player: PlayerSide;
  committedCard: CommandCard | null;
}): CommitToMovementEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'commitToMovement',
    player: fields.player,
    committedCard: fields.committedCard,
  };
}
