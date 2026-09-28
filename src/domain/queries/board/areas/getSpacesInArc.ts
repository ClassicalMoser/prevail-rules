import type { Board, Coordinate, UnitFacing } from '@entities';
import { getFrontSpaces } from '../adjacency';
/**
 * For ranged attacks, get the spaces in the arc of the facing, up to a given range.
 * @param board - The board object
 * @param coordinate - The coordinate to get the spaces in the arc for
 * @param facing - The facing to get the spaces in the arc for
 * @param range - The range of the arc
 * @returns A set of the space coordinates in the arc
 */
export function getSpacesInArc(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
  range: number,
): Set<Coordinate> {
  const spacesInArc = new Set<Coordinate>();
  // The origin starts the walk. It is not part of the arc.
  let rank = new Set<Coordinate>([coordinate]);

  // Step forward one rank at a time, up to the range.
  for (let step = 0; step < range; step++) {
    const nextRank = new Set<Coordinate>();
    for (const space of rank) {
      // Front spaces are already on the board.
      const spacesInFront = getFrontSpaces(board, space, facing);
      // Add the spaces in front of the current space to the set
      for (const spaceInFront of spacesInFront) {
        if (spacesInArc.has(spaceInFront)) {
          continue;
        }
        spacesInArc.add(spaceInFront);
        nextRank.add(spaceInFront);
      }
    }
    rank = nextRank;
  }

  return spacesInArc;
}
