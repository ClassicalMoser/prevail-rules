import type { ResolveFlankEngagementEvent } from '@events';
import type { GameState } from '@game';
import {
  completeEngagementInMovement,
  moveUnitOnBoard,
  updateBoardState,
  updateFlankEngagementResolutionState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveFlankEngagementEvent to the game state.
 * Rotates the defending unit to face the engaging unit and marks the defender as rotated.
 * Uses `event.defenderWithPlacement` and {@link getFlankEngagementStateFromMovement} (panicky
 * narrowing); does not call `getPositionOfUnit`.
 */
export function applyResolveFlankEngagementEvent<S extends GameState>(
  event: ResolveFlankEngagementEvent,
  state: S,
): S {
  const { unit, placement } = event.defenderWithPlacement;

  // The defender is dragged round to face the engaging unit (§6.3.4).
  const updatedBoard = moveUnitOnBoard(state.boardState, unit, {
    ...placement,
    facing: event.newFacing,
  });

  const turned = completeEngagementInMovement(
    updateFlankEngagementResolutionState(
      updateBoardState(state, updatedBoard),
      { defenderRotated: true },
    ),
  );
  return turned;
}
