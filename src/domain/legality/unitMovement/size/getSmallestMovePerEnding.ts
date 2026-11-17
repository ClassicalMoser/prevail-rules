import { isSamePlacement } from '@queries';
import type { MoveResult } from '../explore';
import { compareMoveSize } from './compareMoveSize';

/**
 * The smallest way to each ending a move may reach: one move per space and
 * facing, the one with the fewest turns, then the fewest steps.
 *
 * Every path to an ending stays legal, and the legal options offer them all;
 * a player may take the long way round. A player who has chosen only where
 * the unit should end wants the plain way there, and this gives it, so that
 * a bot or a client picking an ending does not send a path that wheels and
 * wanders on the way. Where two ways tie for smallest, the first one found
 * is kept.
 *
 * @param moves - Every legal ending of a move, each with its cost and path, as a list or a set
 * @returns One move per ending, the smallest, in the order each ending first appears
 */
export function getSmallestMovePerEnding(
  moves: Iterable<MoveResult>,
): MoveResult[] {
  const smallest: MoveResult[] = [];

  for (const move of moves) {
    // An ending is a space and a facing; find this one if it is already kept.
    const kept = smallest.find((other) =>
      isSamePlacement(other.placement, move.placement),
    );

    // The first way found to an ending is kept until a smaller one turns up.
    if (kept === undefined) {
      smallest.push(move);
      continue;
    }

    // A strictly smaller way replaces it; a tie keeps the first.
    if (compareMoveSize(move, kept) < 0) {
      smallest[smallest.indexOf(kept)] = move;
    }
  }

  // One way to each ending, the plainest.
  return smallest;
}
