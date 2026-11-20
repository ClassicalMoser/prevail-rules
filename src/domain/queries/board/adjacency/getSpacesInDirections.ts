import type { Board, Coordinate, UnitFacing } from '@entities';
import { findForwardSpace } from '../steps/findForwardSpace';

/**
 * The spaces one step from a space in each of some directions, leaving out
 * any that would be off the board.
 *
 * Every neighbourhood the rules name is this, for a different set of
 * directions: all eight around a space (`getAdjacentSpaces`), the three a
 * unit faces (`getFrontSpaces`), the two at its sides (`getFlankingSpaces`),
 * the four straight or four diagonal neighbours. A space by the board edge
 * simply has fewer.
 *
 * @param board - The board the space is on
 * @param coordinate - The space to look out from
 * @param directions - The ways to look, one step each
 * @returns The spaces found, each once
 */
export function getSpacesInDirections(
  board: Board,
  coordinate: Coordinate,
  directions: Iterable<UnitFacing>,
): Set<Coordinate> {
  const spaces = new Set<Coordinate>();

  for (const direction of directions) {
    // One step that way; past the board edge there is nothing to add.
    const space = findForwardSpace(board, coordinate, direction);
    if (space !== undefined) {
      spaces.add(space);
    }
  }

  // Each neighbour in those directions that is on the board.
  return spaces;
}
