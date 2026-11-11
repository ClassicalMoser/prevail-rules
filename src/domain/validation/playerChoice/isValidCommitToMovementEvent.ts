import type { ValidationResult } from '@utils';
import type { CommitToMovementEvent } from '@events';
import type { GameState } from '@game';
import { isSameCard, isSameCardValue } from '@queries';
import { getLegalCommitToMovementEvents } from '@legality';

/**
 * Validates a CommitToMovementEvent by membership against
 * {@link getLegalCommitToMovementEvents} (player, card id or refuse).
 */
export function isValidCommitToMovementEvent(
  event: CommitToMovementEvent,
  state: GameState,
): ValidationResult {
  const legalOptions = getLegalCommitToMovementEvents(state);
  const legalOption = legalOptions.find((option) => {
    if (option.player !== event.player) {
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
    return {
      errorReason: `Commit to movement is not legal for ${event.player} with ${cardLabel}`,
      result: false,
    };
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
  return { result: true };
}
