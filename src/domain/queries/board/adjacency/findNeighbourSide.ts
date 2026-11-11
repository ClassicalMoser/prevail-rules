import type { Board, Coordinate, UnitFacing } from '@entities';
import { getBackSpaces } from './getBackSpaces';
import { getFlankingSpaces } from './getFlankingSpaces';
import { getFrontSpaces } from './getFrontSpaces';

/**
 * Which side of a unit a neighbouring space lies on (§2.3.3): one of its
 * three front spaces, two flanking spaces at its shoulders, or three back
 * spaces. The answer drives the game's most consequential questions —
 * whether an engagement is legal and what kind it is (§6.2), and whether a
 * friend can lend support (§7.3).
 *
 * @param board - The board
 * @param coordinate - The space the unit stands on
 * @param facing - The way the unit faces
 * @param neighbour - The space being asked about
 * @returns `'front'`, `'flank'` or `'back'`, or `undefined` when the space is not next to the unit
 */
export function findNeighbourSide(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
  neighbour: Coordinate,
): 'front' | 'flank' | 'back' | undefined {
  if (getFrontSpaces(board, coordinate, facing).has(neighbour)) {
    return 'front';
  }
  if (getFlankingSpaces(board, coordinate, facing).has(neighbour)) {
    return 'flank';
  }
  if (getBackSpaces(board, coordinate, facing).has(neighbour)) {
    return 'back';
  }
  return undefined;
}
