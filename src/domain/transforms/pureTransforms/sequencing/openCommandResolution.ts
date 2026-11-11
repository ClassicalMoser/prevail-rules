import type { CommandResolutionState, GameState } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Begins carrying out one unit's part of an order: a move or a shot (§4.3.9).
 * Orders are carried out one unit at a time, so none may already be under way.
 *
 * @param state - The game state, in issue commands
 * @param resolution - The move or shot now under way
 * @returns The game state with it under way
 * @throws Error when another is already under way
 */
export function openCommandResolution<S extends GameState>(
  state: S,
  resolution: CommandResolutionState,
): S {
  const phaseState = getIssueCommandsPhaseState(state);
  if (phaseState.currentCommandResolutionState !== 'pending') {
    throw new Error('A command is already being resolved');
  }
  const updated = updatePhaseState(state, {
    ...phaseState,
    currentCommandResolutionState: resolution,
  });
  return updated;
}
