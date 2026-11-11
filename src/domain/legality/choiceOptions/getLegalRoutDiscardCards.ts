import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { findOwnedPlayerCardState, findRoutOwingDiscard } from '@queries';

/**
 * Atomic rout-discard options for UI and validation: which player must discard,
 * how many cards, and which hand card IDs may be chosen.
 */
export interface LegalRoutDiscardCards {
  player: PlayerSide;
  numberToDiscard: number;
  /**
   * Eligible card IDs from the discarding player's owned hand. Empty when
   * this view cannot see that hand: an opponent's seat knows how many cards
   * must go, but not which are held.
   */
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
 * Nothing asks for a discard unless a rout is awaiting one, so being asked
 * then is the caller's mistake and throws. A hand this view cannot see is an
 * ordinary state for a seated client, and answers with no cards to choose from.
 *
 * @throws Error when no rout is awaiting a discard, or the rout has not yet
 * worked out how many cards it costs
 */
export function getLegalRoutDiscardCards<S extends GameState>(
  gameState: S,
): LegalRoutDiscardCards {
  const routState = findRoutOwingDiscard(gameState);
  if (routState === undefined) {
    throw new Error('No rout is awaiting a discard');
  }
  if (routState.numberToDiscard === 'pending') {
    throw new Error(
      'The rout has not yet worked out how many cards to discard',
    );
  }

  // Under this visibility the discarding player's hand may be hidden.
  const owned = findOwnedPlayerCardState(gameState.cardState, routState.player);
  const cardIds =
    owned === undefined ? [] : owned.inHand.map((card) => card.id);

  const legal: LegalRoutDiscardCards = {
    cardIds,
    numberToDiscard: routState.numberToDiscard,
    player: routState.player,
  };
  return legal;
}
