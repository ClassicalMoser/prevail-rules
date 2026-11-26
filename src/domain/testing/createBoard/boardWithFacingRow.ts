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
  // One side, one facing: a rank dressed shoulder to shoulder, which is
  // what a line order reaches (§4.3.5) and what support counts along.
  const facing = options.facing ?? 'north';
  const playerSide = options.playerSide ?? 'black';

  // One unit per space, numbered in order along the row so none shares an
  // identity. Attack 3 is a stand-in: a row is about where its units
  // stand and which way they face, and no stat changes either.
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

  // The whole row goes on one standard board.
  const board = createBoardWithUnits(placed);

  // A spec names a unit by where it stands; asking for an empty space is a
  // mistake in the spec, so it throws.
  const unitAt = (coordinate: Coordinate): UnitWithPlacement => {
    const found = placed.find(
      (withPlacement) => withPlacement.placement.coordinate === coordinate,
    );
    if (found === undefined) {
      throw new Error(`Expected a unit at ${coordinate}`);
    }
    return found;
  };

  // The board, and the way to find each unit the row put on it.
  const row = { board, unitAt };
  return row;
}
