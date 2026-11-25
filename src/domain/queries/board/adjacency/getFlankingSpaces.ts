import type { Board, Coordinate, UnitFacing } from '@entities';
import { getOrthogonalFacings } from '@queries/facings';
import { getSpacesInDirections } from './getSpacesInDirections';

/**
 * Get the flanking spaces for a given coordinate and facing,
 * the spaces directly to the right and left of the facing
 *
 * The two flanking spaces of §2.3.2. A friend that has the fighter in one of
 * these lends +1 melee support (§7.3.1), and an engagement from one is
 * always allowed (§6.2.1); both are asked through `findNeighbourSide`.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the flanking spaces for
 * @param facing - The facing to get the flanking spaces for
 * @returns A set of the flanking space coordinates (up to 2 spaces, directly to the right and left)
 */
export function getFlankingSpaces(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Set<Coordinate> {
  // A unit's flanks lie 90° to either side of the way it faces.
  const flankingSpaces = getSpacesInDirections(
    board,
    coordinate,
    getOrthogonalFacings(facing),
  );

  // Fewer than two where a flank rests on the board edge.
  return flankingSpaces;
}
