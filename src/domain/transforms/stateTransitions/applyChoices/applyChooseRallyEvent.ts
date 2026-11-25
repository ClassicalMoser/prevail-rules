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

  // The rally is recorded for the player whose choice the step is on, the
  // first player before the second (§10.3.6), not for the event's player:
  // validation has already checked that the two agree.
  const rallyingPlayer = getRallyingPlayer(state);

  // Nothing is burnt or returned yet. A player who declines keeps the record
  // of declining, so nobody checks their units' support (§10.3.4).
  const opened = createOpenedRallyResolutionState(performRally);
  const withRally = updateRallyResolutionState(state, rallyingPlayer, opened);

  // Cleanup moves to that rally's resolution, or on to the next choice or the
  // end of the round when the player declines.
  const newGameState = updateCleanupStep(withRally, nextStep);
  return newGameState;
}
