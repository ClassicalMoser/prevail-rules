import type { MoveDelta } from '@entities';

/**
 * Whether two paths are the same move, step for step and turn for turn.
 *
 * A path is the identity of a move: a retreat choice names one of the
 * offered retreats by its path, and is matched back to it here.
 *
 * @param first - One path
 * @param second - The other
 * @returns Whether they make the same moves in the same order
 */
export function isSameMovePath(
  first: readonly MoveDelta[],
  second: readonly MoveDelta[],
): boolean {
  const same =
    first.length === second.length &&
    first.every((delta, index) => delta === second[index]);
  return same;
}
