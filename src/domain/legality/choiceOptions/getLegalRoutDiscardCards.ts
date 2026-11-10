import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { findOwnedPlayerCardState, findRoutOwingDiscard } from '@queries';

/**
 * Atomic rout-discard options for UI and validation: which player must discard,
 * how many cards, and which hand card IDs may be chosen.
 *
 * `null` when a rout discard is not expected under this state/visibility.
 */
export interface LegalRoutDiscardCards {
  player: PlayerSide;
  numberToDiscard: number;
  /** Eligible card IDs from the discarding player's owned hand. */
  cardIds: readonly string[];
}

/**
 * Returns the atomic rout-discard selection context whenever an active rout
 * slice awaits card selection (cleanup rally, rear engagement, attack apply,
 * melee, or a retreat that found nowhere to go).
 *
 * Does not expand combinations — callers pick `numberToDiscard` IDs from
 * {@link LegalRoutDiscardCards.cardIds}; {@link isValidChooseRoutDiscardEvent}
 * checks integrity of the committed set.
 *
 * Returns `null` when discard is not expected or the discarding player's hand
 * is hidden under this visibility.
 */
export function getLegalRoutDiscardCards<S extends GameState>(
  gameState: S,
): LegalRoutDiscardCards | null {
  const routState = findRoutOwingDiscard(gameState);
  // Nothing routing, or a rout that owes no cards, means no discard to offer.
  if (routState === undefined) {
    return null;
  }
  if (routState.numberToDiscard === 'pending') {
    return null;
  }

  // Discarding player's hand is hidden under this visibility.
  const owned = findOwnedPlayerCardState(gameState.cardState, routState.player);
  if (owned === undefined) {
    return null;
  }
  const cardIds = owned.inHand.map((card) => card.id);

  return {
    cardIds,
    numberToDiscard: routState.numberToDiscard,
    player: routState.player,
  };
}
