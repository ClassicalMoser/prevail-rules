import type {
  Board,
  Coordinate,
  PlayerSide,
  UnitFacing,
  UnitWithPlacement,
} from '@entities';
import { createTestUnit } from '@testing/unitHelpers';

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
  const placed = options.coordinates.map((coordinate, index) => {
    const unit = createTestUnit(playerSide, {
      attack: 3,
      instanceNumber: index + 1,
    });
    const withPlacement: UnitWithPlacement = {
      placement: { coordinate, facing },
      unit,
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
