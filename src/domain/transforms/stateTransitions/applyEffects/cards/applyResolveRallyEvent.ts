import type { Board, CardState } from "@entities";
import type { ResolveRallyEvent } from "@events";
import type { GameState, GameStateForBoard, RallyResolutionState } from "@game";
import {
  getCleanupPhaseState,
  getNextStepForResolveRally,
  getRallyResolutionStateAwaitingBurn,
  updateRallyResolutionStateForCurrentStep,
} from "@queries";
import {
  burnCardFromPlayed,
  returnCardsToHand,
  updateCardState,
  updatePhaseState,
} from "@transforms/pureTransforms";

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
  event: ResolveRallyEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const { player, card } = event;
  // Safe broad type cast because we know the event is for the board type
  const phaseState = getCleanupPhaseState(state as GameState);

  const rallyState = getRallyResolutionStateAwaitingBurn(state, player);

  // Safe broad type cast because we know the event is for the board type
  const nextStep = getNextStepForResolveRally(state as GameState);

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
