import type { MoveCommandersPhaseState } from '@game';
import { MOVE_COMMANDERS_PHASE } from '@game';

/**
 * Creates a MoveCommandersPhaseState with sensible defaults.
 */
export function createMoveCommandersPhaseState(
  overrides?: Partial<MoveCommandersPhaseState>,
): MoveCommandersPhaseState {
  const moveCommanders: MoveCommandersPhaseState = {
    phase: MOVE_COMMANDERS_PHASE,
    // Phase 2 opens on the first player's commander; the second moves after
    // (§4.2.1).
    step: 'moveFirstCommander',
    ...overrides,
  };

  // The phase, to put in a game with `updatePhaseState`.
  return moveCommanders;
}
