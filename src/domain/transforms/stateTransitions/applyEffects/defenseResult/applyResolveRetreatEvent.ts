import type { ResolveRetreatEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import {
  getBoardSpace,
  getFrontEngagementStateFromMovement,
  findRetreatLocation,
  getPlacementAfterPath,
} from '@queries';
import {
  moveCommanderOnBoard,
  moveUnitOnBoard,
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

  // Move the unit on the board
  const unitMovedBoard = moveUnitOnBoard(
    state.boardState,
    event.startingPosition.unit,
    landing,
  );

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

  // The retreat being finished, and the parent holding it.
  const retreatingPlayer = event.startingPosition.unit.playerSide;
  const location = findRetreatLocation(state, retreatingPlayer);
  if (location === undefined) {
    throw new Error(`No retreat is in play for ${retreatingPlayer}`);
  }

  // Mark retreat as completed
  const newRetreatState: RetreatState = {
    ...location.retreatState,
    completed: true,
  };

  const stateWithUpdatedRetreat = updateRetreatState(state, newRetreatState);
  const moved = updateBoardState(stateWithUpdatedRetreat, addedUnitBoard);

  // A defender that gave ground ends the front engagement: no melee is
  // fought (§6.3.2). A retreat an attack forced leaves its attack to finish.
  if (location.source !== 'frontEngagement') {
    return moved;
  }
  const front = getFrontEngagementStateFromMovement(moved);
  const engagementClosed = updateEngagementStateInMovement(moved, {
    ...front,
    completed: true,
  });
  return engagementClosed;
}
