import type { ResolveRetreatEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import {
  findRetreatState,
  getFrontEngagementStateFromMovement,
} from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
  updateBoardState,
  updateEngagementStateInMovement,
  updateRetreatState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveRetreatEvent to the game state.
 * Moves the retreating unit from startingPosition to finalPosition on the board.
 * Marks the retreat state as completed.
 *
 * When the retreat is nested under a front engagement, also marks
 * `defendingUnitRetreated` and completes the engagement.
 *
 * @param event - The resolve retreat event to apply
 * @param state - The current game state
 * @returns A new game state with the unit moved and retreat state marked as completed
 */
export function applyResolveRetreatEvent<S extends GameState>(
  event: ResolveRetreatEvent,
  state: S,
): S {
  // Move the unit on the board
  const removedUnitBoard = removeUnitFromBoard(
    state.boardState,
    event.startingPosition,
  );
  const addedUnitBoard = addUnitToBoard(removedUnitBoard, event.finalPosition);

  // Get the current retreat state to update
  const retreatingPlayer = event.startingPosition.unit.playerSide;
  const currentRetreatState = findRetreatState(state, retreatingPlayer);

  // Mark retreat as completed
  const newRetreatState: RetreatState = {
    ...currentRetreatState,
    completed: true,
  };

  const stateWithUpdatedRetreat = updateRetreatState(state, newRetreatState);
  let next = updateBoardState(stateWithUpdatedRetreat, addedUnitBoard);

  try {
    const front = getFrontEngagementStateFromMovement(next);
    if (
      front.engagementResolutionState.retreatState !== 'pending' &&
      front.engagementResolutionState.retreatState.completed
    ) {
      next = updateEngagementStateInMovement(next, {
        ...front,
        completed: true,
        engagementResolutionState: {
          ...front.engagementResolutionState,
          defendingUnitRetreated: true,
        },
      });
    }
  } catch {
    // Not a front-engagement retreat parent (ranged / melee attack-apply).
  }

  return next;
}
