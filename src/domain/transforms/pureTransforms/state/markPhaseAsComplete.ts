import type { PhaseState } from '@game';

/**
 * Creates a new phase state with `step` set to `"complete"`.
 *
 * Uses a type parameter so the **concrete phase branch** is preserved (play cards,
 * issue commands, resolve melee, cleanup, etc.). A single
 * {@link PhaseState} return widens spatial phases and breaks callers that need
 * `ResolveMeleePhaseState` (and similar).
 *
 * The `as TPhase` assertion matches the domain rule that every phase allows a `complete`
 * step; the spread alone does not prove that to TypeScript for generic `TPhase`.
 *
 * @param phaseState - The current phase state
 * @returns The same phase branch with `step: "complete"`
 */
// TODO(misleading): the header speaks of an `as TPhase` assertion; the code
// has none, and the annotation alone compiles. Settle by dropping that
// paragraph.
export function markPhaseAsComplete<TPhase extends PhaseState>(
  phaseState: TPhase,
): TPhase {
  // The phase is over: a round runs its five phases in order, and the next
  // begins once this one is complete (§4). Every other field stays, so the
  // completed phase still records how it was resolved.
  const completedPhase: TPhase = { ...phaseState, step: 'complete' };

  // The same phase, at its end.
  return completedPhase;
}
