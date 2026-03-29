import type { Board, CardState } from '@entities';
import type { ResolveRallyEvent } from '@events';
import type { GameState, RallyResolutionState } from '@game';
import {
  getCleanupPhaseState,
  getNextStepForResolveRally,
  getRallyResolutionStateAwaitingBurn,
  updateRallyResolutionStateForCurrentStep,
} from '@queries';
import {
  burnCardFromPlayed,
  returnCardsToHand,
  updateCardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveRallyEvent to the game state.
 * Burns the specified card from played pile, then returns all remaining played
 * and discarded cards to the player's hand.
 * Advances to the appropriate resolveUnitSupport step.
 * Uses {@link getRallyResolutionStateAwaitingBurn} for sequencing invariants.
 *
 * @param event - The resolve rally event to apply
 * @param state - The current game state
 * @returns A new game state with rally resolved
 */
export function applyResolveRallyEvent<TBoard extends Board>(
  event: ResolveRallyEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const { player, card } = event;
  const phaseState = getCleanupPhaseState(state);

  const rallyState = getRallyResolutionStateAwaitingBurn(state, player);
  const nextStep = getNextStepForResolveRally(state);

  // Compose pure transforms
  let newCardState: CardState = state.cardState;
  newCardState = burnCardFromPlayed(newCardState, player, card);
  newCardState = returnCardsToHand(newCardState, player);

  // Mark rally as resolved and initialize unit support checking
  const updatedRallyResolutionState: RallyResolutionState = {
    ...rallyState,
    rallyResolved: true,
    unitsLostSupport: new Set([]), // TODO: Calculate which units lost support
    routState: undefined,
  };

  // Update phase state with new rally resolution state
  const newPhaseState = updateRallyResolutionStateForCurrentStep(
    phaseState,
    updatedRallyResolutionState,
    nextStep,
  );

  const stateWithCards = updateCardState(state, newCardState);
  return updatePhaseState(stateWithCards, newPhaseState);
}
