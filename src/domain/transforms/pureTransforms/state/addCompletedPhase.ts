import type { GameState, PhaseState } from '@game';
import { updateRoundState } from './updateRoundState';

/**
 * Adds a completed phase to the completed phases set.
 * Handles the immutable update of the completedPhases set.
 *
 * @param state - The current game state
 * @param completedPhase - The phase state to add to completed phases
 * @returns A new game state with the completed phase added
 *
 * @example
 * ```ts
 * const newState = addCompletedPhase(state, currentPhaseState);
 * ```
 */
// TODO(misleading): the header calls `completedPhases` a set; it is a list,
// in the order the phases ended. Settle by "list".
// TODO(composition): nothing in this repository reads `completedPhases`; it is
// written by the phase-completion applies and cleared at `roundEnd`. Settle by
// naming its reader (a client's round history?) or dropping the record.
export function addCompletedPhase<S extends GameState>(
  state: S,
  completedPhase: PhaseState,
): S {
  // The phases run in a fixed order (§4), so the one just ended goes after
  // those before it.
  const newCompletedPhases = [...state.currentRoundState.completedPhases];
  newCompletedPhases.push(completedPhase);

  // Update the round state with the new completed phases
  const newState = updateRoundState(state, {
    ...state.currentRoundState,
    completedPhases: newCompletedPhases,
  });

  // The state with the phase recorded among those ended this round.
  return newState;
}
