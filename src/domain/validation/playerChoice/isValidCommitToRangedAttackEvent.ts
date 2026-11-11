import type { ValidationResult } from '@utils';
import type { CommitToRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { isSameCard, isSameCardValue } from '@queries';
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
 * {@link getLegalCommitToRangedAttackEvents} (player, card id or refuse, ordered
 * modifierTypes).
 */
export function isValidCommitToRangedAttackEvent(
  event: CommitToRangedAttackEvent,
  state: GameState,
): ValidationResult {
  const legalOptions = getLegalCommitToRangedAttackEvents(state);
  const legalOption = legalOptions.find((option) => {
    if (option.player !== event.player) {
      return false;
    }
    if (!sameModifierTypes(option.modifierTypes, event.modifierTypes)) {
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
      errorReason: `Commit to ranged attack is not legal for ${event.player} with ${cardLabel}`,
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
