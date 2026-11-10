import type { ValidationResult } from '@utils';
import type { CommitToRangedDefenseEvent } from '@events';
import type { GameState } from '@game';
import { getLegalCommitToRangedDefenseEvents } from '@legality';

/**
 * Validates a CommitToRangedDefenseEvent by membership against
 * {@link getLegalCommitToRangedDefenseEvents}: the target's owner commits a
 * card from hand that names Defence or Flexibility, with exactly those of
 * its stats as its modifiers, or refuses (§4.3.11 step 5, B1).
 */
export function isValidCommitToRangedDefenseEvent(
  event: CommitToRangedDefenseEvent,
  state: GameState,
): ValidationResult {
  try {
    const legalOptions = getLegalCommitToRangedDefenseEvents(state);
    // The same player, the same card (or the same refusal), and the same
    // stats taken from it.
    const isLegal = legalOptions.some((option) => {
      if (option.player !== event.player) {
        return false;
      }
      const sameModifiers =
        option.modifierTypes.length === event.modifierTypes.length &&
        option.modifierTypes.every(
          (modifier, index) => modifier === event.modifierTypes[index],
        );
      if (!sameModifiers) {
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
      const illegal: ValidationResult = {
        errorReason: `Commit to ranged defense is not legal for ${event.player} with ${cardLabel}`,
        result: false,
      };
      return illegal;
    }
    const valid: ValidationResult = { result: true };
    return valid;
  } catch (error) {
    const fault: ValidationResult = {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
    return fault;
  }
}
