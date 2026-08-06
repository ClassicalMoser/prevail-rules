import type { Board, Coordinate } from '@entities';
import { hasEngagedUnits } from '@entities';
import { getBoardCoordinates } from './getBoardCoordinates';
import { getBoardSpace } from './getBoardSpace';

/**
 * Returns every board coordinate whose space has engaged units.
 */
export function getBoardCoordinatesWithEngagedUnits(
  board: Board,
): Set<Coordinate> {
  const engagements = new Set<Coordinate>();
  const coordinates = getBoardCoordinates(board);

  for (const coordinate of coordinates) {
    const space = getBoardSpace(board, coordinate);
    if (hasEngagedUnits(space.unitPresence)) {
      engagements.add(coordinate);
    }
  }

  return engagements;
}
