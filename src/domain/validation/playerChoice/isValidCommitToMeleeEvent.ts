import type { ValidationResult } from '@utils';
import type { CommitToMeleeEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToMeleeEvents } from '@legality';

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
 * Validates a CommitToMeleeEvent by membership against
 * {@link getLegalCommitToMeleeEvents} (player, card id, ordered modifierTypes).
 */
export function isValidCommitToMeleeEvent(
  event: CommitToMeleeEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalOptions = getLegalCommitToMeleeEvents(state);
    const isLegal = legalOptions.some(
      (option) =>
        option.player === event.player &&
        option.committedCard.id === event.committedCard.id &&
        sameModifierTypes(option.modifierTypes, event.modifierTypes),
    );
    if (!isLegal) {
      return {
        errorReason: `Commit to melee is not legal for ${event.player} with card ${event.committedCard.id}`,
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
