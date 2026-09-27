import type { Board, Coordinate, UnitFacing } from '@entities';
import { getFrontSpaces } from '../adjacency';
import { filterUndefinedSpaces } from '../filterUndefinedSpaces';

export function getSpacesInArc(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
  range: number,
): Set<Coordinate> {
  // Start with the origin space
  const spacesInArc = new Set<Coordinate>([coordinate]);
  // Add the spaces in front of the origin space
  for (let i = 0; i < range; i++) {
    // Iterate forward by spaces in front, up to the range.
    const currentSpacesInArc = [...spacesInArc];
    for (const space of currentSpacesInArc) {
      // Get the spaces in front of the current space
      const spacesInFront = getFrontSpaces(board, space, facing);
      // Add the spaces in front of the current space to the set
      for (const space of spacesInFront) {
        spacesInArc.add(space);
      }
    }
  }
  // Remove the origin space
  spacesInArc.delete(coordinate);
  // Filter out undefined values
  const validSpacesInArc = filterUndefinedSpaces(spacesInArc);
  // Return the set of valid spaces in the arc
  return validSpacesInArc;
}
