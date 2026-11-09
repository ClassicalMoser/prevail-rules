import type { ResolveRetreatEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import {
  getBoardSpace,
  getFrontEngagementStateFromMovement,
  getPlacementAfterPath,
  getRetreatState,
} from '@queries';
import {
  addUnitToBoard,
  moveCommanderOnBoard,
  removeUnitFromBoard,
  updateBoardState,
  updateEngagementStateInMovement,
  updateRetreatState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveRetreatEvent to the game state.
 * Moves the retreating unit from where it stood to where its path leads,
 * and its commander with it if the commander stood in its space (§9.1.8).
 * Marks the retreat state as completed.
 *
 * When the retreat is nested under a front engagement, also completes the engagement.
 *
 * @param event - The resolve retreat event to apply
 * @param state - The current game state
 * @returns A new game state with the unit moved and retreat state marked as completed
 */
export function applyResolveRetreatEvent<S extends GameState>(
  event: ResolveRetreatEvent,
  state: S,
): S {
  // Where the unit ends is wherever its retreat path leads from where it
  // stood, read by geometry: the path was judged when it was offered.
  const landing = getPlacementAfterPath(
    state.boardState,
    event.startingPosition.placement,
    event.path,
    'retreat',
  );
  if (landing === undefined) {
    throw new Error('The retreat path leaves the board');
  }
  const arrived = { placement: landing, unit: event.startingPosition.unit };

  // Move the unit on the board
  const removedUnitBoard = removeUnitFromBoard(
    state.boardState,
    event.startingPosition,
  );
  const unitMovedBoard = addUnitToBoard(removedUnitBoard, arrived);

  // A commander standing with the retreating unit always goes with it
  // (§9.1.8). Only the unit's own commander: an enemy commander that rode
  // into this space is with its own unit, and stays.
  const retreatingSide = event.startingPosition.unit.playerSide;
  const startCoordinate = event.startingPosition.placement.coordinate;
  const commanderWithUnit = getBoardSpace(
    state.boardState,
    startCoordinate,
  ).commanders.includes(retreatingSide);
  const addedUnitBoard = commanderWithUnit
    ? moveCommanderOnBoard(
        unitMovedBoard,
        retreatingSide,
        startCoordinate,
        landing.coordinate,
      )
    : unitMovedBoard;

  // Get the current retreat state to update
  const retreatingPlayer = event.startingPosition.unit.playerSide;
  const currentRetreatState = getRetreatState(state, retreatingPlayer);

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
      });
    }
  } catch {
    // Not a front-engagement retreat parent (ranged / melee attack-apply).
  }

  return next;
}
