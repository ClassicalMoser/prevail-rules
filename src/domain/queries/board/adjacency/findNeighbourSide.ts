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
 * TODO(misleading): the three groups are §2.3.2; §2.3.3 is the region behind
 * a unit, a different thing. Settle by citing §2.3.2.
 *
 * TODO(composition): this builds three sets of up to three spaces to place
 * one neighbour. The step facing from the unit to the neighbour
 * (`findStepFacing`) set against the unit's facing gives the side by
 * arithmetic: the same or 45° off is front, 90° is flank, the rest back.
 * Settle whether that replaces the sets; it is asked once per supporter and
 * per engaging step.
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
  // One of the three spaces it faces: a friend looking at the fight lends
  // +2, and an enemy must square up head on to engage from here.
  if (getFrontSpaces(board, coordinate, facing).has(neighbour)) {
    return 'front';
  }

  // One of the two at its shoulders: a friend side-on lends +1, and an
  // engagement from here is always allowed.
  if (getFlankingSpaces(board, coordinate, facing).has(neighbour)) {
    return 'flank';
  }

  // One of the three behind it: a friend looking away lends nothing, and an
  // enemy may engage from here only if it began its move behind the unit.
  if (getBackSpaces(board, coordinate, facing).has(neighbour)) {
    return 'back';
  }

  // Not one of its eight neighbours, so on no side of it.
  return undefined;
}
