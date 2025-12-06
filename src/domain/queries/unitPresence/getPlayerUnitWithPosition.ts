import type {
  Board,
  BoardCoordinate,
  PlayerSide,
  UnitWithPlacement,
} from '@entities';
import { hasNoUnit, hasSingleUnit } from '@validation';
import { getBoardSpace } from '../boardSpace';
import { getOppositeFacing } from '../facings';
import { isFriendlyUnit } from '../unit';


/**
 * Extracts the friendly unit and its placement from a board space for a given player side.
 *
 * This function handles all three unit presence states:
 * - Empty space: returns `undefined`
 * - Single unit: returns unit if friendly, `undefined` if enemy
 * - Engaged units: returns the friendly unit (primary or secondary) with correct facing
 *
 * For engaged units, the secondary unit always faces opposite the primary unit.
 *
 * @param board - The board to check
 * @param coordinate - The coordinate of the board space
 * @param playerSide - The player side to find a friendly unit for
 * @returns A UnitWithPlacement if a friendly unit is found, or undefined if not
 * @throws {Error} If the coordinate doesn't exist on the board
 *
 * @example
 * ```typescript
 * // Find friendly unit at a position
 * const unit = getPlayerUnitWithPosition(board, "E-5", "black");
 * if (unit) {
 *   console.log(`Found ${unit.unit.unitType.name} at ${unit.placement.coordinate}`);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Handle engaged units
 * const unit = getPlayerUnitWithPosition(board, "E-5", "black");
 * // If black unit is secondary in engagement, facing will be opposite primary
 * ```
 */
export function getPlayerUnitWithPosition<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  playerSide: PlayerSide,
): UnitWithPlacement<TBoard> | undefined {
  const unitPresence = getBoardSpace(board, coordinate).unitPresence;

  // If there's no unit, return undefined
  if (hasNoUnit(unitPresence)) {
    return undefined;
  }

  // Handle single unit presence
  if (hasSingleUnit(unitPresence)) {
    if (isFriendlyUnit(unitPresence.unit, playerSide)) {
      return {
        unit: unitPresence.unit,
        placement: {
          coordinate,
          facing: unitPresence.facing,
        },
      };
    }
    // Enemy unit - return undefined
    return undefined;
  }

  // If not, units must be engaged; return the friendly unit
  // (primary or secondary) with correct facing
  else {
    // Check primary unit first
    if (isFriendlyUnit(unitPresence.primaryUnit, playerSide)) {
      return {
        unit: unitPresence.primaryUnit,
        placement: {
          coordinate,
          facing: unitPresence.primaryFacing,
        },
      };
    }
    // If the primary unit is not friendly, the secondary unit must be.
    // (There are only two sides, and friendly units cannot engage each other)
    else {
      return {
        unit: unitPresence.secondaryUnit,
        placement: {
          coordinate,
          facing: getOppositeFacing(unitPresence.primaryFacing),
        },
      };
    }
  }
}
