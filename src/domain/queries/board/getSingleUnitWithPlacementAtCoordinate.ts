import type { Board, Coordinate, UnitWithPlacement } from '@entities';
import { getBoardSpace } from './getBoardSpace';
import { hasSingleUnit } from '@queries/unitPresence';

/**
 * Unit with placement at a coordinate when the space holds exactly one unit.
 * Trust-first: callers only invoke when board state already guarantees a lone defender.
 */
export function getSingleUnitWithPlacementAtCoordinate(
  board: Board,
  coordinate: Coordinate,
): UnitWithPlacement {
  // The space a move has just entered, where the defender stands.
  const space = getBoardSpace(board, coordinate);

  // An engagement begins only on a space held by a single enemy unit (§5.3,
  // §6.1.1); an empty or already engaged space here is a fault upstream.
  if (!hasSingleUnit(space.unitPresence)) {
    throw new Error('Expected exactly one unit at coordinate');
  }

  // The defender, and the way it faces, which decides the kind of
  // engagement (§6.3.1).
  return {
    placement: {
      coordinate,
      facing: space.unitPresence.facing,
    },
    unit: space.unitPresence.unit,
  };
}
