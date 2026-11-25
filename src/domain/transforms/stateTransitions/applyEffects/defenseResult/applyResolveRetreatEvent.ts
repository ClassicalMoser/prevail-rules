import type { ResolveRetreatEvent } from '@events';
import type { GameState, RetreatState } from '@game';
import {
  getBoardSpace,
  findRetreatLocation,
  getPlacementAfterPath,
  getPositionOfUnit,
} from '@queries';
import {
  completeEngagementInMovement,
  moveCommanderOnBoard,
  moveUnitOnBoard,
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
 * @throws Error when the path runs off the board, or when the unit's owner has no retreat open
 */
export function applyResolveRetreatEvent<S extends GameState>(
  event: ResolveRetreatEvent,
  state: S,
): S {
  // Where the unit ends is wherever its retreat path leads from where it
  // stands, read by geometry: the path was judged when it was offered.
  // A step in a retreat goes backward (§9.1.1), so the path is walked as
  // a retreat, not an advance.
  const standing = getPositionOfUnit(state, event.unit);
  const landing = getPlacementAfterPath(
    state.boardState,
    standing,
    event.path,
    'retreat',
  );

  // The unit goes where its path leads.
  const unitMoved = moveUnitOnBoard(state, event.unit, landing);

  // A commander standing with the retreating unit always goes with it
  // (§9.1.8). Only the unit's own commander: an enemy commander that rode
  // into this space is with its own unit, and stays.
  // TODO(composition): whether a side's commander stands in a space is read
  // as `commanders.includes(side)` here, in `defeatCommanderWithRoutedUnit`,
  // `getLegalCommanderMoves` and `isValidMoveUnitEvent`. Settled by one
  // `@queries` reader for "this side's commander stands here", or by reading
  // `findCommanderSpace` against the unit's space.
  const retreatingSide = event.unit.playerSide;
  const startCoordinate = standing.coordinate;
  const commanderWithUnit = getBoardSpace(
    state.boardState,
    startCoordinate,
  ).commanders.includes(retreatingSide);
  const withCommander = commanderWithUnit
    ? moveCommanderOnBoard(unitMoved, retreatingSide, landing.coordinate)
    : unitMoved;

  // The retreat being finished, and the parent holding it.
  // The parent matters: a front engagement the defender gave ground to ends
  // with the retreat, and an attack's apply does not.
  // TODO(composition): this hand-rolls a `get` over `findRetreatLocation`;
  // `getRetreatState` throws the same message but drops the parent. Settled
  // by a `getRetreatLocation` in `@queries`.
  const location = findRetreatLocation(state, retreatingSide);
  // A retreat is resolved only after it was opened, so a player with none
  // open is a fault in the sequence, not a state of the game.
  if (location === undefined) {
    throw new Error(`No retreat is in play for ${retreatingSide}`);
  }

  // Mark retreat as completed
  // The unit has fallen back; nothing more is owed in this retreat.
  const newRetreatState: RetreatState = {
    ...location.retreatState,
    completed: true,
  };

  const moved = updateRetreatState(withCommander, newRetreatState);

  // A defender that gave ground ends the front engagement: no melee is
  // fought (§6.3.2). A retreat an attack forced leaves its attack to finish.
  if (location.source !== 'frontEngagement') {
    // The attack's apply closes later, once its reverse and rout are done.
    return moved;
  }
  // The engaging unit holds the space alone, and its move can finish.
  const engagementClosed = completeEngagementInMovement(moved);
  return engagementClosed;
}
