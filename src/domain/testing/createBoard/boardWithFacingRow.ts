import type {
  Board,
  PlayerSide,
  UnitFacing,
  UnitWithPlacement,
} from '@entities';
import type { Coordinate } from '@ruleValues';
import { createTestUnits } from '@testing/unitHelpers';

import { createBoardWithUnits } from './boardWithUnits';

/**
 * A row of units of one side, all facing the same way.
 * `unitAt` returns the placement this helper wrote for that coordinate.
 *
 * @param options.coordinates - Spaces along the row, in order
 * @param options.facing - Facing for every unit (default north)
 * @param options.playerSide - Side that owns the row (default black)
 */
export function createBoardWithFacingRow(options: {
  coordinates: readonly Coordinate[];
  facing?: UnitFacing;
  playerSide?: PlayerSide;
}): {
  board: Board;
  unitAt: (coordinate: Coordinate) => UnitWithPlacement;
} {
  const facing = options.facing ?? 'north';
  const playerSide = options.playerSide ?? 'black';
  const units = createTestUnits(playerSide, options.coordinates.length, {
    attack: 3,
  });
  const placed = options.coordinates.map((coordinate, index) => {
    const withPlacement: UnitWithPlacement = {
      placement: { coordinate, facing },
      unit: units[index],
    };
    return withPlacement;
  });
  const board = createBoardWithUnits(placed);
  const unitAt = (coordinate: Coordinate): UnitWithPlacement => {
    const found = placed.find(
      (withPlacement) => withPlacement.placement.coordinate === coordinate,
    );
    if (found === undefined) {
      throw new Error(`Expected a unit at ${coordinate}`);
    }
    return found;
  };
  const row = { board, unitAt };
  return row;
}
