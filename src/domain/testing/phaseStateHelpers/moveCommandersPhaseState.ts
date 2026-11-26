import type { MoveCommandersPhaseState } from '@game';
import { MOVE_COMMANDERS_PHASE } from '@game';

/**
 * Creates a MoveCommandersPhaseState with sensible defaults.
 */
export function createMoveCommandersPhaseState(
  overrides?: Partial<MoveCommandersPhaseState>,
): MoveCommandersPhaseState {
  return {
    phase: MOVE_COMMANDERS_PHASE,
    step: 'moveFirstCommander',
    ...overrides,
  };
}
