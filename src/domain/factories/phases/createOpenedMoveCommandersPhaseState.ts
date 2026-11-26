import type { MoveCommandersPhaseState } from '@game';
import { MOVE_COMMANDERS_PHASE } from '@game';

/**
 * Phase 2 as it opens: the first player moves their commander first
 * (§4.2.1).
 *
 * @returns The Move Commanders phase, on its first step
 */
export function createOpenedMoveCommandersPhaseState(): MoveCommandersPhaseState {
  // The side holding the initiative moves first; the other follows.
  const moveCommanders: MoveCommandersPhaseState = {
    phase: MOVE_COMMANDERS_PHASE,
    step: 'moveFirstCommander',
  };

  // The phase, open and no commander yet moved.
  return moveCommanders;
}
