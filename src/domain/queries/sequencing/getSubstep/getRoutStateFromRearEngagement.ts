import type { Board } from '@entities';
import type { GameStateForBoard, RoutState } from '@game';
import { throwIfPending } from '@utils';
import { getMovementResolutionState } from '../getCommandResolutionState';

/**
 * Rout state for a **rear** engagement inside the current **movement** command resolution.
 * Narrowing helper when `routResolutionSource` is `rearEngagementMovement`.
 */
export function getRoutStateFromRearEngagement<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
): RoutState {
  const movement = getMovementResolutionState(state);
  const engagement = throwIfPending(
    movement.engagementState,
    'Movement resolution has no engagement state',
  );

  const resolution = engagement.engagementResolutionState;

  if (resolution.engagementType !== 'rear') {
    throw new Error(
      `Expected rear engagement for movement rout, got ${resolution.engagementType}`,
    );
  }

  return resolution.routState;
}
