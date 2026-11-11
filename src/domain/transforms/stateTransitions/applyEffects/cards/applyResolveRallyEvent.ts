import type { ResolveRallyEvent } from '@events';
import type { GameState, RallyResolutionState } from '@game';
import { getRallyResolutionStateAwaitingBurn } from '@queries';
import {
  burnCardFromPlayed,
  burnHiddenCardFromPlayed,
  returnCardsToHand,
  returnHiddenCardsToHand,
  updatePlayerCards,
  updateRallyResolutionState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveRallyEvent to the game state.
 * Burns the specified card from the played pile, then returns all remaining played
 * and discarded cards to the player's hand.
 * Marks `rallyResolved` and stays on the resolve-rally step with
 * `unitsLostSupport: 'pending'` so {@link applyAssignUnitSupportEvent} can run next.
 * Uses {@link getRallyResolutionStateAwaitingBurn} for sequencing invariants.
 *
 * Works for the owned slice and for the opponent's hidden slice on a seat view.
 * On a hidden slice the burnt card stays public; cards returned to hand become
 * `'hidden'` placeholders.
 */
export function applyResolveRallyEvent<S extends GameState>(
  event: ResolveRallyEvent,
  state: S,
): S {
  const { player, card } = event;
  const rallyState = getRallyResolutionStateAwaitingBurn(state, player);

  // The burnt card is gone for good and the rest of the played and discarded
  // cards return to hand, as the seat holds them: shown where it can see the
  // hand, counted where it cannot (§10.3).
  const stateWithCards = updatePlayerCards(state, player, {
    hidden: (hidden) =>
      returnHiddenCardsToHand(burnHiddenCardFromPlayed(hidden, card)),
    owned: (owned) => returnCardsToHand(burnCardFromPlayed(owned, card)),
  });

  const updatedRallyResolutionState: RallyResolutionState = {
    ...rallyState,
    rallyResolved: true,
    // Still pending — populated by applyAssignUnitSupportEvent, not here.
    unitsLostSupport: 'pending',
    routState: 'pending',
  };

  const resolved = updateRallyResolutionState(
    stateWithCards,
    player,
    updatedRallyResolutionState,
  );
  return resolved;
}
