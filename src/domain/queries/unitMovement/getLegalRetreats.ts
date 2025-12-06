import type {
  Board,
  BoardCoordinate,
  UnitInstance,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import { hasNoUnit, hasSingleUnit } from '@validation';
import { getBoardSpace, getFrontSpaces, getRearwardSpace, getSpacesBehind } from '../boardSpace';
import { areSameSide } from '../unit';
import { getPlayerUnitWithPosition } from '../unitPresence';
import { exploreMoves } from './exploreMoves';


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
 * @param unit - The unit to find retreat moves for (must be engaged)
 * @param board - The board state
 * @param startingPosition - The current position and facing of the unit
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
  unit: UnitInstance,
  board: TBoard,
  startingPosition: UnitPlacement<TBoard>,
): Set<UnitWithPlacement<TBoard>> {
  // Validate starting position - unit must be present (engaged or single)
  const unitWithPlacement = getPlayerUnitWithPosition(
    board,
    startingPosition.coordinate,
    unit.playerSide,
  );
  if (!unitWithPlacement || unitWithPlacement.unit !== unit) {
    throw new Error('Unit is not present at the starting position');
  }
  if (unitWithPlacement.placement.facing !== startingPosition.facing) {
    throw new Error('Reported facing is inaccurate');
  }

  // Get the spaces behind the starting position for validation
  const spacesBehind = getSpacesBehind(
    board,
    startingPosition.coordinate,
    startingPosition.facing,
  );

  // If there is an enemy unit facing us in the spaces behind the starting position,
  // we cannot retreat
  for (const space of spacesBehind) {
    const spaceUnitPresence = getBoardSpace(board, space).unitPresence;
    // Single unit found
    if (
      hasSingleUnit(spaceUnitPresence) &&
      !areSameSide(spaceUnitPresence.unit, unit)
    ) {
      // Single unit is an enemy - check if it's facing us
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

  // Track found retreats at current cost level
  const foundRetreats = new Set<UnitPlacement<TBoard>>();

  // Explore by increasing cost: try flexibility=0, speed=1, then speed=2, etc.
  // Then try flexibility=1, speed=1, etc.
  for (
    let maxFlexibility = 0;
    maxFlexibility <= unit.unitType.flexibility;
    maxFlexibility++
  ) {
    for (let maxSpeed = 1; maxSpeed <= unit.unitType.speed; maxSpeed++) {
      // Clear found retreats for this cost level
      foundRetreats.clear();

      // Capture maxFlexibility and maxSpeed in closure for callbacks
      const targetFlexibility = maxFlexibility;
      const targetSpeed = maxSpeed;

      const canEndAt = (
        u: UnitInstance,
        b: TBoard,
        coord: BoardCoordinate<TBoard>,
      ) => {
        // Ending position must be behind starting position and facing
        if (!spacesBehind.has(coord)) {
          return false;
        }
        const space = getBoardSpace(b, coord);
        // Retreats cannot engage enemies - only empty spaces are valid
        return hasNoUnit(space.unitPresence);
      };

      const shouldContinueExploring = (
        flexibilityUsed: number,
        speedUsed: number,
      ) => {
        // Only explore paths that could reach exactly our target cost level
        // Stop if we've exceeded the cost limits for this search
        return (
          flexibilityUsed <= targetFlexibility &&
          (flexibilityUsed < targetFlexibility || speedUsed <= targetSpeed)
        );
      };

      const onValidDestination = (
        placement: UnitPlacement<TBoard>,
        flexibilityUsed: number,
        speedUsed: number,
        previousCoordinate: BoardCoordinate<TBoard> | undefined,
        _remainingFlexibility: number,
      ) => {
        // Retreat requires movement: Only add if we've moved (not starting position)
        if (previousCoordinate === undefined) {
          return;
        }

        // Collect the valid retreat
        foundRetreats.add(placement);
      };

      // Explore at this cost level
      exploreMoves(unit, board, startingPosition, {
        getSpaceInDirection: getRearwardSpace,
        canEndAt,
        shouldContinueExploring,
        onValidDestination,
      });

      // If we found retreats at this cost level, return them immediately
      if (foundRetreats.size > 0) {
        return new Set(
          Array.from(foundRetreats).map(
            (placement) =>
              ({
                unit,
                placement,
              }) as UnitWithPlacement<TBoard>,
          ),
        );
      }
    }
  }

  // No retreats found
  return new Set();
}
