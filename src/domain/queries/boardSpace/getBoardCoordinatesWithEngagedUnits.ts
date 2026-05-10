import type { Board, BoardCoordinate } from '@entities';
import { hasEngagedUnits } from '@entities';
import { getBoardCoordinates } from './getBoardCoordinates';
import { getBoardSpace } from './getBoardSpace';

/**
 * Returns every board coordinate whose space has engaged units.
 */
export function getBoardCoordinatesWithEngagedUnits<TBoard extends Board>(
  board: TBoard,
): Set<BoardCoordinate<TBoard>> {
  const engagements = new Set<BoardCoordinate<TBoard>>();
  const coordinates = getBoardCoordinates(board);

  for (const coordinate of coordinates) {
    const space = getBoardSpace(board, coordinate);
    if (hasEngagedUnits(space.unitPresence)) {
      engagements.add(coordinate);
    }
  }

  return engagements;
}
