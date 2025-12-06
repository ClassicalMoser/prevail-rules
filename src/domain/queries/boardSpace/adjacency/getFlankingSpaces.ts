import type { Board, BoardCoordinate, UnitFacing } from '@entities';
import { getOrthogonalFacings } from '../../facings';
import { filterUndefinedSpaces } from '../filterUndefinedSpaces';
import { getForwardSpace } from '../getForwardSpace';


/**
 * Get the flanking spaces for a given coordinate and facing,
 * the spaces directly to the right and left of the facing
 * @param board - The board object
 * @param coordinate - The coordinate to get the flanking spaces for
 * @param facing - The facing to get the flanking spaces for
 * @returns A set of the flanking space coordinates (up to 2 spaces, directly to the right and left)
 */
export function getFlankingSpaces<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  facing: UnitFacing,
): Set<BoardCoordinate<TBoard>> {
  // Get orthogonal facings to get the flanking directions
  const orthogonalFacings = [...getOrthogonalFacings(facing)];
  // Set of coordinates and undefined values
  const flankingSpaces = new Set(
    orthogonalFacings.map((facing) =>
      getForwardSpace(board, coordinate, facing),
    ),
  );
  // Filter out undefined values
  const validFlankingSpaces = filterUndefinedSpaces(flankingSpaces);
  // Return set of valid flanking spaces
  return validFlankingSpaces;
}
