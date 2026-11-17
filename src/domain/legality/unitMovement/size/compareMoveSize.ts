import type { MoveResult } from '../explore';

/**
 * Orders two moves by size, smaller first: the fewer facing changes, then
 * the fewer steps. This is the measure a retreat must keep to (§9.1.3), and
 * the one a player means by the plain way to an ending: no turn spent that
 * could be saved, then no step.
 *
 * @param a - One move
 * @param b - The other
 * @returns Below zero when `a` is smaller, above zero when `b` is, and zero when they are the same size
 */
export function compareMoveSize(a: MoveResult, b: MoveResult): number {
  // Fewer turns first: a unit should not wheel when it need not.
  const turns = a.flexibilityUsed - b.flexibilityUsed;
  if (turns !== 0) {
    return turns;
  }

  // Then fewer steps: no further than it must go.
  const steps = a.speedUsed - b.speedUsed;
  return steps;
}
