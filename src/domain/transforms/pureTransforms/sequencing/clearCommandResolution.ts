import type { GameState, IssueCommandsPhaseState } from '@game';
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
  // Orders are only carried out in Phase 3; asked elsewhere, this throws.
  const phaseState = getIssueCommandsPhaseState(state);

  // Each unit is finished before the next begins (§4.3.9): the slot goes
  // back to `'pending'`, which is how `openCommandResolution` knows it may
  // open the next unit's move or shot.
  const cleared: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: 'pending',
  };
  const updated = updatePhaseState(state, cleared);

  // Phase 3 with no unit acting, waiting for the next to be chosen.
  return updated;
}
