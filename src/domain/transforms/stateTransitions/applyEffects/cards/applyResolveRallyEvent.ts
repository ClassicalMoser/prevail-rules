import type { ResolveRallyEvent } from '@events';
import type {
  GameState,
  GameStateForVisibility,
  RallyResolutionState,
} from '@game';
import {
  getCleanupPhaseState,
  getNextStepForResolveRally,
  getRallyResolutionStateAwaitingBurn,
} from '@queries';
import { updateRallyResolutionStateForCurrentStep } from '@transforms/pureTransforms/sequencing/updateRallyResolutionStateForCurrentStep';
import {
  burnCardFromPlayed,
  returnCardsToHand,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveRallyEvent to the game state.
 * Burns the specified card from played pile, then returns all remaining played
 * and discarded cards to the player's hand.
 * Advances to the appropriate resolveUnitSupport step.
 * Uses {@link getRallyResolutionStateAwaitingBurn} for sequencing invariants.
 *
 * Trusts authoritative visibility for owned card slices.
 */
export function applyResolveRallyEvent(
  event: ResolveRallyEvent,
  state: GameState,
): GameState {
  const authoritative = state as GameStateForVisibility<'authoritative'>;
  const { player, card } = event;
  const phaseState = getCleanupPhaseState(authoritative);

  const rallyState = getRallyResolutionStateAwaitingBurn(authoritative, player);
  const nextStep = getNextStepForResolveRally(authoritative);

  const stateWithCards = updatePlayerCardState(
    authoritative,
    player,
    returnCardsToHand(
      burnCardFromPlayed(authoritative.cardState[player], card),
    ),
  );

  const updatedRallyResolutionState: RallyResolutionState = {
    ...rallyState,
    rallyResolved: true,
    unitsLostSupport: [], // TODO: Calculate which units lost support
    routState: 'pending',
  };

  const newPhaseState = updateRallyResolutionStateForCurrentStep(
    phaseState,
    updatedRallyResolutionState,
    nextStep,
  );

  return updatePhaseState(stateWithCards, newPhaseState);
}
