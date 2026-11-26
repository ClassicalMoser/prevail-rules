import { createOpenedMoveCommandersPhaseState } from '@factories';
import type { MoveCommandersPhaseState } from '@game';

/**
 * Phase 2 as it opens, with what a spec sets beyond that.
 *
 * @param overrides - A later step, such as the second commander's move
 * @returns The Move Commanders phase, to put in a game with `updatePhaseState`
 */
export function createMoveCommandersPhaseState(
  overrides?: Partial<MoveCommandersPhaseState>,
): MoveCommandersPhaseState {
  const moveCommanders: MoveCommandersPhaseState = {
    // Phase 2 opens on the first player's commander; the second moves after
    // (§4.2.1).
    ...createOpenedMoveCommandersPhaseState(),
    ...overrides,
  };

  // The phase, to put in a game with `updatePhaseState`.
  return moveCommanders;
}
