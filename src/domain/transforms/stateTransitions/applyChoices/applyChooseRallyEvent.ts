import type { ChooseRallyEvent } from '@events';
import type { GameState } from '@game';
import { createOpenedRallyResolutionState } from '@factories';
import { getNextStepForChooseRally, getRallyingPlayer } from '@queries';
import {
  updateCleanupStep,
  updateRallyResolutionState,
} from '@transforms/pureTransforms';

/**
 * Applies a ChooseRallyEvent to the game state.
 * If player chooses to rally, advances to resolveRally step.
 * If player chooses not to rally, skips to the next choose-rally or complete step.
 * Event is assumed pre-validated (correct step and player).
 *
 * @param event - The choose rally event to apply
 * @param state - The current game state
 * @returns A new game state with the step advanced
 */
export function applyChooseRallyEvent<S extends GameState>(
  event: ChooseRallyEvent,
  state: S,
): S {
  const { performRally } = event;

  // The rallying player's rally begins with the choice, and the step moves
  // on to resolving it, or past it when the player declines (§10.3).
  const nextStep = getNextStepForChooseRally(state, performRally);
  const withRally = updateRallyResolutionState(
    state,
    getRallyingPlayer(state),
    createOpenedRallyResolutionState(performRally),
  );
  const newGameState = updateCleanupStep(withRally, nextStep);
  return newGameState;
}
