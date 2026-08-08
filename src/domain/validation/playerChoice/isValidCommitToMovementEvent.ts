import type { ValidationResult } from '@utils';
import type { CommitToMovementEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToMovementEvents } from '@legality';

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
 * Validates a CommitToMovementEvent by membership against
 * {@link getLegalCommitToMovementEvents} (player, card id or refuse, ordered
 * modifierTypes).
 */
export function isValidCommitToMovementEvent(
  event: CommitToMovementEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalOptions = getLegalCommitToMovementEvents(state);
    const isLegal = legalOptions.some((option) => {
      if (option.player !== event.player) {
        return false;
      }
      if (!sameModifierTypes(option.modifierTypes, event.modifierTypes)) {
        return false;
      }
      if (option.committedCard === null || event.committedCard === null) {
        return option.committedCard === event.committedCard;
      }
      return option.committedCard.id === event.committedCard.id;
    });
    if (!isLegal) {
      const cardLabel =
        event.committedCard === null
          ? 'refuse'
          : `card ${event.committedCard.id}`;
      return {
        errorReason: `Commit to movement is not legal for ${event.player} with ${cardLabel}`,
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
