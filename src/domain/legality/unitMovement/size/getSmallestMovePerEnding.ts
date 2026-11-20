import type { MoveResult } from '../explore';
import { compareMoveSize } from './compareMoveSize';

/**
 * The smallest way to each ending a move may reach: one move per space and
 * facing, the one with the fewest turns, then the fewest steps.
 *
 * Every path to an ending stays legal: a player may take the long way round,
 * and a submitted path is checked a part at a time. But where a move ends is
 * what a player chooses, and what it leaves unspent is never read again, so
 * the legal options offer only the plain way to each ending
 * (`getLegalUnitMoves`), and a retreat's choices are its smallest
 * (`getSmallestRetreats`). Where two ways tie for smallest, the first one
 * found is kept.
 *
 * @param moves - Every legal ending of a move, each with its cost and path, as a list or a set
 * @returns One move per ending, the smallest, in the order each ending first appears
 */
export function getSmallestMovePerEnding(
  moves: Iterable<MoveResult>,
): MoveResult[] {
  // The way kept so far to each ending, an ending being a space and a
  // facing. A map keeps each ending where it first appeared, even when a
  // smaller way replaces the one kept.
  const smallest = new Map<string, MoveResult>();

  for (const move of moves) {
    const ending = `${move.placement.coordinate}|${move.placement.facing}`;
    const kept = smallest.get(ending);

    // The first way found to an ending is kept until a smaller one turns up.
    if (kept === undefined) {
      smallest.set(ending, move);
      continue;
    }

    // A strictly smaller way replaces it; a tie keeps the first.
    if (compareMoveSize(move, kept) < 0) {
      smallest.set(ending, move);
    }
  }

  // One way to each ending, the plainest.
  const onePerEnding = [...smallest.values()];
  return onePerEnding;
}
