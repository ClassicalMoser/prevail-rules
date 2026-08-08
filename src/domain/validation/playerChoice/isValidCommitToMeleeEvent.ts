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
 * {@link getLegalCommitToMeleeEvents} (player, card id or refuse, ordered
 * modifierTypes).
 */
export function isValidCommitToMeleeEvent(
  event: CommitToMeleeEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalOptions = getLegalCommitToMeleeEvents(state);
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
        errorReason: `Commit to melee is not legal for ${event.player} with ${cardLabel}`,
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
