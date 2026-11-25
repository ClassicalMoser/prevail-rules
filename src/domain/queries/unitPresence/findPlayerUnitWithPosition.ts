import type {
  Board,
  Coordinate,
  PlayerSide,
  UnitWithPlacement,
} from '@entities';
import { getBoardSpace } from '../board/getBoardSpace';
import { getOppositeFacing } from '@queries/facings';
import { isFriendlyUnit } from '../unit/isFriendlyUnit';
import { hasNoUnit } from './hasNoUnit';
import { hasSingleUnit } from './hasSingleUnit';

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
 * TODO(misleading): this answers a `UnitWithPlacement`, the unit with its
 * space and facing, so "position" says less than it returns. Settled by a
 * name that says placement, with `findPositionOfUnit` and `getPositionOfUnit`.
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
 * const unit = findPlayerUnitWithPosition(board, "E-5", "black");
 * if (unit) {
 *   console.log(`Found ${unit.unit.unitType.name} at ${unit.placement.coordinate}`);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Handle engaged units
 * const unit = findPlayerUnitWithPosition(board, "E-5", "black");
 * // If black unit is secondary in engagement, facing will be opposite primary
 * ```
 */
export function findPlayerUnitWithPosition(
  board: Board,
  coordinate: Coordinate,
  playerSide: PlayerSide,
): UnitWithPlacement | undefined {
  const { unitPresence } = getBoardSpace(board, coordinate);

  // If there's no unit, return undefined
  if (hasNoUnit(unitPresence)) {
    return undefined;
  }

  // Handle single unit presence
  if (hasSingleUnit(unitPresence)) {
    if (isFriendlyUnit(unitPresence.unit, playerSide)) {
      // One of ours, facing as it stands.
      return {
        placement: {
          coordinate,
          facing: unitPresence.facing,
        },
        unit: unitPresence.unit,
      };
    }
    // Enemy unit - return undefined
    return undefined;
  }
  // Primary first. Its facing is the engagement's primary facing.
  if (isFriendlyUnit(unitPresence.primaryUnit, playerSide)) {
    // The primary is ours, facing the way the space stores.
    return {
      placement: {
        coordinate,
        facing: unitPresence.primaryFacing,
      },
      unit: unitPresence.primaryUnit,
    };
  }
  // Otherwise the secondary is returned, facing opposite the primary.
  // Its side is not checked.
  const secondary: UnitWithPlacement = {
    placement: {
      coordinate,
      facing: getOppositeFacing(unitPresence.primaryFacing),
    },
    unit: unitPresence.secondaryUnit,
  };

  // The secondary: two engaged units are enemies, so it is ours.
  return secondary;
}
