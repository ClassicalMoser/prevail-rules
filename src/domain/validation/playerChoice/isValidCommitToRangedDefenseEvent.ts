import type { ValidationResult } from '@utils';
import type { CommitToRangedDefenseEvent } from '@events';
import type { GameState } from '@game';
import { isSameCard, isSameCardValue } from '@queries';
import { getLegalCommitToRangedDefenseEvents } from '@legality';

/**
 * Validates a CommitToRangedDefenseEvent by membership against
 * {@link getLegalCommitToRangedDefenseEvents}: the target's owner commits a
 * card from hand that names Defence or Flexibility, with exactly those of
 * its stats as its modifiers, or refuses (§4.3.11 step 5).
 */
export function isValidCommitToRangedDefenseEvent(
  event: CommitToRangedDefenseEvent,
  state: GameState,
): ValidationResult {
  const legalOptions = getLegalCommitToRangedDefenseEvents(state);
  // The same player, the same card (or the same refusal), and the same
  // stats taken from it.
  const legalOption = legalOptions.find((option) => {
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
    return isSameCard(option.committedCard, event.committedCard).result;
  });
  if (legalOption === undefined) {
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
  // The id names a card the player holds; what the event says that card is
  // must be what it is, since the commitment's stats are read from it.
  if (legalOption.committedCard !== null && event.committedCard !== null) {
    const sameCard = isSameCardValue(
      legalOption.committedCard,
      event.committedCard,
    );
    if (!sameCard.result) {
      return sameCard;
    }
  }
  const valid: ValidationResult = { result: true };
  return valid;
}
