import type { StandardBoardCoordinate, UnitFacing } from '@entities';

/**
 * Checks if a coordinate (and optionally facing) is present in a set of legal moves.
 */
export function hasMove(
  legalMoves: Set<{ coordinate: string; facing: UnitFacing }>,
  coordinate: StandardBoardCoordinate,
  facing?: UnitFacing,
): boolean {
  return [...legalMoves].some(
    (move) =>
      move.coordinate === coordinate &&
      (facing === undefined || move.facing === facing),
  );
}
