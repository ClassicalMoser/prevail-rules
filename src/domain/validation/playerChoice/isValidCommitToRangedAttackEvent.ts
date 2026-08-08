import type { ValidationResult } from '@utils';
import type { CommitToRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToRangedAttackEvents } from '@legality';

function sameModifierTypes(
  a: readonly string[],
  b: readonly string[],
): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((mod, index) => mod === b[index]);
}

/**
 * Validates a CommitToRangedAttackEvent by membership against
 * {@link getLegalCommitToRangedAttackEvents} (player, card id, ordered modifierTypes).
 */
export function isValidCommitToRangedAttackEvent(
  event: CommitToRangedAttackEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalOptions = getLegalCommitToRangedAttackEvents(state);
    const isLegal = legalOptions.some(
      (option) =>
        option.player === event.player &&
        option.committedCard.id === event.committedCard.id &&
        sameModifierTypes(option.modifierTypes, event.modifierTypes),
    );
    if (!isLegal) {
      return {
        errorReason: `Commit to ranged attack is not legal for ${event.player} with card ${event.committedCard.id}`,
        result: false,
      };
    }
    return { result: true };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
