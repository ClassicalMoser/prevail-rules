import type { Board, GameState, RoutState } from '@entities';
import { getMovementResolutionState } from '../getCommandResolutionState';

/**
 * Rout state for a **rear** engagement inside the current **movement** command resolution.
 * Narrowing helper when `routResolutionSource` is `rearEngagementMovement`.
 */
export function getRoutStateFromRearEngagement<TBoard extends Board>(
  state: GameState<TBoard>,
): RoutState {
  const movement = getMovementResolutionState(state);
  const engagement = movement.engagementState;
  if (engagement === undefined) {
    throw new Error('Movement resolution has no engagement state');
  }

  const resolution = engagement.engagementResolutionState;

  if (resolution.engagementType !== 'rear') {
    throw new Error(
      `Expected rear engagement for movement rout, got ${resolution.engagementType}`,
    );
  }

  if (resolution.routState === undefined) {
    throw new Error('Rear engagement has no rout state');
  }

  return resolution.routState;
}
