import type { CommandResolutionState, GameState } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import { isPending } from '@utils';
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
  // Orders are only carried out in Phase 3; asked elsewhere, this throws.
  const phaseState = getIssueCommandsPhaseState(state);

  // Each unit is finished before the next begins (§4.3.9), so a unit still
  // acting means the last one was never cleared: a fault in the sequence,
  // not a choice the player made.
  if (!isPending(phaseState.currentCommandResolutionState)) {
    throw new Error('A command is already being resolved');
  }

  // The chosen unit's move or shot is the one under way.
  const updated = updatePhaseState(state, {
    ...phaseState,
    currentCommandResolutionState: resolution,
  });

  // Phase 3 with that unit acting.
  return updated;
}
