import type { Board, Coordinate, UnitFacing } from '@entities';
import { getFrontSpaces } from '../adjacency';

/**
 * For ranged attacks, get the spaces in the arc of the facing, up to a given range.
 *
 * The forward arc of §2.4.3: the shooter's three front spaces, then the front
 * spaces of each of those, out to its Range, a widening cone without the
 * shooter's own space. A target must stand in it (§7.4.2,
 * `canUnitRangedAttackTarget`).
 *
 * TODO(composition): the only caller asks whether one target is in the arc,
 * yet this builds the whole cone. For an orthogonal facing a space is in it
 * when it lies 1 to Range rows ahead and no further to the side than ahead;
 * for a diagonal, when it lies 0 to Range steps along each of the facing's
 * two directions and is not the shooter's own space. Settle whether that
 * arithmetic replaces the set.
 *
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
        // A space two ranks share is walked on from once. Dropping this
        // skip changes no answer, only the work, so a mutant removing it is
        // equivalent.
        if (spacesInArc.has(spaceInFront)) {
          continue;
        }
        spacesInArc.add(spaceInFront);
        nextRank.add(spaceInFront);
      }
    }
    rank = nextRank;
  }

  // Every space the shooter can reach at this Range, the board edge cutting
  // the cone short.
  return spacesInArc;
}
