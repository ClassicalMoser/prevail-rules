import type { Board } from '@entities';
import type { PhaseState } from '@game';

/**
 * Creates a new phase state with `step` set to `"complete"`.
 *
 * Uses two type parameters so the **concrete phase branch** is preserved (play cards,
 * issue commands + board, resolve melee + board, cleanup, etc.). A single
 * `PhaseState` return widens spatial phases and breaks callers that need
 * `ResolveMeleePhaseState` (and similar).
 *
 * The `as TPhase` assertion matches the domain rule that every phase allows a `complete`
 * step; the spread alone does not prove that to TypeScript for generic `TPhase`.
 *
 * @param phaseState - The current phase state
 * @returns The same phase branch with `step: "complete"`
 */
export function markPhaseAsComplete<
  TBoard extends Board,
  TPhase extends PhaseState,
>(phaseState: TPhase): TPhase {
  const completedPhase: TPhase = { ...phaseState, step: 'complete' };
  return completedPhase;
}
