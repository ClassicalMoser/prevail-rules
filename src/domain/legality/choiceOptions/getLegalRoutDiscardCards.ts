import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { findOwnedPlayerCardState, findRoutOwingDiscard } from '@queries';
import { isPending } from '@utils';

/**
 * Atomic rout-discard options for UI and validation: which player must discard,
 * how many cards, and which hand card IDs may be chosen.
 */
export interface LegalRoutDiscardCards {
  /** The player whose unit routed, who pays its Morale (§9.3.2). */
  player: PlayerSide;
  /** How many cards the rout costs: the Morale it owes (§9.3.2, §9.3.3). */
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
 * {@link LegalRoutDiscardCards.cardIds}; `isValidChooseRoutDiscardEvent`
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
  // A discard is asked for only once a rout has counted its cost and its
  // owner has not yet paid it.
  const routState = findRoutOwingDiscard(gameState);
  if (routState === undefined) {
    throw new Error('No rout is awaiting a discard');
  }

  // TODO(composition): unreachable. `findRoutOwingDiscard` answers only a
  // rout whose penalty is counted (`isAwaitingRoutDiscard`), so this guard
  // can never throw, and the `@throws` line above that names it describes a
  // case that cannot happen. Its type still says `RoutState`, so the guard
  // only narrows. Settled by having that query answer a rout whose
  // `numberToDiscard` is a number, and dropping this guard.
  if (isPending(routState.numberToDiscard)) {
    throw new Error(
      'The rout has not yet worked out how many cards to discard',
    );
  }

  // Under this visibility the discarding player's hand may be hidden.
  // The owner chooses freely from their hand (§9.3.2), so every card in it is
  // eligible. Whether the hand can bear the cost is not asked here: a debt the
  // hand cannot survive ends the game (§11.2), which
  // `findWinnerFromUnpayableRoutDiscard` reads.
  const owned = findOwnedPlayerCardState(gameState.cardState, routState.player);
  const cardIds =
    owned === undefined ? [] : owned.inHand.map((card) => card.id);

  const legal: LegalRoutDiscardCards = {
    cardIds,
    numberToDiscard: routState.numberToDiscard,
    player: routState.player,
  };

  // What `isValidChooseRoutDiscardEvent` checks the chosen cards against.
  return legal;
}
