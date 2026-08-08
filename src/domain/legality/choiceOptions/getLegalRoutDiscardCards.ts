import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { getAwaitingRoutDiscardState, getOwnedPlayerCardState } from '@queries';

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
 * melee).
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
  const routState = getAwaitingRoutDiscardState(gameState);
  if (routState === null || routState.numberToDiscard === 'pending') {
    return null;
  }

  let cardIds: string[];
  try {
    cardIds = getOwnedPlayerCardState(
      gameState.cardState,
      routState.player,
    ).inHand.map((card) => card.id);
  } catch {
    // Discarding player's hand is hidden under this visibility.
    return null;
  }

  return {
    cardIds,
    numberToDiscard: routState.numberToDiscard,
    player: routState.player,
  };
}
