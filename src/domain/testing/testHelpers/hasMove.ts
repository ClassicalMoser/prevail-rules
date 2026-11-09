import type { Coordinate, UnitFacing, UnitPlacement } from '@entities';

/**
 * Whether a set of legal moves includes one ending on a coordinate (and,
 * when given, a facing). Specs ask this of the endings a move search
 * returns; the cost and path of the ending do not matter to the question.
 *
 * @param legalMoves - Legal moves, each ending on a placement
 * @param coordinate - The space a move should end on
 * @param facing - The facing it should end with, if that matters
 * @returns Whether any legal move ends there
 */
export function hasMove(
  legalMoves: Set<{ placement: UnitPlacement }>,
  coordinate: Coordinate,
  facing?: UnitFacing,
): boolean {
  const found = [...legalMoves].some(
    (move) =>
      move.placement.coordinate === coordinate &&
      (facing === undefined || move.placement.facing === facing),
  );
  return found;
}
