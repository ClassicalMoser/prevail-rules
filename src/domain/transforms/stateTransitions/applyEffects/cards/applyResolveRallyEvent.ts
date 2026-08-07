import type { ResolveRallyEvent } from '@events';
import type { GameState, RallyResolutionState } from '@game';
import {
  getCleanupPhaseState,
  getOwnedPlayerCardState,
  getRallyResolutionStateAwaitingBurn,
} from '@queries';
import { updateRallyResolutionStateForCurrentStep } from '@transforms/pureTransforms/sequencing/updateRallyResolutionStateForCurrentStep';
import {
  burnCardFromPlayed,
  replaceOwnedPlayerCardState,
  returnCardsToHand,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveRallyEvent to the game state.
 * Burns the specified card from played pile, then returns all remaining played
 * and discarded cards to the player's hand.
 * Marks `rallyResolved` and stays on the resolve-rally step with
 * `unitsLostSupport: 'pending'` so {@link applyResolveUnitsBrokenEvent} can run next.
 * Uses {@link getRallyResolutionStateAwaitingBurn} for sequencing invariants.
 *
 * Requires `event.player` to be owned under the state's visibility
 * ({@link getOwnedPlayerCardState} / {@link replaceOwnedPlayerCardState}).
 */
export function applyResolveRallyEvent<S extends GameState>(
  event: ResolveRallyEvent,
  state: S,
): S {
  const { player, card } = event;
  const phaseState = getCleanupPhaseState(state);

  const ownedPlayerCardState = getOwnedPlayerCardState(state.cardState, player);
  const rallyState = getRallyResolutionStateAwaitingBurn(state, player);
  const returnedCardsState = returnCardsToHand(
    burnCardFromPlayed(ownedPlayerCardState, card),
  );

  const stateWithCards = {
    ...state,
    cardState: replaceOwnedPlayerCardState(
      state.cardState,
      player,
      returnedCardsState,
    ),
  };

  const updatedRallyResolutionState: RallyResolutionState = {
    ...rallyState,
    rallyResolved: true,
    // Still pending — computed by applyResolveUnitsBrokenEvent, not here.
    unitsLostSupport: 'pending',
    routState: 'pending',
  };

  const newPhaseState = updateRallyResolutionStateForCurrentStep(
    phaseState,
    updatedRallyResolutionState,
    phaseState.step,
  );

  return updatePhaseState(stateWithCards, newPhaseState);
}
