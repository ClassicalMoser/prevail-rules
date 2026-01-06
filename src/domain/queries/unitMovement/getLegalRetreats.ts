import type {
  Board,
  GameState,
  UnitFacing,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type { MoveResult } from './exploreUnitMoves';
import {
  getBoardSpace,
  getFrontSpaces,
  getSpacesBehind,
} from '@queries/boardSpace';
import { getOppositeFacing } from '@queries/facings';
import { getCurrentUnitStat } from '@queries/getCurrentUnitStat';
import { areSameSide } from '@queries/unit';
import {
  hasEngagedUnits,
  hasNoUnit,
  hasSingleUnit,
  isSameUnitInstance,
} from '@validation';
import { exploreUnitMoves } from './exploreUnitMoves';

/**
 * Finds all legal retreat moves for a unit.
 * A retreat is the smallest legal backward movement:
 * - Lowest flexibility (fewest facing changes) first
 * - Then lowest speed (smallest distance)
 *
 * A retreat moves in the reverse direction from the unit's facing.
 * Only engaged units can retreat, and retreats cannot engage enemies.
 *
 * If multiple equal options exist, all are returned.
 *
 * @param unitWithPlacement - The unit and its starting position
 * @param gameState - The current game state
 * @returns A set of all legal retreat moves (unit placements), or empty set if no retreat is possible
 * @throws {Error} If the unit is not engaged, not present, or facing mismatch
 *
 * @example
 * ```typescript
 * // Get legal retreats for a unit at position E-5 facing north
 * const unit = createUnitInstance("black", someUnitType, 1);
 * const board = createEmptyStandardBoard();
 * const retreats = getLegalRetreats(unit, board, {
 *   coordinate: "E-5",
 *   facing: "north",
 * });
 * // Returns all retreat options (smallest backward movements)
 * ```
 */
export function getLegalRetreats<TBoard extends Board>(
  unitWithPlacement: UnitWithPlacement<TBoard>,
  gameState: GameState<TBoard>,
): Set<UnitPlacement<TBoard>> {
  // Get the board state
  const board = gameState.boardState;
  const coordinate = unitWithPlacement.placement.coordinate;
  const facing = unitWithPlacement.placement.facing;
  const boardSpace = getBoardSpace(board, coordinate);
  const { unit, placement: startingPosition } = unitWithPlacement;

  // Check the space for unit presence
  if (hasNoUnit(boardSpace.unitPresence)) {
    throw new Error('No unit present at starting position');
  }

  let foundMatchFacing: UnitFacing | undefined;
  if (hasSingleUnit(boardSpace.unitPresence)) {
    if (isSameUnitInstance(boardSpace.unitPresence.unit, unit)) {
      foundMatchFacing = boardSpace.unitPresence.facing;
    } else {
      throw new Error('Unit is not present at the starting position');
    }
  } else if (hasEngagedUnits(boardSpace.unitPresence)) {
    const isPrimary = isSameUnitInstance(
      boardSpace.unitPresence.primaryUnit,
      unit,
    );
    const isSecondary = isSameUnitInstance(
      boardSpace.unitPresence.secondaryUnit,
      unit,
    );
    if (!isPrimary && !isSecondary) {
      throw new Error('Unit is not present at the starting position');
    }
    if (isPrimary) {
      foundMatchFacing = boardSpace.unitPresence.primaryFacing;
    } else if (isSecondary) {
      foundMatchFacing = getOppositeFacing(
        boardSpace.unitPresence.primaryFacing,
      );
    }
  }

  if (!foundMatchFacing || foundMatchFacing !== facing) {
    throw new Error('Unit facing mismatch');
  }

  // Get the spaces behind the starting position for validation
  const spacesBehind = getSpacesBehind(
    board,
    startingPosition.coordinate,
    startingPosition.facing,
  );

  // If there is an unengaged enemy unit facing us
  // in the spaces behind the starting position, we cannot retreat
  for (const space of spacesBehind) {
    const spaceUnitPresence = getBoardSpace(board, space).unitPresence;
    if (
      hasSingleUnit(spaceUnitPresence) &&
      !areSameSide(spaceUnitPresence.unit, unit)
    ) {
      // Single enemy unit found.
      // Check if it's facing us
      const frontSpaces = getFrontSpaces(
        board,
        space,
        spaceUnitPresence.facing,
      );
      if (frontSpaces.has(startingPosition.coordinate)) {
        // Enemy unit is facing us.
        // We cannot retreat.
        return new Set();
      }
    }
  }

  // If we get here, we can retreat.
  // Explore moves backwards from the starting position
  const exploredMoves = exploreUnitMoves(
    gameState,
    unitWithPlacement,
    'retreat',
  );

  // Convert the explored moves to an array for iteration.
  const legalRetreatsArray = Array.from(exploredMoves);

  // Find the moves with the lowest speed, then lowest flexibility.
  const minimumRetreats = new Set<MoveResult<TBoard>>();

  // Get the current speed and flexibility of the unit for iteration limits.
  const currentUnitSpeed = getCurrentUnitStat(unit, 'speed', gameState);
  const currentUnitFlexibility = getCurrentUnitStat(
    unit,
    'flexibility',
    gameState,
  );

  // Start with zero flexibility, up to the unit's flexibility limit.
  let foundMinimumRetreats = false;
  for (
    let flexibility = 0;
    flexibility <= currentUnitFlexibility && !foundMinimumRetreats;
    flexibility++
  ) {
    // Start with speed 1, up to the unit's speed limit.
    for (
      let speed = 1;
      speed <= currentUnitSpeed && !foundMinimumRetreats;
      speed++
    ) {
      // Find all moves with the current speed and flexibility level.
      const legalRetreats = legalRetreatsArray.filter(
        (r: MoveResult<TBoard>) =>
          r.speedUsed === speed && r.flexibilityUsed === flexibility,
      );
      // If we found any moves with the current speed and flexibility,
      // we add them to the minimum retreats set and exit both loops.
      if (legalRetreats.length > 0) {
        for (const retreat of legalRetreats) {
          minimumRetreats.add(retreat);
        }
        foundMinimumRetreats = true;
      }
    }
  }

  // Get the positions of the minimum retreats
  const minimumRetreatPositions = new Set<UnitPlacement<TBoard>>(
    Array.from(minimumRetreats).map((r) => r.placement),
  );

  // Return the minimum retreats
  return minimumRetreatPositions;
}
