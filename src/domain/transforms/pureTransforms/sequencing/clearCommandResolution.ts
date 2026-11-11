import type { GameState } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Ends the unit's move or shot that was under way, if any, so the next unit's
 * may begin (§4.3.9).
 *
 * @param state - The game state, in issue commands
 * @returns The game state with nothing under way
 */
export function clearCommandResolution<S extends GameState>(state: S): S {
  const phaseState = getIssueCommandsPhaseState(state);
  const updated = updatePhaseState(state, {
    ...phaseState,
    currentCommandResolutionState: 'pending',
  });
  return updated;
}
