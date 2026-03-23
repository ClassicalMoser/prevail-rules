import type { Board, BoardCoordinate, UnitWithPlacement } from '@entities';
import { hasSingleUnit } from '@entities';
import { getBoardSpace } from './getBoardSpace';

/**
 * Unit with placement at a coordinate when the space holds exactly one unit.
 * Trust-first: callers only invoke when board state already guarantees a lone defender.
 */
export function getSingleUnitWithPlacementAtCoordinate<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
): UnitWithPlacement<TBoard> {
  const space = getBoardSpace(board, coordinate);
  if (!hasSingleUnit(space.unitPresence)) {
    throw new Error('Expected exactly one unit at coordinate');
  }
  return {
    unit: space.unitPresence.unit,
    placement: {
      coordinate,
      facing: space.unitPresence.facing,
    },
  };
}
