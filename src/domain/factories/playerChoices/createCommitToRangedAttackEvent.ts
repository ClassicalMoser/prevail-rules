import type { CommandCard, PlayerSide } from '@entities';
import type { CommitToRangedAttackEvent, RangedAttackModifier } from '@events';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

/**
 * A commitToRangedAttack event.
 *
 * `eventType` and `choiceType` are fixed by the event's own type and cannot
 * vary, so they are filled in here. Everything that can vary is required,
 * `eventNumber` included: a default would hide an ordering the caller means.
 *
 * @param fields - `committedCard` card from hand to commit, or `null` to
 * refuse / decline the commitment without spending a card; `eventNumber` the
 * ordered index of the event in the round, zero-indexed; `modifierTypes` the
 * modifier types the card applies (empty when refusing); `player` the player
 * who is committing (or refusing)
 * @returns The event
 */
export function createCommitToRangedAttackEvent(fields: {
  player: PlayerSide;
  eventNumber: number;
  committedCard: CommandCard | null;
  modifierTypes: RangedAttackModifier[];
}): CommitToRangedAttackEvent {
  return {
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    choiceType: 'commitToRangedAttack',
    player: fields.player,
    eventNumber: fields.eventNumber,
    committedCard: fields.committedCard,
    modifierTypes: fields.modifierTypes,
  };
}
