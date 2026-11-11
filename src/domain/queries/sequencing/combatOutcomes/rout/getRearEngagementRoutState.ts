import type { GameState, RoutState } from '@game';
import { throwIfPending } from '@utils';
import { getMovementResolutionState } from '@queries/sequencing/commandResolution/getMovementResolutionState';

/**
 * Rout state for a **rear** engagement inside the current **movement** command resolution.
 * Narrowing helper for a rout held by a rear engagement during a move.
 */
export function getRearEngagementRoutState(state: GameState): RoutState {
  const movement = getMovementResolutionState(state);
  const engagement = throwIfPending(
    movement.engagementState,
    'Movement resolution has no engagement state',
  );

  const resolution = engagement.engagementResolutionState;

  // Only a rear engagement forces this rout. Front and flank throw.
  if (resolution.engagementType !== 'rear') {
    throw new Error(
      `Expected rear engagement for movement rout, got ${resolution.engagementType}`,
    );
  }

  const routState = resolution.routState;
  return routState;
}
